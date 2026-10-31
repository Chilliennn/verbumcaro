# scripts/apply_catholic_saint_sources.py
import json
import urllib.parse
from scripts.build_catholic_saint_sources import CATHOLIC_SAINT_URLS

def apply_catholic_sources():
    with open("public/data/saint-quotes.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    quotes = data.get("quotes", [])
    updated = 0
    for q in quotes:
        old_link = q.get("link", "")
        # If it's already a catholic URL, ensure it's up to date if needed
        if "wikipedia.org" in old_link:
            raw_entity = old_link.replace("https://en.wikipedia.org/wiki/", "")
            entity = urllib.parse.unquote(raw_entity)
            catholic_url = CATHOLIC_SAINT_URLS.get(entity) or CATHOLIC_SAINT_URLS.get(raw_entity)
            if not catholic_url:
                raise ValueError(f"No Catholic URL found for entity '{entity}' in quote: {q.get('author')}")
            q["link"] = catholic_url
            updated += 1
        elif old_link == "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20030504_maravillas-jesus_en.html":
            q["link"] = "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20030504_maravillas_en.html"
            updated += 1

    with open("public/data/saint-quotes.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Applied Catholic URLs: {updated} modified, total quotes {len(quotes)}.")

if __name__ == "__main__":
    apply_catholic_sources()
