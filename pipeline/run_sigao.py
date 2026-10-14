import argparse
from pipeline.normalizers.sigao_codes import SIGAO_CANON
from pipeline.scrapers.sigao.crawler import SigaoCrawler
from pipeline.parsers.sigao.dom_parser import SigaoParser
from rich.console import Console

console = Console()

def main():
    parser = argparse.ArgumentParser(description="Sigao Bible Ingestion Pipeline")
    parser.add_argument("--stage", choices=["crawl", "parse", "all"], required=True)
    parser.add_argument("--book", help="3-letter OSIS code (e.g. MAL, GEN)")
    args = parser.parse_args()

    books = [b["code"] for b in SIGAO_CANON] if not args.book else [args.book.upper()]
    crawler = SigaoCrawler()
    dom_parser = SigaoParser()

    if args.stage in ["crawl", "all"]:
        console.print("[bold green]Stage 1: Crawling Sigao HTML pages...[/bold green]")
        for b_code in books:
            crawler.crawl_book(b_code)

    if args.stage in ["parse", "all"]:
        console.print("[bold green]Stage 2: Parsing Sigao DOM & extracting titles...[/bold green]")
        for b in SIGAO_CANON:
            if b["code"] in books:
                for ch in range(1, b["chapters"] + 1):
                    dom_parser.parse_chapter_file(f"{b['code']}_{ch:03d}.html")

    console.print("[bold cyan]Sigao pipeline process completed.[/bold cyan]")

if __name__ == "__main__":
    main()
