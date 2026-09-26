import os
import shutil
from pipeline.normalizers.sigao_codes import SIGAO_CANON
from rich.console import Console

console = Console()
SRC_DIR = "pipeline/data/02_intermediate/sigao"
DEST_ROOT = "public/data/translations/sigao"

def export():
    os.makedirs(DEST_ROOT, exist_ok=True)
    for b in SIGAO_CANON:
        b_code = b["code"]
        b_dest = os.path.join(DEST_ROOT, b_code)
        os.makedirs(b_dest, exist_ok=True)
        for ch in range(1, b["chapters"] + 1):
            src_file = os.path.join(SRC_DIR, f"{b_code}_{ch:03d}.json")
            dest_file = os.path.join(b_dest, f"{ch}.json")
            if os.path.exists(src_file):
                shutil.copyfile(src_file, dest_file)
    console.print("[bold green]Successfully exported Sigao to public/data/translations/sigao[/bold green]")

if __name__ == "__main__":
    export()
