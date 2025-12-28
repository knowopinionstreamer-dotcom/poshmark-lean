---
tag: [source-code, auto-sync]
last_synced: 2025-12-28T11:52:10.801Z
origin: scraper.py
---

# scraper.py

```py
import sys, requests, json, re
from bs4 import BeautifulSoup

def scrape_market_data(query):
    # Searches Google Shopping
    url = f"https://www.google.com/search?tbm=shop&q={query.replace(' ', '+')}"
    headers = {"User-Agent": "Mozilla/5.0"}
    
    try:
        res = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(res.text, 'html.parser')
        new_items, used_items = [], []
        
        for item in soup.select('.sh-dgr__content'):
            try:
                store = item.select_one('.aULzUe').get_text()
                price_text = item.select_one('.a8Pemb').get_text()
                price = float(re.sub(r'[^\d.]', '', price_text))
                title = item.select_one('h4').get_text().lower()
                
                # Logic to separate New vs Used items
                is_used = any(p in store.lower() for p in ['poshmark', 'mercari', 'ebay'])
                if any(k in title for k in ['new', 'nwt']): is_used = False
                
                entry = {"platform": store, "price": price}
                if is_used: used_items.append(entry)
                else: new_items.append(entry)
            except: continue
            
        return json.dumps({
            "averages": {
                "new": round(sum(l['price'] for l in new_items)/len(new_items), 2) if new_items else 0,
                "used": round(sum(l['price'] for l in used_items)/len(used_items), 2) if used_items else 0
            },
            "listings": (new_items + used_items)[:5]
        })
    except Exception as e: return json.dumps({"error": str(e)})

if __name__ == "__main__":
    print(scrape_market_data(" ".join(sys.argv[1:])))
```
