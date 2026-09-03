#!/usr/bin/env python3
"""Check public-facing source files for harness copy guardrails."""
from __future__ import annotations

import argparse
import re
from pathlib import Path

SUFFIXES = {'.html', '.htm', '.css', '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.vue', '.svelte', '.php', '.twig', '.njk', '.mdx'}
SKIP = {'.git', '.build', '.agents', '.cursor', 'node_modules', 'vendor', 'dist', 'release'}
EM_DASH = re.compile(r'(?:\u2014|&mdash;|&#8212;|&#x2014;|\\u2014|\\u\{2014\})', re.IGNORECASE)
ARBITRARY = re.compile(r'(?:^|[^A-Za-z0-9_-])(?:[A-Za-z0-9@.&|\[\]_/-]+:)*(?:text|leading|tracking|indent|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y|w|h|size|min-w|max-w|min-h|max-h|inset|top|right|bottom|left)-\[[^\]]+\]')


def in_scope(path: Path) -> bool:
    return path.suffix.lower() in SUFFIXES and not any(part in SKIP for part in path.parts)


def scan(path: Path, root: Path) -> list[str]:
    try:
        text = path.read_text(encoding='utf-8')
    except (OSError, UnicodeDecodeError):
        return []
    lines = text.splitlines()
    allow_file_em = any('guardrail-allow-file:' in line and 'em-dash' in line for line in lines[:30])
    allow_file_arbitrary = any('guardrail-allow-file:' in line and 'arbitrary' in line for line in lines[:30])
    findings: list[str] = []
    for index, line in enumerate(lines):
        previous = lines[index - 1] if index else ''
        if not allow_file_em and 'guardrail-allow-em-dash' not in line and 'guardrail-allow-em-dash' not in previous:
            if EM_DASH.search(line):
                findings.append(f'{path.relative_to(root)}:{index + 1}: generated copy contains an em dash')
        if not allow_file_arbitrary and 'guardrail-allow-arbitrary' not in line and 'guardrail-allow-arbitrary' not in previous:
            match = ARBITRARY.search(line)
            if match:
                findings.append(f'{path.relative_to(root)}:{index + 1}: arbitrary Tailwind utility {match.group(0).strip()}')
    return findings


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('root')
    parser.add_argument('--files', nargs='*')
    parser.add_argument('--all', action='store_true')
    args = parser.parse_args()
    root = Path(args.root).resolve()
    if args.all:
        files = [p for p in root.rglob('*') if p.is_file() and in_scope(p.relative_to(root))]
    else:
        files = []
        for raw in args.files or []:
            path = Path(raw)
            path = path if path.is_absolute() else root / path
            if path.is_file() and in_scope(path.relative_to(root)):
                files.append(path)
    findings: list[str] = []
    for path in files:
        findings.extend(scan(path, root))
    print('=== Copy and Tailwind guardrails ===')
    print(f'Target: {root}')
    print(f'Scope: {len(files)} file(s)')
    if findings:
        for finding in findings:
            print(f'FAIL  {finding}')
        print(f'Failures: {len(findings)}')
        return 1
    print(f'OK    {len(files)} file(s) scanned, no violations')
    print('Failures: 0')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
