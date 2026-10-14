import os
import json
import shutil
from pipeline.normalizers.book_codes import CANON_73
from rich.console import Console

console = Console()

SRC_DIR = "pipeline/data/02_intermediate/catholic_org"
DEST_ROOT = "public/data/translations/catholic_org"

def export_data():
    console.print("[bold green]Exporting JSON to public distribution directory...[/bold green]")
    os.makedirs(DEST_ROOT, exist_ok=True)

    for book in CANON_73:
        b_code = book["code"]
        exp_chs = book["chapters"]
        book_dest = os.path.join(DEST_ROOT, b_code)
        os.makedirs(book_dest, exist_ok=True)

        for ch in range(1, exp_chs + 1):
            src_file = os.path.join(SRC_DIR, f"{b_code}_{ch:03d}.json")
            dest_file = os.path.join(book_dest, f"{ch}.json")
            if os.path.exists(src_file):
                shutil.copyfile(src_file, dest_file)

    console.print(f"[bold cyan]Successfully populated {DEST_ROOT}[/bold cyan]")

if __name__ == "__main__":
    export_data()
