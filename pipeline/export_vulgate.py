import json
import os
import shutil

from pipeline.normalizers.book_codes import CANON_73
from rich.console import Console

console = Console()
SRC_DIR = "pipeline/data/03_validated/vulgate"
DEST_ROOT = "public/data/translations/vulgate"


def export() -> None:
    os.makedirs(DEST_ROOT, exist_ok=True)
    for book in CANON_73:
        book_dir = os.path.join(DEST_ROOT, book["code"])
        os.makedirs(book_dir, exist_ok=True)
        for chapter in range(1, book["chapters"] + 1):
            source = os.path.join(SRC_DIR, f"{book['code']}_{chapter:03d}.json")
            destination = os.path.join(book_dir, f"{chapter}.json")
            if os.path.exists(source):
                shutil.copyfile(source, destination)

    registry_path = "public/data/translations.json"
    with open(registry_path, "r", encoding="utf-8") as source:
        registry = json.load(source)
    registry = [entry for entry in registry if entry.get("id") != "vulgate"]
    registry.append({
        "id": "vulgate",
        "name": "Biblia Sacra Vulgata",
        "language": "la",
        "languageName": "Latin",
        "direction": "ltr",
        "hasHeadings": False,
        "hasFootnotes": False,
        "copyright": "Public Domain",
    })
    with open(registry_path, "w", encoding="utf-8") as target:
        json.dump(registry, target, ensure_ascii=False, indent=2)
    console.print(f"[bold green]Successfully exported Vulgate to {DEST_ROOT}[/bold green]")


if __name__ == "__main__":
    export()