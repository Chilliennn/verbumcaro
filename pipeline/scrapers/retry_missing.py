import os
import json
import time
from pipeline.normalizers.book_codes import CANON_73
from pipeline.scrapers.catholic_org_crawler import CatholicOrgCrawler
from rich.console import Console

console = Console()

RAW_DIR = "pipeline/data/01_raw/catholic_org"
FAILED_LOG = "pipeline/data/failed_urls.json"

def scan_missing_and_empty():
    missing = []
    
    for book in CANON_73:
        b_code = book["code"]
        b_id = book["id"]
        total_ch = book["chapters"]
        
        for ch in range(1, total_ch + 1):
            filename = f"{b_code}_{ch:03d}.html"
            filepath = os.path.join(RAW_DIR, filename)
            
            # Missing file or empty/truncated file (< 500 bytes)
            if not os.path.exists(filepath) or os.path.getsize(filepath) < 500:
                missing.append({
                    "book_code": b_code,
                    "book_id": b_id,
                    "chapter": ch,
                    "url": f"https://www.catholic.org/bible/book.php?id={b_id}&bible_chapter={ch}",
                    "dest": filepath
                })
    return missing

def main():
    crawler = CatholicOrgCrawler()
    # Use a slightly longer delay on retries to give their server breathing room
    crawler.delay = 1.0 
    
    missing_items = scan_missing_and_empty()
    
    if not missing_items:
        console.print("[bold green]All 73 books and chapters are completely downloaded![/bold green]")
        return

    console.print(f"[bold yellow]Found {len(missing_items)} missing/failed chapters. Starting targeted retry...[/bold yellow]")

    still_failed = []
    for item in missing_items:
        console.print(f"Retrying: {item['book_code']} Chapter {item['chapter']} -> {item['url']}")
        
        # Clean up empty files before fetching so cache logic doesn't skip
        if os.path.exists(item["dest"]) and os.path.getsize(item["dest"]) < 500:
            os.remove(item["dest"])
            
        content = crawler.fetch_page(item["url"], item["dest"])
        
        # Verify content was successfully saved
        if not content or len(content) < 500:
            still_failed.append(item)
            console.print(f"[red]Failed again: {item['book_code']} ch {item['chapter']}[/red]")
        else:
            console.print(f"[green]Success: {item['book_code']} ch {item['chapter']}[/green]")
            
        time.sleep(1.0)

    # Save any stubborn chapters to log file
    with open(FAILED_LOG, "w", encoding="utf-8") as f:
        json.dump(still_failed, f, indent=2)
        
    if still_failed:
        console.print(f"[bold red]{len(still_failed)} chapters still failing. Logged in {FAILED_LOG}[/bold red]")
    else:
        console.print("[bold green]All missing chapters successfully downloaded and verified![/bold green]")

if __name__ == "__main__":
    main()
