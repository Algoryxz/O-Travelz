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

    SUPPORTED_FORMATS = {"JPEG", "PNG", "WEBP", "TIFF", "BMP"}

    # Target variant dimensions (max_width, max_height)
    VARIANT_SIZES: Dict[str, Tuple[int, int]] = {
        "original": (1920, 1080),
        "hero": (1280, 720),
        "card": (640, 480),
        "thumbnail": (320, 240),
    }

    def __init__(self, min_width: int = 100, min_height: int = 100):
        self.min_width = min_width
        self.min_height = min_height

    def validate_and_open(self, data: bytes) -> Tuple[Image.Image, str, int, int]:
        """Validate raw bytes and return normalized Pillow Image, format, width, and height."""
        if not data or len(data) < 32:
            raise ImageProcessingError("Image byte stream is empty or too short.")

        try:
            stream = io.BytesIO(data)
            img = Image.open(stream)
            img_format = img.format or "UNKNOWN"

            if img_format not in self.SUPPORTED_FORMATS:
                raise ImageProcessingError(
                    f"Unsupported image format '{img_format}'. Allowed: {self.SUPPORTED_FORMATS}"
                )

            # Auto-rotate based on EXIF tag if present
            img = ImageOps.exif_transpose(img) or img

            width, height = img.size
            if width < self.min_width or height < self.min_height:
                raise ImageProcessingError(
                    f"Image dimensions ({width}x{height}) below minimum required ({self.min_width}x{self.min_height})."
                )

            # Convert to RGB / RGBA if palletized or special mode
            if img.mode in ("P", "1", "LA", "PA"):
                img = img.convert("RGBA" if "A" in img.mode else "RGB")
            elif img.mode not in ("RGB", "RGBA"):
                img = img.convert("RGB")

            return img, img_format, width, height
        except ImageProcessingError:
            raise
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
