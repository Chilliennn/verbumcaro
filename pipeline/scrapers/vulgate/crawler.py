import os
from urllib.parse import urljoin

from bs4 import BeautifulSoup
from rich.console import Console

from pipeline.scrapers.base_crawler import BaseCrawler
from pipeline.scrapers.vulgate.url_manifest import BASE_URL, START_URL

console = Console()


class VulgateCrawler(BaseCrawler):
	def __init__(self):
		super().__init__(raw_dir="pipeline/data/01_raw/vulgate", delay=0.6)

	def crawl(self):
		current_url = START_URL
		page_number = 1
		visited = set()

		while current_url and current_url not in visited:
			visited.add(current_url)
			slug = current_url.rstrip("/").split("/")[-1]
			destination = os.path.join(self.raw_dir, f"{page_number:04d}_{slug}.html")
			html = self.fetch_page(current_url, destination)
			if not html:
				raise RuntimeError(f"Unable to fetch Vulgate chapter: {current_url}")

			console.print(f"[cyan][{page_number:04d}] {current_url}[/cyan]")
			soup = BeautifulSoup(html, "lxml")
			next_tag = soup.find("link", rel="next") or soup.find("a", rel="next")
			href = next_tag.get("href") if next_tag else None
			current_url = urljoin(BASE_URL, href) if href else None
			page_number += 1

		console.print(f"[bold green]Vulgate crawl complete: {page_number - 1} pages[/bold green]")


if __name__ == "__main__":
	VulgateCrawler().crawl()
