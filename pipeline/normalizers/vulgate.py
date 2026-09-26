import glob
import json
import os
import re

from pipeline.normalizers.book_codes import BOOK_BY_CODE, CANON_73
from pipeline.normalizers.text_sanitizer import clean_text
from rich.console import Console

console = Console()

INTERMEDIATE_DIR = "pipeline/data/02_intermediate/vulgate"
NORMALIZED_DIR = "pipeline/data/03_validated/vulgate"

BOOK_ALIASES = {
    "genesis": "GEN", "exodus": "EXO", "leviticus": "LEV", "numeri": "NUM",
    "deuteronomii": "DEU", "deuteronomy": "DEU", "iosue": "JOS", "joshua": "JOS",
    "iudicum": "JDG", "judges": "JDG", "ruth": "RUT", "i samuelis": "1SA",
    "ii samuelis": "2SA", "iii regum": "1KI", "iv regum": "2KI",
    "i paralipomenon": "1CH", "ii paralipomenon": "2CH", "esdrae": "EZR",
    "nehemiae": "NEH", "thobis": "TOB", "tobia": "TOB", "iudith": "JDT",
    "esther": "EST", "i maccabaeorum": "1MA", "ii maccabaeorum": "2MA",
    "iob": "JOB", "psalmorum": "PSA", "proverbiorum": "PRO",
    "ecclesiastes": "ECC", "canticum canticorum": "SNG", "sapientiae": "WIS",
    "ecclesiasticus": "SIR", "isaiae": "ISA", "ieremiae": "JER",
    "lamentationes": "LAM", "baruch": "BAR", "ezechielis": "EZK",
    "danielis": "DAN", "osee": "HOS", "ioel": "JOL", "amos": "AMO",
    "abdiae": "OBA", "ionae": "JON", "michaeae": "MIC", "nahum": "NAM",
    "habacuc": "HAB", "sophoniae": "ZEP", "aggaei": "HAG", "zachariae": "ZEC",
    "malachiae": "MAL", "matthaeum": "MAT", "marcum": "MRK", "lucam": "LUK",
    "ioannem": "JHN", "actus apostolorum": "ACT", "romanos": "ROM",
    "i corinthios": "1CO", "ii corinthios": "2CO", "galatas": "GAL",
    "ephesios": "EPH", "philippenses": "PHP", "colossenses": "COL",
    "i thessalonicenses": "1TH", "ii thessalonicenses": "2TH", "i timotheum": "1TI",
    "ii timotheum": "2TI", "titum": "TIT", "philemonem": "PHM", "hebraeos": "HEB",
    "iacobi": "JAS", "i petri": "1PE", "ii petri": "2PE", "i ioannis": "1JN",
    "ii ioannis": "2JN", "iii ioannis": "3JN", "iudae": "JUD",
    "apocalypsis": "REV",
}


def _resolve_book(title: str, source_file: str) -> str | None:
    normalized_title = title.lower()
    for alias, code in sorted(BOOK_ALIASES.items(), key=lambda item: len(item[0]), reverse=True):
        if alias in normalized_title:
            return code

    slug = source_file.lower().replace("-", " ")
    for alias, code in sorted(BOOK_ALIASES.items(), key=lambda item: len(item[0]), reverse=True):
        if alias in slug:
            return code
    return None


def _resolve_chapter(title: str, source_file: str) -> int | None:
    match = re.search(r"chapter\s+(\d+)", title, re.IGNORECASE)
    if not match:
        match = re.search(r"chapter-(\d+)", source_file, re.IGNORECASE)
    return int(match.group(1)) if match else None


def normalize_all() -> int:
    os.makedirs(NORMALIZED_DIR, exist_ok=True)
    normalized = 0
    for source_path in sorted(glob.glob(os.path.join(INTERMEDIATE_DIR, "*.json"))):
        with open(source_path, "r", encoding="utf-8") as source:
            data = json.load(source)
        book = _resolve_book(data.get("rawTitle", ""), data.get("sourceFile", os.path.basename(source_path)))
        chapter = _resolve_chapter(data.get("rawTitle", ""), data.get("sourceFile", os.path.basename(source_path)))
        if not book or not chapter or book not in BOOK_BY_CODE:
            console.print(f"[yellow]Skipping unresolved Vulgate record: {source_path}[/yellow]")
            continue

        output = {
            "translationId": "vulgate",
            "book": book,
            "chapter": chapter,
            "verses": [
                {
                    "verse": verse["verse"],
                    "heading": clean_text(verse["heading"]) if verse.get("heading") else None,
                    "text": clean_text(verse["text"]),
                    "footnotes": verse.get("footnotes", []),
                }
                for verse in data.get("verses", [])
            ],
        }
        output_path = os.path.join(NORMALIZED_DIR, f"{book}_{chapter:03d}.json")
        with open(output_path, "w", encoding="utf-8") as target:
            json.dump(output, target, ensure_ascii=False, indent=2)
        normalized += 1

    console.print(f"[bold green]Vulgate normalization complete: {normalized} chapters[/bold green]")
    return normalized


if __name__ == "__main__":
    normalize_all()