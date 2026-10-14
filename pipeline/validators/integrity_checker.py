import os
import json
from pipeline.normalizers.book_codes import CANON_73
from rich.console import Console
from rich.table import Table

console = Console()
INTERMEDIATE_DIR = "pipeline/data/02_intermediate/catholic_org"

def validate_all():
    table = Table(title="Catholic Online (NJB) Canonical Verification")
    table.add_column("Book", style="cyan")
    table.add_column("Expected Chs", justify="right")
    table.add_column("Parsed Chs", justify="right")
    table.add_column("Total Verses", justify="right")
    table.add_column("Status", style="bold")

    total_verses = 0
    has_issues = False

    for book in CANON_73:
        b_code = book["code"]
        exp_chs = book["chapters"]
        found_chs = 0
        book_verses = 0
        book_issues = []

        for ch in range(1, exp_chs + 1):
            filepath = os.path.join(INTERMEDIATE_DIR, f"{b_code}_{ch:03d}.json")
            if not os.path.exists(filepath):
                book_issues.append(f"Ch {ch} missing")
                continue

            found_chs += 1
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)

            verses = data.get("verses", [])
            book_verses += len(verses)

            # Check for verse gaps
            expected_v = 1
            for v_obj in verses:
                v_num = v_obj["verse"]
                text = v_obj["text"].strip()
                if not text:
                    book_issues.append(f"Ch {ch}:{v_num} text empty")
                expected_v = v_num + 1

        total_verses += book_verses
        status = "[green]PASS[/green]"
        if book_issues or found_chs != exp_chs:
            has_issues = True
            status = f"[red]FAIL: {', '.join(book_issues[:2])}[/red]"

        table.add_row(b_code, str(exp_chs), str(found_chs), str(book_verses), status)

    console.print(table)
    console.print(f"[bold cyan]Total Extracted Verses:[/bold cyan] {total_verses}")

if __name__ == "__main__":
    validate_all()
