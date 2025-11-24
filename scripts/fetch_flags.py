#!/usr/bin/env python3
"""Download country metadata (flags, regions, capitals) using curl to hit HTTP/2 sources."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import List, Dict, Any
import subprocess

DEFAULT_URL = (
    "https://restcountries.com/v3.1/all?"
    "fields=name,capital,capitalInfo,cca2,cca3,latlng,region,subregion,flags,maps"
)


def download_payload(url: str, insecure: bool) -> List[Dict[str, Any]]:
    sys.stdout.write(f"Fetching country metadata from {url}\n")
    args = [
        "curl",
        "-sSL",
        url,
        "-H",
        "User-Agent: where-born-bot/1.0",
        "-H",
        "Accept: application/json",
    ]
    if insecure:
        args.append("-k")
    try:
        completed = subprocess.run(args, check=True, capture_output=True, text=True)
    except FileNotFoundError as err:  # noqa: BLE001
        raise RuntimeError("curl is required to download country metadata") from err
    except subprocess.CalledProcessError as err:
        sys.stderr.write(err.stderr)
        raise RuntimeError("curl failed to download country metadata") from err
    return json.loads(completed.stdout)


def save_json(payload: List[Dict[str, Any]], output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-url", default=DEFAULT_URL)
    parser.add_argument("--output", default="data/raw/rest-countries.json")
    parser.add_argument(
        "--insecure",
        action="store_true",
        help="Skip TLS verification (useful for corporate proxies)",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    payload = download_payload(args.source_url, args.insecure)
    save_json(payload, Path(args.output))
    sys.stdout.write(f"Saved {len(payload)} country metadata records to {args.output}\n")


if __name__ == "__main__":
    main()
