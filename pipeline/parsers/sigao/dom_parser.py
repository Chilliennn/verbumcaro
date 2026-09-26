import os
import re
import json
from bs4 import BeautifulSoup
from rich.console import Console

console = Console()

class SigaoParser:
    def __init__(self):
        self.raw_dir = "pipeline/data/01_raw/sigao"
        self.out_dir = "pipeline/data/02_intermediate/sigao"
        os.makedirs(self.out_dir, exist_ok=True)

    def parse_chapter_file(self, filename: str) -> dict:
        parts = filename.replace(".html", "").split("_")
        book_code = parts[0]
        chapter = int(parts[1])

        file_path = os.path.join(self.raw_dir, filename)
        if not os.path.exists(file_path):
            console.print(f"[yellow]File missing: {filename}[/yellow]")
            return None

        with open(file_path, "r", encoding="utf-8") as f:
            html = f.read()

        soup = BeautifulSoup(html, "lxml")
        content_div = soup.find("div", class_="article-content")
        if not content_div:
            console.print(f"[red]No article-content in {filename}[/red]")
            return None

        # Clean footnotes and annotations list so it doesn't bleed into verse text
        ann_div = content_div.find("div", class_="annotations")
        if ann_div:
            ann_div.decompose()

        verses = []
        pending_heading = None

        # Walk through children of content_div sequentially (handles H4 titles before verses)
        for elem in content_div.children:
            if not elem.name:
                continue

            # Capture Section Headings (Pericopes)
            if elem.name == "h4":
                heading_text = elem.get_text().strip()
                if heading_text:
                    pending_heading = heading_text

            # Verses live inside <p> tags
            elif elem.name == "p":
                # Find all span elements with a value attribute
                spans = elem.find_all("span", attrs={"value": True})
                for span in spans:
                    try:
                        v_num = int(span["value"])
                    except (ValueError, KeyError):
                        continue

                    # Strip footnote references (class="annotation")
                    for a_tag in span.find_all("a", class_="annotation"):
                        a_tag.decompose()

                    verse_text = span.get_text().strip()
                    # Clean up multiple whitespaces
                    verse_text = re.sub(r"\s+", " ", verse_text)

                    if verse_text:
                        verses.append({
                            "verse": v_num,
                            "heading": pending_heading,
                            "text": verse_text,
                            "footnotes": []
                        })
                        pending_heading = None  # Consume heading once applied

        # Deduplicate verses if any were repeated in malformed HTML
        unique_verses = []
        seen = set()
        for v in verses:
            if v["verse"] not in seen:
                unique_verses.append(v)
                seen.add(v["verse"])

        output = {
            "translationId": "sigao",
            "book": book_code,
            "chapter": chapter,
            "verses": unique_verses
        }

        dest_path = os.path.join(self.out_dir, f"{book_code}_{chapter:03d}.json")
        with open(dest_path, "w", encoding="utf-8") as f:
            json.dump(output, f, ensure_ascii=False, indent=2)

        return output
