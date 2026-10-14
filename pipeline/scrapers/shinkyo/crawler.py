import os
import time
from curl_cffi import requests
from pipeline.normalizers.shinkyo_codes import SHINKYO_CANON
from rich.console import Console

console = Console()


class ShinkyoCrawler:
    def __init__(self, cookie_str=None):
        self.raw_dir = "pipeline/data/01_raw/shinkyo"
        os.makedirs(self.raw_dir, exist_ok=True)
        self.session = requests.Session(impersonate="chrome")

    def crawl_chapter(self, book_code: str, chapter: int):
        dest = os.path.join(self.raw_dir, f"{book_code}_{chapter:03d}.html")
        if os.path.exists(dest) and os.path.getsize(dest) > 1000:
            return True

        url = f"https://www.bible.com/bible/1819/{book_code}.{chapter}.%E6%96%B0%E5%85%B1%E5%90%8C%E8%A8%B3"
        try:
            resp = self.session.get(url, timeout=20)
            if resp.status_code == 200 and "ChapterContent" in resp.text:
                with open(dest, "w", encoding="utf-8") as f:
                    f.write(resp.text)
                console.print(f"[green]✓ Saved {book_code} {chapter}[/green]")
                time.sleep(1.2)
                return True
            else:
                console.print(
                    f"[red]Failed {book_code} {chapter}: Status {resp.status_code}[/red]"
                )
                return False
        except Exception as e:
            console.print(f"[red]Error fetching {url}: {e}[/red]")
            return False

    def crawl_book(self, book_code: str):
        book = next((b for b in SHINKYO_CANON if b["code"] == book_code), None)
        if not book:
            console.print(f"[red]Book {book_code} not found.[/red]")
            return
        for ch in range(1, book["chapters"] + 1):
            self.crawl_chapter(book_code, ch)
