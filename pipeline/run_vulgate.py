import argparse

from pipeline.export_vulgate import export
from pipeline.normalizers.vulgate import normalize_all
from pipeline.parsers.vulgate.dom_parser import VulgateParser
from pipeline.scrapers.vulgate.crawler import VulgateCrawler
from pipeline.validators.canon_validator import validate_vulgate


def main() -> None:
    parser = argparse.ArgumentParser(description="VerbumCaro Vulgate ingestion pipeline")
    parser.add_argument("--stage", choices=["crawl", "parse", "normalize", "validate", "export", "all"], default="all")
    args = parser.parse_args()

    stages = ["crawl", "parse", "normalize", "validate", "export"] if args.stage == "all" else [args.stage]
    if "crawl" in stages:
        VulgateCrawler().crawl()
    if "parse" in stages:
        VulgateParser().parse_all()
    if "normalize" in stages:
        normalize_all()
    if "validate" in stages:
        validate_vulgate()
    if "export" in stages:
        export()


if __name__ == "__main__":
    main()