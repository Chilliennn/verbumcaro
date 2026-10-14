import argparse
from pipeline.normalizers.shinkyo_codes import SHINKYO_CANON
from pipeline.scrapers.shinkyo.crawler import ShinkyoCrawler
from pipeline.parsers.shinkyo.dom_parser import ShinkyoParser
from rich.console import Console

console = Console()

def main():
    parser = argparse.ArgumentParser(description="Shinkyōdōyaku Bible Pipeline")
    parser.add_argument("--stage", choices=["crawl", "parse", "all"], required=True)
    parser.add_argument("--book", help="3-letter OSIS/USFM code (e.g. GEN, MAT)")
    parser.add_argument("--cookie", help="Browser Cookie string if DataDome challenge occurs")
    args = parser.parse_args()

    books = [b["code"] for b in SHINKYO_CANON] if not args.book else [args.book.upper()]
    crawler = ShinkyoCrawler(cookie_str=args.cookie)
    dom_parser = ShinkyoParser()

    if args.stage in ["crawl", "all"]:
        console.print("[bold green]Stage 1: Crawling Shinkyōdōyaku...[/bold green]")
        for b_code in books:
            crawler.crawl_book(b_code)

    if args.stage in ["parse", "all"]:
        console.print("[bold green]Stage 2: Parsing Shinkyōdōyaku DOM...[/bold green]")
        for b in SHINKYO_CANON:
            if b["code"] in books:
                for ch in range(1, b["chapters"] + 1):
                    dom_parser.parse_chapter_file(f"{b['code']}_{ch:03d}.html")

    console.print("[bold cyan]Shinkyōdōyaku pipeline completed.[/bold cyan]")

if __name__ == "__main__":
    main()
