import os
import time
import httpx
from rich.console import Console

console = Console()

class BaseCrawler:
    def __init__(self, raw_dir: str, delay: float = 0.4):
        self.raw_dir = raw_dir
        self.delay = delay
        os.makedirs(self.raw_dir, exist_ok=True)
        self.client = httpx.Client(
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
            },
            timeout=20.0,
            follow_redirects=True
        )

    def fetch_page(self, url: str, cache_path: str) -> str:
        if os.path.exists(cache_path):
            with open(cache_path, "r", encoding="utf-8") as f:
                return f.read()

        time.sleep(self.delay)
        for attempt in range(3):
            try:
                resp = self.client.get(url)
                if resp.status_code == 200:
                    with open(cache_path, "w", encoding="utf-8") as f:
                        f.write(resp.text)
                    return resp.text
                elif resp.status_code == 429:
                    console.print(f"[yellow]Rate limited on {url}, sleeping 10s...[/yellow]")
                    time.sleep(10)
                else:
                    console.print(f"[red]HTTP {resp.status_code} for {url}[/red]")
            except Exception as e:
                console.print(f"[red]Attempt {attempt+1} failed: {e}[/red]")
                time.sleep(2)
        return ""
