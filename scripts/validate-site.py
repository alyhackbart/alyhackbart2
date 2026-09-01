#!/usr/bin/env python3
"""Validate the generated AlyHackbart.com static site without third-party packages."""

from __future__ import annotations

import json
import re
import sys
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
from xml.etree import ElementTree

ROOT = Path(__file__).resolve().parents[1]
REMOTE_BASE_FILES = {
    "media/hero.js",
    "media/restaurant.js",
    "media/creator.js",
    "media/event.js",
    "media/wedding.js",
    "media/reel.js",
}
HTML_FILES = [ROOT / "index.html", ROOT / "privacy.html", ROOT / "thanks.html"]
PUBLIC_TEXT_FILES = [
    ROOT / "index.html",
    ROOT / "privacy.html",
    ROOT / "thanks.html",
    ROOT / "styles.css",
    ROOT / "script.js",
    ROOT / "content" / "site-content.js",
]
REQUIRED_FILES = [
    ROOT / "robots.txt",
    ROOT / "sitemap.xml",
    ROOT / "favicon.svg",
    ROOT / "site.webmanifest",
    ROOT / "assets" / "media" / "hero-reel.mp4",
    ROOT / "assets" / "media" / "hero-poster.webp",
    ROOT / "assets" / "media" / "restaurant.webp",
    ROOT / "assets" / "media" / "creator.webp",
    ROOT / "assets" / "media" / "event.webp",
    ROOT / "assets" / "media" / "wedding.webp",
]


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: list[str] = []
        self.references: list[str] = []
        self.anchor_fragments: list[str] = []
        self.canonicals: list[str] = []
        self.meta: dict[str, str] = {}
        self.forms: list[dict[str, str]] = []
        self.required_names: list[str] = []
        self.links: list[str] = []
        self._json_ld = False
        self._json_buffer: list[str] = []
        self.json_ld: list[object] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        data = {key: value or "" for key, value in attrs}
        if data.get("id"):
            self.ids.append(data["id"])

        for attr in ("src", "href", "poster"):
            value = data.get(attr)
            if not value:
                continue
            self.references.append(value)
            if attr == "href":
                self.links.append(value)
                if value.startswith("#") and len(value) > 1:
                    self.anchor_fragments.append(value[1:])

        if tag == "link" and data.get("rel") == "canonical":
            self.canonicals.append(data.get("href", ""))

        if tag == "meta":
            key = data.get("name") or data.get("property")
            if key:
                self.meta[key] = data.get("content", "")

        if tag == "form":
            self.forms.append(data)

        if tag in {"input", "select", "textarea"} and "required" in data:
            self.required_names.append(data.get("name", ""))

        if tag == "script" and data.get("type") == "application/ld+json":
            self._json_ld = True
            self._json_buffer = []

    def handle_endtag(self, tag: str) -> None:
        if tag == "script" and self._json_ld:
            payload = "".join(self._json_buffer).strip()
            if payload:
                self.json_ld.append(json.loads(payload))
            self._json_ld = False
            self._json_buffer = []

    def handle_data(self, data: str) -> None:
        if self._json_ld:
            self._json_buffer.append(data)


def fail(message: str, failures: list[str]) -> None:
    failures.append(message)


def local_path(reference: str) -> Path | None:
    if reference.startswith(("#", "mailto:", "tel:", "data:")):
        return None
    parsed = urlparse(reference)
    if parsed.scheme or parsed.netloc:
        return None
    clean = parsed.path
    if not clean:
        return None
    if clean.startswith("/"):
        return ROOT / clean.lstrip("/")
    return ROOT / clean


def main() -> int:
    failures: list[str] = []

    for file_path in REQUIRED_FILES + HTML_FILES:
        if not file_path.is_file():
            fail(f"Missing required file: {file_path.relative_to(ROOT)}", failures)

    parsed_pages: dict[str, PageParser] = {}
    for file_path in HTML_FILES:
        if not file_path.exists():
            continue
        text = file_path.read_text(encoding="utf-8")
        if re.search(r"\{\{[A-Z0-9_]+\}\}", text):
            fail(f"Unresolved build token in {file_path.name}", failures)
        parser = PageParser()
        try:
            parser.feed(text)
            parser.close()
        except (json.JSONDecodeError, ValueError) as exc:
            fail(f"Parsing failed for {file_path.name}: {exc}", failures)
            continue
        parsed_pages[file_path.name] = parser

        duplicates = [item for item, count in Counter(parser.ids).items() if count > 1]
        if duplicates:
            fail(f"Duplicate IDs in {file_path.name}: {', '.join(duplicates)}", failures)

        for fragment in parser.anchor_fragments:
            if fragment not in parser.ids:
                fail(f"Broken fragment #{fragment} in {file_path.name}", failures)

        for reference in parser.references:
            path = local_path(reference)
            if path is not None and not path.is_file():
                relative = str(path.relative_to(ROOT)).replace("\\", "/")
                if relative not in REMOTE_BASE_FILES:
                    fail(f"Missing local reference in {file_path.name}: {reference}", failures)

        if len(parser.canonicals) != 1:
            fail(f"Expected one canonical link in {file_path.name}", failures)

    index = parsed_pages.get("index.html")
    if index:
        for key in ("description", "og:title", "og:description", "og:image", "twitter:card"):
            if not index.meta.get(key):
                fail(f"Missing index metadata: {key}", failures)
        if not index.json_ld:
            fail("Missing JSON-LD in index.html", failures)
        else:
            graph = index.json_ld[0].get("@graph", []) if isinstance(index.json_ld[0], dict) else []
            types = {item.get("@type") for item in graph if isinstance(item, dict)}
            for expected in ("WebSite", "Person", "ProfessionalService", "FAQPage"):
                if expected not in types:
                    fail(f"Missing structured-data type: {expected}", failures)

        if len(index.forms) != 1:
            fail("Expected exactly one inquiry form", failures)
        else:
            form = index.forms[0]
            if form.get("method", "").lower() != "post":
                fail("Inquiry form must use POST", failures)
            if not form.get("action", "").startswith("https://formsubmit.co/"):
                fail("Inquiry form endpoint is not FormSubmit", failures)
            if "@" in form.get("action", ""):
                fail("Inquiry form exposes a naked email address", failures)

        for name in ("Full name", "email", "Project type", "Project details", "Consent"):
            if name not in index.required_names:
                fail(f"Required form field missing: {name}", failures)

        if "privacy.html" not in index.links:
            fail("Privacy link missing from index.html", failures)

    for file_path in PUBLIC_TEXT_FILES:
        if not file_path.exists():
            continue
        text = file_path.read_text(encoding="utf-8")
        if "—" in text or "&mdash;" in text.lower() or "&#8212;" in text.lower():
            fail(f"Em dash guardrail violation in {file_path.relative_to(ROOT)}", failures)

    try:
        ElementTree.parse(ROOT / "sitemap.xml")
    except (ElementTree.ParseError, OSError) as exc:
        fail(f"Invalid sitemap.xml: {exc}", failures)

    robots = (ROOT / "robots.txt").read_text(encoding="utf-8") if (ROOT / "robots.txt").exists() else ""
    if "Sitemap: https://alyhackbart.com/sitemap.xml" not in robots:
        fail("robots.txt does not reference the production sitemap", failures)

    if failures:
        print("VALIDATION FAILED")
        for item in failures:
            print(f"- {item}")
        return 1

    print("VALIDATION PASSED")
    print(f"Checked {len(HTML_FILES)} HTML pages, local assets, SEO metadata, JSON-LD, form wiring, sitemap, robots, and copy guardrails.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
