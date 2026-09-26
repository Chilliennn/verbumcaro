import os
import json
import re
from bs4 import BeautifulSoup
from rich.console import Console

console = Console()

# Mapping for deuterocanonical chapters that YouVersion splits into distinct books
USFM_FALLBACK = {
    ("BAR", 6): ("LJE", 1),
    ("DAN", 13): ("SUS", 1),
    ("DAN", 14): ("BEL", 1)
}

class ShinkyoParser:
    def __init__(self):
        self.raw_dir = "pipeline/data/01_raw/shinkyo"
        self.out_dir = "pipeline/data/02_intermediate/shinkyo"
        os.makedirs(self.out_dir, exist_ok=True)

    def parse_chapter_file(self, filename: str) -> dict:
        parts = filename.replace(".html", "").split("_")
        book_code = parts[0]
        chapter = int(parts[1])

        file_path = os.path.join(self.raw_dir, filename)
        if not os.path.exists(file_path):
            return None

        with open(file_path, "r", encoding="utf-8") as f:
            html = f.read()

        soup = BeautifulSoup(html, "lxml")

        # Determine target usfm search prefixes
        search_book, search_ch = USFM_FALLBACK.get((book_code, chapter), (book_code, chapter))

        chapter_div = soup.find(attrs={"data-usfm": f"{search_book}.{search_ch}"})
        if not chapter_div:
            chapter_div = soup.find("div", class_=re.compile(r"ChapterContent.*__chapter"))

        if not chapter_div:
            console.print(f"[red]Could not locate chapter container in {filename}[/red]")
            return None

        verses_map = {}
        verse_elements = chapter_div.find_all(attrs={"data-usfm": re.compile(rf"^{search_book}\.{search_ch}\.\d+")})

        for v_el in verse_elements:
            usfm_val = v_el["data-usfm"]
            try:
                v_num = int(usfm_val.split(".")[-1])
            except ValueError:
                continue

            content_spans = v_el.find_all(class_=re.compile(r"__content"))
            text = "".join(span.get_text() for span in content_spans).strip()
            text = re.sub(r"\s+", " ", text).strip()

            if not text:
                continue

            if v_num not in verses_map:
                verses_map[v_num] = text
            else:
                verses_map[v_num] += " " + text

        verses = []
        for v_num in sorted(verses_map.keys()):
            verses.append({
                "verse": v_num,
                "heading": None,
                "text": verses_map[v_num],
                "footnotes": []
            })

        output = {
            "translationId": "shinkyo",
            "book": book_code,
            "chapter": chapter,
            "verses": verses
        }

        dest_file = os.path.join(self.out_dir, f"{book_code}_{chapter:03d}.json")
        with open(dest_file, "w", encoding="utf-8") as f:
            json.dump(output, f, ensure_ascii=False, indent=2)

        return output
