import os
import re
import json
from bs4 import BeautifulSoup
from pipeline.normalizers.book_codes import BOOK_BY_CODE
from rich.console import Console

console = Console()

class CatholicOrgParser:
    def __init__(self):
        self.raw_dir = "pipeline/data/01_raw/catholic_org"
        self.out_dir = "pipeline/data/02_intermediate/catholic_org"
        os.makedirs(self.out_dir, exist_ok=True)

    def parse_chapter_file(self, filename: str) -> dict:
        parts = filename.replace(".html", "").split("_")
        book_code = parts[0]
        chapter = int(parts[1])

        file_path = os.path.join(self.raw_dir, filename)
        with open(file_path, "r", encoding="utf-8") as f:
            html = f.read()

        soup = BeautifulSoup(html, "lxml")
        bible_book_div = soup.find("div", id="bibleBook")
        if not bible_book_div:
            console.print(f"[yellow]Warning: No #bibleBook in {filename}[/yellow]")
            return None

        verses = []
        p_tags = bible_book_div.find_all("p")

        for p in p_tags:
            sup = p.find("sup")
            if not sup:
                continue

            try:
                v_num = int(re.sub(r"\D", "", sup.get_text()))
            except ValueError:
                continue

            # Remove navigation/verse anchors before extracting pure verse content
            for tag in p.find_all(["sup", "a"]):
                if tag.has_attr("name"):
                    tag.decompose()
            sup.decompose()

            # Clean all internal encyclopedia links into plain strings
            text = " ".join(p.get_text().split())
            if text:
                verses.append({
                    "verse": v_num,
                    "heading": None,
                    "text": text,
                    "footnotes": []
                })

        output = {
            "translationId": "catholic_org_njb",
            "book": book_code,
            "chapter": chapter,
            "verses": verses
        }

        # Save locally to intermediate directory
        dest_path = os.path.join(self.out_dir, f"{book_code}_{chapter:03d}.json")
        with open(dest_path, "w", encoding="utf-8") as f:
            json.dump(output, f, ensure_ascii=False, indent=2)

        return output
