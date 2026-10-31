# scripts/verify_all_links.py
import json
import urllib.request
from concurrent.futures import ThreadPoolExecutor

def verify_all_links():
    # 1. Saint quotes links
    with open("public/data/saint-quotes.json", "r", encoding="utf-8") as f:
        saint_data = json.load(f)
    saint_quotes = saint_data.get("quotes", [])
    saint_urls = sorted(list(set(q["link"] for q in saint_quotes if "link" in q)))

    print(f"Checking {len(saint_urls)} unique Saint URLs across {len(saint_quotes)} quotes...")

    # 2. Catholic trivia links
    with open("public/data/catholic-trivia.json", "r", encoding="utf-8") as f:
        trivia_data = json.load(f)
    trivia_questions = trivia_data.get("questions", [])
    trivia_urls = sorted(list(set(q["sourceUrl"] for q in trivia_questions if "sourceUrl" in q)))

    print(f"Checking {len(trivia_urls)} unique Catholic Trivia URLs across {len(trivia_questions)} questions...")

    all_urls = sorted(list(set(saint_urls + trivia_urls)))
    print(f"Total combined unique URLs to verify: {len(all_urls)}")

    def test_url(url):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "VerbumCaro/1.0 (test@verbumcaro.org)"})
            with urllib.request.urlopen(req, timeout=12) as resp:
                return url, resp.status
        except Exception as e:
            return url, str(e)

    with ThreadPoolExecutor(max_workers=12) as executor:
        results = list(executor.map(test_url, all_urls))

    failures = [r for r in results if r[1] != 200]
    successes = [r for r in results if r[1] == 200]

    print(f"\nVerification Results:")
    print(f" - Succeeded (200 OK): {len(successes)} / {len(all_urls)}")
    print(f" - Failed: {len(failures)}")

    if failures:
        print("\nFailures:")
        for url, err in failures:
            print(f"  [X] {url} -> {err}")
        return False
    else:
        print("\nALL LINKS VERIFIED WORKING! 100% HTTP 200 OK.")
        return True

if __name__ == "__main__":
    verify_all_links()

