# Grocery & Location API Research — MealPrep Pro

Research date: August 2026. Endpoints and auth methods were verified against public documentation and marketplace listings. **Do not assume undocumented private supermarket endpoints are stable or ToS-compliant.**

---

## Google Maps Places API (Nearby Search / New)

| | |
|---|---|
| **Status** | **Official** |
| **Docs** | https://developers.google.com/maps/documentation/places/web-service/nearby-search |
| **Pricing** | Pay-as-you-go; free monthly credit via Google Cloud (tier depends on SKU: Places API Nearby Search) |
| **Auth** | API key (`X-Goog-Api-Key` / query `key`) |
| **AU coverage** | Yes — worldwide Places data includes Australian Coles / Woolworths / ALDI |
| **Features** | Store locations, place name, address, distance (client-calculated from lat/lng), opening hours (varies by field mask). **Not** product prices |

**Recommended:** Yes — primary nearby-supermarket provider.

---

## Google Geocoding API

| | |
|---|---|
| **Status** | **Official** |
| **Docs** | https://developers.google.com/maps/documentation/geocoding |
| **Pricing** | Pay-as-you-go; free monthly credit |
| **Auth** | API key |
| **AU coverage** | Yes |
| **Features** | Address ↔ lat/lng for distance and Places bias. Not products/prices |

**Recommended:** Yes — geocode user suburb/postcode before Nearby Search.

---

## Australia Post Postcode Search (PAC)

| | |
|---|---|
| **Status** | **Official** |
| **Docs** | https://developers.auspost.com.au/apis/pac/reference/postcode-search |
| **Pricing** | Free PAC / Locations registration (public data); commercial shipping APIs are contract-based |
| **Auth** | API key (`AUTH-KEY` header) via https://developers.auspost.com.au |
| **AU coverage** | Australia only |
| **Features** | Suburb/postcode lookup. Not supermarket prices |

**Recommended:** Optional — useful for validating AU locations; Google Geocoding already covers most MealPrep Pro needs.

---

## Woolworths Products API (RapidAPI — Data Holdings Group)

| | |
|---|---|
| **Status** | **Unofficial** third-party marketplace API |
| **Docs** | https://rapidapi.com/data-holdings-group-data-holdings-group-default/api/woolworths-products-api |
| **Pricing** | RapidAPI subscription plans (Basic/Pro — verify on marketplace; not free at scale) |
| **Auth** | `X-RapidAPI-Key` + `X-RapidAPI-Host: woolworths-products-api.p.rapidapi.com` |
| **AU coverage** | Woolworths Australia products |
| **Features** | Product search, barcode search, price changes; images/prices when returned by host |

**Public Woolworths UI endpoints** (`https://www.woolworths.com.au/apis/ui/Search/products`) are **unofficial / reverse-engineered**, session-sensitive, and fragile — **not recommended** for production SaaS.

**Recommended:** Yes as **abstracted provider** when `WOOLWORTHS_API_KEY` is set; fall back to mock/cache otherwise.

---

## Coles Product Price API (RapidAPI — Data Holdings Group)

| | |
|---|---|
| **Status** | **Unofficial** third-party marketplace API |
| **Docs** | https://rapidapi.com/data-holdings-group-data-holdings-group-default/api/coles-product-price-api |
| **Pricing** | RapidAPI plans |
| **Auth** | `X-RapidAPI-Key` + `X-RapidAPI-Host: coles-product-price-api.p.rapidapi.com` |
| **AU coverage** | Coles Australia |
| **Features** | Product search (name, brand, price, size, URL); price-changes endpoint |

Coles has **no public official product API**. Direct `api.coles.com.au` use is internal and ToS-hostile.

**Recommended:** Yes as abstracted RapidAPI provider with soft-fail when unconfigured.

---

## Apify ALDI Australia scrapers

| | |
|---|---|
| **Status** | **Unofficial** community Actors |
| **Examples** | https://apify.com/abotapi/aldi-com-au-scraper · https://apify.com/solidcode/aldi-com-au-scraper |
| **Pricing** | Apify platform compute units + Actor listing price (e.g. ~$2.5/1k results on some Actors) |
| **Auth** | `APIFY_API_TOKEN`; Actor id e.g. `abotapi/aldi-com-au-scraper` |
| **AU coverage** | aldi.com.au |
| **Features** | Search, prices, was-price/specials, unit price, images, Special Buys dates (Actor-dependent) |

**Recommended:** Yes for weekly ALDI catalogue refresh (not per-keystroke search). Prefer run-sync dataset items API.

---

## Open Food Facts API

| | |
|---|---|
| **Status** | **Official** open data API |
| **Docs** | https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/ |
| **Pricing** | Free (ODbL); rate limits (~15 product reads/min/IP, ~10 searches/min/IP) |
| **Auth** | Custom `User-Agent` required for reads; account for writes |
| **AU coverage** | Global DB including AU products (coverage uneven) |
| **Features** | Barcode lookup (`/api/v2/product/{barcode}`), nutrition, images, brands. **Not** live supermarket shelf prices |

**Recommended:** Yes — barcode metadata provider.

---

## Recommended production stack

| Concern | Choice | Why |
|---------|--------|-----|
| Nearby stores | Google Places + Geocoding | Official, AU coverage, reliable |
| Postcode validate | Australia Post PAC (optional) | Official AU data |
| Barcode / nutrition meta | Open Food Facts | Official, free, barcode-first |
| Woolworths prices | RapidAPI Woolworths Products (**unofficial**) | Best available managed AU feed |
| Coles prices | RapidAPI Coles Product Price (**unofficial**) | No official Coles API |
| ALDI specials | Apify ALDI Actor (**unofficial**) | Weekly refresh fits catalogue cadence |
| Offline / demos | MockGroceryProvider | Existing mock-prices.json |

### Rejected for production defaults

- Direct Woolworths/Coles HTML/JSON scraping from MealPrep Pro servers (ToS risk, bot detection, brittle)
- Continuous real-time ALDI scraping (costly; weekly Wednesday catalogue refresh is enough)

---

## Weekly refresh strategy

Australian catalogues commonly rotate mid-week. MealPrep Pro uses an **admin-triggered / scheduled weekly refresh**:

1. Call configured Woolworths + Coles providers for seeded search terms
2. Run Apify ALDI Actor for specials
3. Upsert `GroceryProduct` documents + append `PriceHistory` snapshots
4. Store `GrocerySyncMeta.lastSyncedAt` and compute **next Wednesday** refresh date
5. Serve comparisons from MongoDB cache first; live provider calls only when cache miss and keys present
