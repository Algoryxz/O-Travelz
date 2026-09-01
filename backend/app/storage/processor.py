"""Image validation and variant processing using Pillow."""
from __future__ import annotations

import io
from typing import Dict, Tuple
from PIL import Image, ImageOps


class ImageProcessingError(Exception):
    """Raised when image decoding or processing fails."""
    pass


class ImageProcessor:
    """Validates image integrity and generates standardized WebP variants."""

    # Strict A1 format policy: JPEG (including MPO), PNG, and WebP only
    SUPPORTED_FORMATS = {"JPEG", "PNG", "WEBP", "MPO"}

    # Target variant dimensions (max_width, max_height)
    VARIANT_SIZES: Dict[str, Tuple[int, int]] = {
        "original": (1920, 1080),
        "hero": (1280, 720),
        "card": (640, 480),
        "thumbnail": (320, 240),
    }

    # Pillow decompression bomb limit (50 megapixels)
    MAX_PIXELS = 50_000_000

    def __init__(
        self,
        min_width: int = 100,
        min_height: int = 100,
        min_aspect_ratio: float = 0.5,
        max_aspect_ratio: float = 3.0,
    ):
        self.min_width = min_width
        self.min_height = min_height
        self.min_aspect_ratio = min_aspect_ratio
        self.max_aspect_ratio = max_aspect_ratio
        Image.MAX_IMAGE_PIXELS = self.MAX_PIXELS

    def validate_and_open(self, data: bytes) -> Tuple[Image.Image, str, int, int]:
        """Validate raw bytes and return normalized Pillow Image, format, width, and height."""
        if not data or len(data) < 32:
            raise ImageProcessingError("Image byte stream is empty or too short.")

        # HTML / non-image text sniffing guard
        prefix = data[:256].lower()
        if any(tag in prefix for tag in (b"<html", b"<!doctype html", b"<?xml", b"<svg", b"<!doctype")):
            raise ImageProcessingError("Non-image document (HTML/XML/SVG) detected in image stream.")

        try:
            stream = io.BytesIO(data)
            img = Image.open(stream)
            img_format = img.format or "UNKNOWN"

            # Check format against strict A1 allowed formats
            if img_format not in self.SUPPORTED_FORMATS:
                raise ImageProcessingError(
                    f"Unsupported image format '{img_format}'. Allowed: {sorted(list(self.SUPPORTED_FORMATS))}"
                )

            # Auto-rotate based on EXIF tag if present
            img = ImageOps.exif_transpose(img) or img

            width, height = img.size
            if width < self.min_width or height < self.min_height:
                raise ImageProcessingError(
                    f"Image dimensions ({width}x{height}) below minimum required ({self.min_width}x{self.min_height})."
                )

            # Aspect ratio check (0.5 <= w/h <= 3.0)
            if height > 0:
                aspect_ratio = width / height
                if not (self.min_aspect_ratio <= aspect_ratio <= self.max_aspect_ratio):
                    raise ImageProcessingError(
                        f"Image aspect ratio {aspect_ratio:.2f} ({width}x{height}) outside allowed range "
                        f"[{self.min_aspect_ratio}, {self.max_aspect_ratio}]."
                    )

            # Convert to RGB / RGBA if palletized or special mode
            if img.mode in ("P", "1", "LA", "PA"):
                img = img.convert("RGBA" if "A" in img.mode else "RGB")
            elif img.mode not in ("RGB", "RGBA"):
                img = img.convert("RGB")

            return img, img_format, width, height
        except ImageProcessingError:
            raise
        except Image.DecompressionBombError as e:
            raise ImageProcessingError(f"Image exceeds maximum pixel decompression threshold: {e}") from e
        except Exception as e:
            raise ImageProcessingError(f"Corrupt or invalid image data: {e}") from e

    def generate_variants(
        self,
        img: Image.Image,
        quality: int = 80,
    ) -> Dict[str, Tuple[bytes, int, int]]:
        """Generate standardized WebP variants while strictly preserving aspect ratio.

        Returns dict mapping variant_name -> (webp_bytes, width, height).
        """
        orig_w, orig_h = img.size
        variants: Dict[str, Tuple[bytes, int, int]] = {}

        for variant_name, (max_w, max_h) in self.VARIANT_SIZES.items():
            variant_img = img.copy()

            if variant_name != "original" or (orig_w > max_w or orig_h > max_h):
                variant_img.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)

            vw, vh = variant_img.size
            buffer = io.BytesIO()

            # Save as WebP with optimized compression
            variant_img.save(
                buffer,
                format="WEBP",
                quality=quality if variant_name != "original" else 90,
                method=4,
            )

            variants[variant_name] = (buffer.getvalue(), vw, vh)

        return variants
