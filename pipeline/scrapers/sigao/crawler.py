import os
import time
from pipeline.scrapers.base_crawler import BaseCrawler
from pipeline.normalizers.sigao_codes import SIGAO_CANON
from rich.console import Console

console = Console()

class SigaoCrawler(BaseCrawler):
    def __init__(self):
        super().__init__(raw_dir="pipeline/data/01_raw/sigao", delay=0.5)
        self.base_url = "https://www.wanyouzhenyuan.cn/index.php"

    def crawl_book(self, book_code: str):
        book = next((b for b in SIGAO_CANON if b["code"] == book_code), None)
        if not book:
            console.print(f"[red]Book {book_code} not recognized[/red]")
            return

        tmpl_id = book["template_id"]
        total_ch = book["chapters"]
        console.print(f"[cyan]Downloading {book['name']} ({book_code}): {total_ch} chapters...[/cyan]")

        for ch in range(1, total_ch + 1):
            url = f"{self.base_url}?m=bible&version=sigao&template={tmpl_id}&chapter={ch}"
            file_name = f"{book_code}_{ch:03d}.html"
            dest = os.path.join(self.raw_dir, file_name)
            
            # Skip if already downloaded and valid
            if os.path.exists(dest) and os.path.getsize(dest) > 500:
                continue
                
            self.fetch_page(url, dest)
