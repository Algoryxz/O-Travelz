"""Source image downloader abstraction with size limits and offline test support."""
from __future__ import annotations

import io
from pathlib import Path
from typing import Dict, Optional, Protocol
import httpx



class DownloadError(Exception):
    """Raised when an image fails to download."""
    pass


class ImageDownloader(Protocol):
    """Protocol for fetching source image bytes."""

    def fetch_image(self, url: str) -> bytes:
        """Retrieve raw bytes for an image URL."""
        ...


class HttpImageDownloader:
    """Production HTTP downloader with timeout, redirect limits, and max size checks."""

    def __init__(
        self,
        timeout_seconds: float = 15.0,
        max_size_bytes: int = 15 * 1024 * 1024,  # 15MB limit
    ):
        self.timeout_seconds = timeout_seconds
        self.max_size_bytes = max_size_bytes

    def fetch_image(self, url: str) -> bytes:
        # Check local file URI or path first
        if url.startswith("file://"):
            local_path = url[7:]
            if len(local_path) > 3 and local_path[0] == "/" and local_path[2] == ":":
                local_path = local_path[1:]
            path_obj = Path(local_path)
            if not path_obj.is_file():
                raise DownloadError(f"Local file not found: {url}")
            return path_obj.read_bytes()

        if not url.startswith("http://") and not url.startswith("https://"):
            path_obj = Path(url)
            if path_obj.is_file():
                return path_obj.read_bytes()


        headers = {
            "User-Agent": "OTravelz-Destination-Ingestion/1.0 (https://o-travelz.com; contact@o-travelz.com) httpx/0.27.2",
            "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
        }
        try:
            with httpx.Client(timeout=self.timeout_seconds, follow_redirects=True, headers=headers) as client:
                with client.stream("GET", url) as response:
                    if response.status_code != 200:
                        raise DownloadError(
                            f"HTTP {response.status_code} while fetching {url}"
                        )
                    content_length = response.headers.get("Content-Length")
                    if content_length and int(content_length) > self.max_size_bytes:
                        raise DownloadError(
                            f"Image size {content_length} bytes exceeds limit {self.max_size_bytes}"
                        )

                    buffer = io.BytesIO()
                    bytes_read = 0
                    for chunk in response.iter_bytes(chunk_size=65536):
                        bytes_read += len(chunk)
                        if bytes_read > self.max_size_bytes:
                            raise DownloadError(
                                f"Downloaded bytes exceeded limit {self.max_size_bytes}"
                            )
                        buffer.write(chunk)

                    data = buffer.getvalue()
                    if not data:
                        raise DownloadError(f"Empty response body from {url}")
                    return data
        except DownloadError:
            raise
        except Exception as e:
            raise DownloadError(f"Network error downloading {url}: {e}") from e


class MockImageDownloader:
    """Mock downloader for offline testing and local fixture mappings."""

    def __init__(self, fixture_map: Optional[Dict[str, bytes]] = None):
        self.fixture_map = dict(fixture_map or {})

    def register(self, url: str, data: bytes) -> None:
        self.fixture_map[url] = data

    def fetch_image(self, url: str) -> bytes:
        if url in self.fixture_map:
            return self.fixture_map[url]
        raise DownloadError(f"Mock image not found for URL: {url}")
