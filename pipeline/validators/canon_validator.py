import glob
import json
import os

from pipeline.normalizers.book_codes import CANON_73


def validate_vulgate(directory: str = "pipeline/data/03_validated/vulgate") -> None:
    files = glob.glob(os.path.join(directory, "*.json"))
    if not files:
        raise ValueError("No normalized Vulgate chapters found")

    expected = {book["code"]: book["chapters"] for book in CANON_73}
    observed = {code: set() for code in expected}
    for file_path in files:
        with open(file_path, "r", encoding="utf-8") as source:
            chapter = json.load(source)
        if chapter.get("translationId") != "vulgate":
            raise ValueError(f"Unexpected translation in {file_path}")
        book = chapter.get("book")
        chapter_number = chapter.get("chapter")
        if book not in expected or chapter_number in observed[book]:
            raise ValueError(f"Invalid or duplicate chapter in {file_path}")
        verses = chapter.get("verses", [])
        if not verses or any(not verse.get("text", "").strip() for verse in verses):
            raise ValueError(f"Blank or missing verse text in {file_path}")
        verse_numbers = [verse.get("verse") for verse in verses]
        if verse_numbers != sorted(set(verse_numbers)):
            raise ValueError(
                f"Non-increasing or duplicate verse numbering in {file_path}"
            )
        observed[book].add(chapter_number)

    missing = [
        f"{book} {chapter}"
        for book, total in expected.items()
        for chapter in range(1, total + 1)
        if chapter not in observed[book]
    ]
    if missing:
        raise ValueError(f"Missing Vulgate chapters: {', '.join(missing[:10])}")
