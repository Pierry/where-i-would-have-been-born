#!/usr/bin/env python3
"""Download the GeoNames countryInfo dataset for capital and coordinate metadata."""
from __future__ import annotations

import argparse
import sys
import urllib.request
import ssl
from pathlib import Path

DEFAULT_URL = "https://download.geonames.org/export/dump/countryInfo.txt"


def _build_ssl_context(insecure: bool) -> ssl.SSLContext:
    context = ssl.create_default_context()
    if insecure:
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE
    return context


def download_file(url: str, output: Path, insecure: bool) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    sys.stdout.write(f"Downloading GeoNames country info from {url}\n")
    with urllib.request.urlopen(url, context=_build_ssl_context(insecure)) as response:
        output.write_bytes(response.read())


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-url", default=DEFAULT_URL)
    parser.add_argument("--output", default="data/raw/countryInfo.txt")
    parser.add_argument(
        "--insecure",
        action="store_true",
        help="Skip TLS certificate verification (useful behind intercepting proxies)",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    download_file(args.source_url, Path(args.output), insecure=args.insecure)
    sys.stdout.write(f"Saved GeoNames file to {args.output}\n")


if __name__ == "__main__":
  main()
