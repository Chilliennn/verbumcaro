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
    "genesis": "GEN",
    "exodus": "EXO",
    "leviticus": "LEV",
    "numeri": "NUM",
    "numbers": "NUM",
    "deuteronomii": "DEU",
    "deuteronomy": "DEU",
    "iosue": "JOS",
    "joshua": "JOS",
    "iudicum": "JDG",
    "judges": "JDG",
    "ruth": "RUT",
    "i samuelis": "1SA",
    "ii samuelis": "2SA",
    "1 samuel": "1SA",
    "2 samuel": "2SA",
    "iii regum": "1KI",
    "iv regum": "2KI",
    "1 kings": "1KI",
    "2 kings": "2KI",
    "i paralipomenon": "1CH",
    "ii paralipomenon": "2CH",
    "1 chronicles": "1CH",
    "2 chronicles": "2CH",
    "esdrae": "EZR",
    "ezra": "EZR",
    "nehemiae": "NEH",
    "nehemiah": "NEH",
    "thobis": "TOB",
    "tobia": "TOB",
    "tobias": "TOB",
    "tobit": "TOB",
    "iudith": "JDT",
    "judith": "JDT",
    "esther": "EST",
    "i maccabaeorum": "1MA",
    "ii maccabaeorum": "2MA",
    "1 macabees": "1MA",
    "2 macabees": "2MA",
    "iob": "JOB",
    "job": "JOB",
    "psalmorum": "PSA",
    "psalms": "PSA",
    "proverbiorum": "PRO",
    "proverbs": "PRO",
    "ecclesiastes": "ECC",
    "canticum canticorum": "SNG",
    "song of solomon": "SNG",
    "sapientiae": "WIS",
    "wisdom": "WIS",
    "ecclesiasticus": "SIR",
    "sirach": "SIR",
    "isaiae": "ISA",
    "isaiah": "ISA",
    "ieremiae": "JER",
    "jeremiah": "JER",
    "lamentationes": "LAM",
    "lamentations": "LAM",
    "baruch": "BAR",
    "ezechielis": "EZK",
    "ezekiel": "EZK",
    "danielis": "DAN",
    "daniel": "DAN",
    "osee": "HOS",
    "hosea": "HOS",
    "ioel": "JOL",
    "joel": "JOL",
    "amos": "AMO",
    "abdiae": "OBA",
    "obadiah": "OBA",
    "ionae": "JON",
    "jonah": "JON",
    "michaeae": "MIC",
    "micah": "MIC",
    "nahum": "NAM",
    "habacuc": "HAB",
    "habakkuk": "HAB",
    "sophoniae": "ZEP",
    "zephaniah": "ZEP",
    "aggaei": "HAG",
    "haggai": "HAG",
    "zachariae": "ZEC",
    "zechariah": "ZEC",
    "malachiae": "MAL",
    "malachi": "MAL",
    "matthaeum": "MAT",
    "matthew": "MAT",
    "marcum": "MRK",
    "mark": "MRK",
    "lucam": "LUK",
    "luke": "LUK",
    "ioannem": "JHN",
    "john": "JHN",
    "actus apostolorum": "ACT",
    "acts": "ACT",
    "romanos": "ROM",
    "romans": "ROM",
    "i corinthios": "1CO",
    "ii corinthios": "2CO",
    "1 corinthians": "1CO",
    "2 corinthians": "2CO",
    "galatas": "GAL",
    "galatians": "GAL",
    "ephesios": "EPH",
    "ephesians": "EPH",
    "philippenses": "PHP",
    "philippians": "PHP",
    "colossenses": "COL",
    "colossians": "COL",
    "i thessalonicenses": "1TH",
    "ii thessalonicenses": "2TH",
    "1 thessalonians": "1TH",
    "2 thessalonians": "2TH",
    "i timotheum": "1TI",
    "ii timotheum": "2TI",
    "1 timothy": "1TI",
    "2 timothy": "2TI",
    "titum": "TIT",
    "titus": "TIT",
    "philemonem": "PHM",
    "philemon": "PHM",
    "hebraeos": "HEB",
    "hebrews": "HEB",
    "iacobi": "JAS",
    "james": "JAS",
    "i petri": "1PE",
    "ii petri": "2PE",
    "1 peter": "1PE",
    "2 peter": "2PE",
    "i ioannis": "1JN",
    "ii ioannis": "2JN",
    "iii ioannis": "3JN",
    "1 john": "1JN",
    "2 john": "2JN",
    "3 john": "3JN",
    "iudae": "JUD",
    "jude": "JUD",
    "apocalypsis": "REV",
    "revelation": "REV",
}


def _resolve_book(title: str, source_file: str) -> str | None:
    normalized_title = title.lower()
    for alias, code in sorted(
        BOOK_ALIASES.items(), key=lambda item: len(item[0]), reverse=True
    ):
        if alias in normalized_title:
            return code

    slug = source_file.lower().replace("-", " ")
    for alias, code in sorted(
        BOOK_ALIASES.items(), key=lambda item: len(item[0]), reverse=True
    ):
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
        book = _resolve_book(
            data.get("rawTitle", ""),
            data.get("sourceFile", os.path.basename(source_path)),
        )
        chapter = _resolve_chapter(
            data.get("rawTitle", ""),
            data.get("sourceFile", os.path.basename(source_path)),
        )
        if not book or not chapter or book not in BOOK_BY_CODE:
            console.print(
                f"[yellow]Skipping unresolved Vulgate record: {source_path}[/yellow]"
            )
            continue

        output = {
            "translationId": "vulgate",
            "book": book,
            "chapter": chapter,
            "verses": [
                {
                    "verse": verse["verse"],
                    "heading": (
                        clean_text(verse["heading"]) if verse.get("heading") else None
                    ),
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

    console.print(
        f"[bold green]Vulgate normalization complete: {normalized} chapters[/bold green]"
    )
    return normalized


if __name__ == "__main__":
    normalize_all()
