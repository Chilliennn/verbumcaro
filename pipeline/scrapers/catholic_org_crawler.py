import os
from pipeline.scrapers.base_crawler import BaseCrawler
from pipeline.normalizers.book_codes import CANON_73
from rich.console import Console

console = Console()

class CatholicOrgCrawler(BaseCrawler):
    def __init__(self):
        super().__init__(raw_dir="pipeline/data/01_raw/catholic_org", delay=0.3)
        self.base_url = "https://www.catholic.org/bible/book.php"

    def crawl_book(self, book_code: str):
        book = next((b for b in CANON_73 if b["code"] == book_code), None)
        if not book:
            console.print(f"[red]Book {book_code} not recognized[/red]")
            return

        book_id = book["id"]
        total_ch = book["chapters"]
        console.print(f"[cyan]Downloading {book['name']} ({book_code}): {total_ch} chapters...[/cyan]")

        for ch in range(1, total_ch + 1):
            url = f"{self.base_url}?id={book_id}&bible_chapter={ch}"
            file_name = f"{book_code}_{ch:03d}.html"
            dest = os.path.join(self.raw_dir, file_name)
            self.fetch_page(url, dest)
