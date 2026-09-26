import glob
import json
import os

from bs4 import BeautifulSoup
from rich.console import Console

console = Console()


class VulgateParser:
	def __init__(self):
		self.raw_dir = "pipeline/data/01_raw/vulgate"
		self.out_dir = "pipeline/data/02_intermediate/vulgate"
		os.makedirs(self.out_dir, exist_ok=True)

	def parse_file(self, file_path: str) -> dict | None:
		with open(file_path, "r", encoding="utf-8") as source:
			soup = BeautifulSoup(source.read(), "lxml")

		title = soup.select_one("div.contents h3") or soup.find("h3") or soup.find("title")
		title_text = title.get_text(" ", strip=True) if title else ""
		container = (
			soup.select_one('article[data-slot="reader-content"]')
			or soup.select_one('div[data-slot="reader-prose"]')
			or soup.select_one("div.contents")
		)
		if not container:
			console.print(f"[yellow]No reader content found: {os.path.basename(file_path)}[/yellow]")
			return None

		for element in container.select(
			"[data-ad-inline], .not-prose, [data-module-id=adsense-slot], "
			"[data-module-id=usb-ad], [data-slot=reader-subscription-ad]"
		):
			element.decompose()

		verses = []
		for paragraph in container.find_all("p"):
			anchor = paragraph.find("a")
			if not anchor or not anchor.get_text(strip=True).isdigit():
				continue
			verse_number = int(anchor.get_text(strip=True))
			anchor.decompose()
			text = paragraph.get_text(" ", strip=True)
			if text:
				verses.append({"verse": verse_number, "heading": None, "text": text, "footnotes": []})

		if not verses:
			return None
		return {"rawTitle": title_text, "sourceFile": os.path.basename(file_path), "verses": verses}

	def parse_all(self):
		parsed = 0
		for file_path in sorted(glob.glob(os.path.join(self.raw_dir, "*.html"))):
			data = self.parse_file(file_path)
			if not data:
				continue
			output_name = os.path.splitext(data["sourceFile"])[0] + ".json"
			with open(os.path.join(self.out_dir, output_name), "w", encoding="utf-8") as output:
				json.dump(data, output, ensure_ascii=False, indent=2)
			parsed += 1
		console.print(f"[bold green]Vulgate parse complete: {parsed} chapters[/bold green]")


if __name__ == "__main__":
	VulgateParser().parse_all()
