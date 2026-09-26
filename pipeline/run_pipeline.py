import argparse
from pipeline.normalizers.book_codes import CANON_73
from pipeline.scrapers.catholic_org_crawler import CatholicOrgCrawler
from pipeline.parsers.catholic_org_parser import CatholicOrgParser
from rich.console import Console

console = Console()

def main():
    parser = argparse.ArgumentParser(description="VerbumCaro Bible Ingestion Pipeline")
    parser.add_argument("--stage", choices=["crawl", "parse", "all"], required=True)
    parser.add_argument("--book", help="3-letter OSIS book code (e.g., GEN, JAS). Omit for all 73 books.")
    args = parser.parse_args()

    books_to_run = [b["code"] for b in CANON_73] if not args.book else [args.book.upper()]
    crawler = CatholicOrgCrawler()
    dom_parser = CatholicOrgParser()

    if args.stage in ["crawl", "all"]:
        console.print("[bold green]Stage 1: Crawling raw HTML...[/bold green]")
        for b_code in books_to_run:
            crawler.crawl_book(b_code)

    if args.stage in ["parse", "all"]:
        console.print("[bold green]Stage 2: Parsing DOM & structuring verses...[/bold green]")
        for b in CANON_73:
            if b["code"] in books_to_run:
                for ch in range(1, b["chapters"] + 1):
                    dom_parser.parse_chapter_file(f"{b['code']}_{ch:03d}.html")

    console.print("[bold cyan]Task completed successfully.[/bold cyan]")

if __name__ == "__main__":
    main()
