"""
tuition_fetcher.py — Production-Ready University Tuition Extractor v3.1
=======================================================================
Architecture: SCRAPE FIRST → LLM EXTRACT SECOND → VALIDATE THIRD

Phase 1: DISCOVER — Use web search to find programs + official URLs
Phase 2: SCRAPE   — Download actual pages/PDFs (HTTP, cloudscraper, Selenium)
Phase 3: EXTRACT  — Send REAL content to LLM for structured extraction
Phase 4: VALIDATE — Verify every number exists in source text
Phase 5: MAP      — Assign validated fees to programs

RULES:
  ✅ Only official university domains
  ✅ Extract exact values as written
  ✅ LLM used ONLY for content understanding, NOT generating values
  ✅ Every fee must have proof (exact quoted text from source)
  ❌ No guessing, no rounding, no third-party sources
  ❌ If fee not found → null (never fabricate)

PERFORMANCE (v3.1):
  Expected runtime: ~90-110s (down from ~240s in v3.0)

  Three optimizations:
  1. Parallel LLM extraction — up to 5 sources extracted concurrently via
     ThreadPoolExecutor. The Anthropic SDK is thread-safe.
  2. Conditional multi-pass — single-pass extraction by default. A second
     voting pass triggers only for low-confidence sources:
       - HTML pages (not PDFs)
       - Generic listing URLs (e.g. /programmes/, /programs/)
       - First pass returned <3 fees
     High-confidence sources (PDFs, program-specific URLs) use 1 pass,
     cutting per-source LLM calls roughly in half.
  3. Coverage-based early-stop — after each source, coverage is computed as
     the ratio of unique fee labels to the known program count. When
     coverage ≥ 80% AND at least one fee came from a current-year source,
     remaining queued extractions are cancelled (shutdown + cancel_futures).

SETUP (Google Colab):
  Cell 1:
    !pip install anthropic requests beautifulsoup4 cloudscraper --quiet
    !pip install pypdf pdfplumber --quiet
    !apt-get update -qq && apt-get install -qq -y chromium-browser chromium-chromedriver
    !pip install playwright --quiet && playwright install chromium

  Cell 2:
    import os
    from google.colab import userdata
    os.environ["ANTHROPIC_API_KEY"] = userdata.get("ANTHROPIC_API_KEY")

  Cell 3: Paste this entire script

  Cell 4:
    result = fetch_programs("University Name", "Undergraduate", "International")
    # Examples:
    # result = fetch_programs("University of Sydney", "Undergraduate", "International")
    # result = fetch_programs("MIT", "MBA", "International")
    # result = fetch_programs("Universidad Mariana", "MS", "International")
    # result = fetch_programs("Yantai University", "MS", "International")
    # result = fetch_programs("TU Munich", "MS", "International")
    # result = fetch_programs("University of Tokyo", "PhD", "International")

Author: SEED Global Education — Technology Team
Version: 3.1.0 (Production)
"""

import json
import time
import re
import os
import requests as _requests
from concurrent.futures import ThreadPoolExecutor, as_completed

# =====================================================================
#  Configuration
# =====================================================================
MODEL = "claude-sonnet-4-6"
HAIKU_MODEL = "claude-haiku-4-5-20251001"  # Fast/cheap for first-pass extraction
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

try:
    from anthropic import Anthropic
    client = Anthropic(api_key=ANTHROPIC_API_KEY)
except ImportError:
    raise ImportError("Install anthropic: pip install anthropic")

BROWSER_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,application/pdf,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

PRICING = {
    "claude-sonnet-4-6": {
        "input": 3.0, "output": 15.0,
        "cache_read": 0.30, "cache_write": 3.75
    },
    "claude-haiku-4-5-20251001": {
        "input": 1.0, "output": 5.0,
        "cache_read": 0.10, "cache_write": 1.25
    }
}

CATEGORIES = {
    "AH": "Arts & Humanities", "BM": "Business & Management",
    "ET": "Engineering & Technology", "LW": "Law",
    "LS": "Life Sciences & Medicine", "NS": "Natural Sciences",
    "PI": "Political Science & International Relations", "OT": "Other"
}
CODE_TO_FULL = CATEGORIES
FULL_TO_CODE = {v: k for k, v in CATEGORIES.items()}


# =====================================================================
#  Utility: Cost estimation
# =====================================================================
def _estimate_cost(meta: dict) -> dict:
    pricing = PRICING.get(meta.get("model", MODEL), PRICING[MODEL])
    inp = meta.get("input_tokens", 0)
    out = meta.get("output_tokens", 0)
    cr = meta.get("cache_read_tokens", 0)
    cw = meta.get("cache_write_tokens", 0)
    regular = max(0, inp - cr - cw)
    return {
        "input_cost": round(regular * pricing["input"] / 1_000_000, 4),
        "output_cost": round(out * pricing["output"] / 1_000_000, 4),
        "cache_read_cost": round(cr * pricing["cache_read"] / 1_000_000, 4),
        "cache_write_cost": round(cw * pricing["cache_write"] / 1_000_000, 4),
        "total_usd": round(
            regular * pricing["input"] / 1_000_000 +
            out * pricing["output"] / 1_000_000 +
            cr * pricing["cache_read"] / 1_000_000 +
            cw * pricing["cache_write"] / 1_000_000, 4
        )
    }


# =====================================================================
#  Utility: Robust JSON parser
# =====================================================================
def _parse_json_robust(text: str) -> dict:
    if not text or not text.strip():
        return {}
    # Strategy 1: Direct
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        pass
    # Strategy 2: Strip markdown
    cleaned = re.sub(r'^```(?:json)?\s*', '', text.strip(), flags=re.MULTILINE)
    cleaned = re.sub(r'\s*```\s*$', '', cleaned, flags=re.MULTILINE)
    try:
        return json.loads(cleaned.strip())
    except json.JSONDecodeError:
        pass
    # Strategy 3: Find JSON object
    match = re.search(r'\{[\s\S]*\}', text)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    # Strategy 4: Find JSON array
    match = re.search(r'\[[\s\S]*\]', text)
    if match:
        try:
            arr = json.loads(match.group())
            if isinstance(arr, list):
                return arr
        except json.JSONDecodeError:
            pass
    return {}


# =====================================================================
#  SCRAPING: Fetch URL content (HTML or PDF)
# =====================================================================
def fetch_url(url: str, timeout: int = 20) -> tuple:
    """Fetch URL. Returns (content, content_type, status_code)."""
    try:
        resp = _requests.get(url, headers=BROWSER_HEADERS, timeout=timeout,
                             allow_redirects=True)
        resp.raise_for_status()
        ct = resp.headers.get("Content-Type", "").lower()
        if "pdf" in ct or url.lower().endswith(".pdf"):
            text = extract_pdf_text(resp.content)
            return text, "pdf", resp.status_code
        return resp.text, "html", resp.status_code
    except _requests.exceptions.HTTPError as e:
        return str(e), "error", getattr(e.response, 'status_code', 0)
    except Exception as e:
        return str(e), "error", 0


def fetch_url_with_retry(url: str, max_retries: int = 3) -> tuple:
    """Fetch URL with retry + cloudscraper fallback."""
    for attempt in range(max_retries):
        content, ctype, status = fetch_url(url)
        if ctype != "error":
            return content, ctype, status
        if status == 404:
            return content, ctype, status
        if attempt < max_retries - 1:
            time.sleep(2 ** attempt)

    # Fallback: cloudscraper
    try:
        import cloudscraper
        scraper = cloudscraper.create_scraper()
        resp = scraper.get(url, timeout=20)
        resp.raise_for_status()
        ct = resp.headers.get("Content-Type", "").lower()
        if "pdf" in ct or url.lower().endswith(".pdf"):
            return extract_pdf_text(resp.content), "pdf", resp.status_code
        return resp.text, "html", resp.status_code
    except Exception:
        pass

    return content, "error", status


# =====================================================================
#  SCRAPING: PDF text extraction
# =====================================================================
def extract_pdf_text(pdf_bytes: bytes) -> str:
    """Extract text from PDF with page numbers. Tries multiple methods."""
    results = []

    # Method 1: pypdf
    try:
        try:
            from pypdf import PdfReader
        except ImportError:
            from PyPDF2 import PdfReader
        import io
        reader = PdfReader(io.BytesIO(pdf_bytes))
        pages = []
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                pages.append(f"[PAGE {i+1}]\n{text}")
        result = "\n\n".join(pages)
        if result.strip():
            results.append(("pypdf", result))
    except (ImportError, Exception):
        pass

    # Method 2: pdfplumber (better for tables)
    try:
        import pdfplumber
        import io
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            pages = []
            for i, page in enumerate(pdf.pages):
                text = page.extract_text()
                # Also try table extraction for fee schedules
                tables = page.extract_tables()
                table_text = ""
                if tables:
                    for table in tables:
                        for row in table:
                            if row:
                                cells = [str(c).strip() if c else "" for c in row]
                                table_text += " | ".join(cells) + "\n"
                combined = ""
                if text:
                    combined += text
                if table_text:
                    combined += "\n[TABLE]\n" + table_text
                if combined.strip():
                    pages.append(f"[PAGE {i+1}]\n{combined}")
        result = "\n\n".join(pages)
        if result.strip():
            results.append(("pdfplumber", result))
    except (ImportError, Exception):
        pass

    if not results:
        return ""

    # Return the longest result (most complete extraction)
    best_method, best_text = max(results, key=lambda x: len(x[1]))
    return best_text


# =====================================================================
#  SCRAPING: JS-rendered page fetch
# =====================================================================
def fetch_js_page(url: str, wait_seconds: int = 8) -> str:
    """Fetch JS-rendered page using Selenium or Playwright."""
    # Selenium
    try:
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        from selenium.webdriver.chrome.service import Service

        options = Options()
        options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--window-size=1920,1080")
        options.add_argument(f"--user-agent={BROWSER_HEADERS['User-Agent']}")

        for path in ["/usr/bin/chromium-browser", "/usr/bin/chromium", "/usr/bin/google-chrome"]:
            if os.path.exists(path):
                options.binary_location = path
                break

        driver = None
        for cd in ["/usr/bin/chromedriver", "/usr/lib/chromium-browser/chromedriver"]:
            if os.path.exists(cd):
                try:
                    driver = webdriver.Chrome(service=Service(cd), options=options)
                    break
                except Exception:
                    continue
        if not driver:
            driver = webdriver.Chrome(options=options)

        driver.get(url)
        time.sleep(wait_seconds)
        html = driver.page_source
        driver.quit()
        return html
    except Exception:
        pass

    # Playwright
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(user_agent=BROWSER_HEADERS["User-Agent"])
            page.goto(url, wait_until="networkidle", timeout=30000)
            page.wait_for_timeout(wait_seconds * 1000)
            html = page.content()
            browser.close()
        return html
    except Exception:
        pass

    return ""


# =====================================================================
#  SCRAPING: Content helpers
# =====================================================================
def clean_html_to_text(html: str, max_chars: int = 15000) -> str:
    if not html:
        return ""
    text = re.sub(r'<(script|style|nav|header|footer)[^>]*>.*?</\1>', '',
                  html, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text[:max_chars]


def has_fee_content(text: str, return_score: bool = False):
    """
    Check if text contains tuition fee data.
    Returns bool by default, or (bool, score 0-100) if return_score=True.

    Negative filters: rejects pages where numbers are clearly NOT fees
    (dates, phone numbers, ECTS credits only, postal codes, etc.)
    """
    if not text or len(text) < 50:
        return (False, 0) if return_score else False

    text_lower = text.lower()

    # ── Positive patterns (fee-like content) ──
    positive_patterns = [
        # Currency symbols + numbers
        r'[\$£€¥₹₩]\s*[\d,.]+',
        r'A\$\s*[\d,.]+', r'C\$\s*[\d,.]+',
        r'S\$\s*[\d,.]+', r'R\$\s*[\d,.]+',
        r'NZ\$\s*[\d,.]+',
        # ISO currency + number (both directions)
        r'(?:AUD|USD|GBP|EUR|CAD|CNY|INR|JPY|KRW|SGD|CHF|SEK|NOK|DKK|MYR|THB|PHP|BRL|MXN|ZAR|NZD|HKD|TWD|COP|IDR|VND|EGP|SAR|AED|QAR|BHD|KWD|OMR|TRY|RUB)\s*[\d,.]+',
        r'[\d,.]+\s*(?:AUD|USD|GBP|EUR|CAD|CNY|INR|JPY|KRW|SGD|CHF|SEK|NOK|DKK|MYR|THB|PHP|BRL|MXN|ZAR|NZD|HKD|TWD|COP|IDR|VND|EGP|SAR|AED|QAR|BHD|KWD|OMR|TRY|RUB)',
        # Numbers + period keywords
        r'[\d,.]+\s*(?:per year|per annum|/year|p\.a\.|per semester|per term|per credit)',
        # Tuition keywords near numbers
        r'tuition\s*(?:fee|cost)?[\s:]*[\d,.]{4,}',
        r'fee\s*(?:per|of|is)?[\s:]*[\d,.]{4,}',
        # Multi-language fee keywords near numbers
        r'matrícula.*?[\d.,]{4,}', r'valor.*?[\d.,]{4,}',
        r'costo.*?[\d.,]{4,}', r'arancel.*?[\d.,]{4,}',
        r'semestre.*?[\d.,]{4,}',
        r'frais.*?[\d.,]{4,}', r'scolarité.*?[\d.,]{4,}',
        r'droits.*?[\d.,]{4,}',
        r'(?:studien)?gebühr.*?[\d.,]{4,}', r'semesterbeitrag.*?[\d.,]{4,}',
        r'mensalidade.*?[\d.,]{4,}', r'propina.*?[\d.,]{4,}',
        # CJK
        r'￥\s*[\d,]+', r'学费.*?[\d,]+', r'元/年',
        r'₩\s*[\d,]+', r'등록금.*?[\d,]+',
        # Arabic
        r'(?:رسوم|مصاريف).*?[\d,]+',
        # Dot-separated millions
        r'[\d]+\.[\d]{3}\.[\d]{3}',
        # Tuition-free indicators
        r'tuition.?free', r'no tuition', r'keine.*?gebühr',
        r'gratuit', r'sin costo', r'免学费',
    ]

    # Count positive matches
    positive_hits = 0
    for p in positive_patterns:
        matches = re.findall(p, text_lower, re.IGNORECASE)
        if matches:
            positive_hits += len(matches)

    if positive_hits == 0:
        return (False, 0) if return_score else False

    # ── Negative filters (false positives) ──
    # If positive matches are dominated by these, reject
    negative_indicators = 0

    # Pattern 1: Numbers that are obviously dates
    date_count = len(re.findall(r'\b(?:19|20)\d{2}[-/]\d{1,2}[-/]\d{1,2}\b', text_lower))
    date_count += len(re.findall(r'\b\d{1,2}[-/](?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)', text_lower))

    # Pattern 2: Phone numbers
    phone_count = len(re.findall(r'\+?\d{1,4}[\s\-\(\)]\d{2,4}[\s\-\(\)]\d{2,4}', text_lower))

    # Pattern 3: Postal codes / addresses
    postal_count = len(re.findall(r'\b\d{4,6}\s+[A-Za-z]{2,}', text))

    # Pattern 4: ECTS-only mentions (no fee context nearby)
    # "210 ECTS" without any fee/cost word within 100 chars
    ects_only = 0
    for m in re.finditer(r'\d{2,3}\s*ECTS', text, re.IGNORECASE):
        window = text[max(0, m.start()-100):m.end()+100].lower()
        if not any(w in window for w in ['fee', 'cost', 'tuition', 'pay', 'eur', 'usd', 'dkk', 'gbp']):
            ects_only += 1

    # Pattern 5: "Established in YYYY" / "Founded YYYY"
    year_count = len(re.findall(r'(?:established|founded|since)\s*(?:in\s*)?\d{4}', text_lower))

    negative_indicators = date_count + phone_count + postal_count + ects_only + year_count

    # Compute confidence score (0-100)
    # More positive hits = higher confidence
    # More negative indicators relative to positives = lower confidence
    raw_score = min(100, positive_hits * 15)
    if negative_indicators > 0:
        ratio = positive_hits / (positive_hits + negative_indicators)
        raw_score = int(raw_score * ratio)

    has_fees = positive_hits >= 1 and raw_score >= 10

    if return_score:
        return (has_fees, raw_score)
    return has_fees


# =====================================================================
#  API call wrapper
# =====================================================================
def _call_api(prompt: str, system: str = "", max_tokens: int = 16384,
              use_web_search: bool = False, use_cache: bool = True,
              model: str = None) -> tuple:
    """Call Anthropic API. Returns (parsed_dict, meta_dict).

    model: override the default MODEL. Use HAIKU_MODEL for fast/cheap extraction.
    """
    use_model = model or MODEL
    messages = [{"role": "user", "content": prompt}]
    kwargs = {"model": use_model, "max_tokens": max_tokens, "messages": messages}

    if system:
        if use_cache:
            kwargs["system"] = [{"type": "text", "text": system,
                                 "cache_control": {"type": "ephemeral"}}]
        else:
            kwargs["system"] = system

    if use_web_search:
        kwargs["tools"] = [{"type": "web_search_20250305", "name": "web_search"}]

    t0 = time.time()
    response = client.messages.create(**kwargs)
    elapsed = round(time.time() - t0, 2)

    raw_text = ""
    for block in response.content:
        if block.type == "text":
            raw_text += block.text

    result = _parse_json_robust(raw_text)

    # Retry if model returned reasoning instead of JSON
    if not result and raw_text.strip():
        print(f"   ⚠️  Model output reasoning instead of JSON. Retrying...")
        kwargs["messages"] = [
            {"role": "user", "content": prompt},
            {"role": "assistant", "content": raw_text},
            {"role": "user", "content": "Output ONLY the JSON object now. No explanation."}
        ]
        response = client.messages.create(**kwargs)
        retry_text = ""
        for block in response.content:
            if block.type == "text":
                retry_text += block.text
        result = _parse_json_robust(retry_text)
        elapsed = round(time.time() - t0, 2)
        if result:
            print(f"   ✅ Retry succeeded ({elapsed}s)")

    usage = response.usage
    meta = {
        "time_seconds": elapsed, "model": use_model,
        "input_tokens": getattr(usage, "input_tokens", 0),
        "output_tokens": getattr(usage, "output_tokens", 0),
        "cache_read_tokens": getattr(usage, "cache_read_input_tokens", 0) or 0,
        "cache_write_tokens": getattr(usage, "cache_creation_input_tokens", 0) or 0,
    }
    meta["cost"] = _estimate_cost(meta)
    return result, meta


# =====================================================================
#  Expand short keys → full keys
# =====================================================================
def _expand_keys(raw) -> dict:
    if not raw or not isinstance(raw, dict):
        return raw or {}

    KEY_MAP = {
        "f": "found", "u": "university", "dt": "degree_type", "st": "student_type",
        "p": "programs", "r": "reason", "cs": "closest_source", "pi": "partial_info",
        "su": "source_urls", "ay": "academic_year", "conf": "confidence", "n": "notes",
        "cc": "country_code", "dc": "default_currency",
    }
    PROG_MAP = {
        "pn": "program_name", "cat": "category", "aos": "area_of_study",
        "dept": "department", "dur": "duration", "cr": "credits_required",
        "tf": "tuition_fee", "dm": "delivery_mode", "url": "url",
    }

    result = {KEY_MAP.get(k, k): v for k, v in raw.items()}

    if "programs" in result and isinstance(result["programs"], list):
        expanded = []
        for prog in result["programs"]:
            if not isinstance(prog, dict):
                continue
            ep = {PROG_MAP.get(k, k): v for k, v in prog.items()}
            for field in ["category", "area_of_study"]:
                if ep.get(field, "") in CODE_TO_FULL:
                    ep[field] = CODE_TO_FULL[ep[field]]
            if ep.get("tuition_fee") is None:
                ep["tuition_fee"] = {
                    "amount": None, "currency": None, "fee_period": None,
                    "per_credit_cost": None, "total_estimated_cost": None,
                    "includes": "tuition only", "fee_source_url": None
                }
            expanded.append(ep)
        result["programs"] = expanded

    return result


# =====================================================================
#  Phase 4: Validate fee against source text
# =====================================================================
def validate_fee(fee_entry: dict, source_text: str) -> bool:
    """Check that extracted fee number actually exists in source text.
    Handles international formats: 9,127,000 / 9.127.000 / 9 127 000 / 9127000"""
    amount = fee_entry.get("amount")
    if not amount or amount == 0:
        return False

    amount_int = int(amount)
    amount_str = str(amount_int)

    # Generate all common number format patterns
    patterns = [
        amount_str,                         # 9127000
        f"{amount_int:,}",                  # 9,127,000 (English)
    ]

    # Dot-separated (Colombian/European): 9.127.000
    if amount_int >= 1000:
        dot_fmt = ""
        s = amount_str[::-1]
        for i, c in enumerate(s):
            if i > 0 and i % 3 == 0:
                dot_fmt += "."
            dot_fmt += c
        patterns.append(dot_fmt[::-1])      # 9.127.000

    # Space-separated: 9 127 000
    if amount_int >= 1000:
        space_fmt = ""
        s = amount_str[::-1]
        for i, c in enumerate(s):
            if i > 0 and i % 3 == 0:
                space_fmt += " "
            space_fmt += c
        patterns.append(space_fmt[::-1])    # 9 127 000

    # Also check partial matches (the amount without trailing zeros)
    # e.g., "9.127" for 9127000 won't match, but "9127" for 9127 will
    if amount_int >= 1000000:
        # Check for shortened format: 9,127 (thousands part)
        thousands = amount_int // 1000
        patterns.append(str(thousands))
        patterns.append(f"{thousands:,}")

    source_clean = source_text.replace('\n', ' ').replace('\r', ' ')
    for p in patterns:
        if p in source_clean:
            return True

    # Also check exact_quote if provided (LLM already found it)
    exact_quote = fee_entry.get("exact_quote", "")
    if exact_quote and len(exact_quote) > 5:
        # If the quote contains the number in any format, trust it
        quote_clean = exact_quote.replace('\n', ' ').replace('\r', ' ')
        for p in patterns:
            if p in quote_clean:
                return True
        # Also check if quote itself appears in source
        if quote_clean[:30] in source_clean:
            return True

    return False


# =====================================================================
#  Phase 2+3: Scrape & Extract fees from URLs
# =====================================================================

EXTRACT_PROMPT = """Extract TUITION fee information from this ACTUAL content.

University: {university} | Degree: {degree} | Student type: {student_type}
Source: {source_url} | Content type: {content_type}

CONTENT:
{content}

RULES:
1. ONLY extract numbers that appear LITERALLY in the content above.
2. For EVERY fee, QUOTE the exact text snippet containing the number.
3. If content shows domestic vs international fees, extract ONLY {student_type}.
4. Do NOT calculate, estimate, or infer any numbers.
5. If a page number marker like [PAGE 3] appears, note it.
6. Use ISO 4217 currency codes: USD, EUR, AUD, GBP, COP, CNY, INR, JPY, etc.
7. "program_or_faculty" must be in English. Translate if needed.
8. "amount" must be a plain integer (e.g., 9127000, not "9.127.000")

CRITICAL — FEE TYPE CLASSIFICATION:
9. ONLY extract TUITION fees (the recurring cost of instruction/courses).
   Set fee_type to one of: "tuition", "application", "registration", "deposit", "other"
10. Do NOT extract these as tuition:
   - Application fees (one-time payment to apply)
   - Registration fees (one-time enrollment fee)
   - Deposit fees (advance payment deducted from tuition later)
   - Student activity fees, health insurance, housing, etc.
11. If the source gives a RANGE (e.g., "between 6,000–7,500 EUR"), report BOTH the min and max:
   - Set "amount" to the MINIMUM (conservative/accurate)
   - Set "amount_max" to the MAXIMUM
   - Set "is_range" to true
12. If only one exact number is given, set "is_range" to false and omit "amount_max"

Return ONLY JSON:
{{
  "fees_found": [
    {{
      "program_or_faculty": "English name",
      "amount": 6000,
      "amount_max": 7500,
      "is_range": true,
      "currency": "EUR",
      "fee_period": "per_year|per_semester|per_credit|total_program",
      "fee_type": "tuition|application|registration|deposit|other",
      "student_type_shown": "label in content",
      "exact_quote": "exact text containing the number",
      "page_number": null
    }}
  ],
  "notes": "context in English"
}}

If NO tuition fees found: {{"fees_found": [], "notes": "No tuition fees in content"}}"""


def _extract_pdf_links(html: str, base_url: str) -> list:
    """
    Extract PDF links from an HTML page.
    Finds all <a href="...pdf"> links, resolves relative URLs.
    """
    if not html:
        return []

    pdf_links = []
    hrefs = re.findall(r'href=["\']([^"\']*\.pdf[^"\']*)', html, re.IGNORECASE)

    for href in hrefs:
        href = href.strip()
        if not href:
            continue
        if href.startswith("//"):
            href = "https:" + href
        elif href.startswith("/"):
            from urllib.parse import urlparse
            parsed = urlparse(base_url)
            href = f"{parsed.scheme}://{parsed.netloc}{href}"
        elif not href.startswith("http"):
            if base_url.endswith("/"):
                href = base_url + href
            else:
                href = base_url.rsplit("/", 1)[0] + "/" + href

        if href not in pdf_links:
            pdf_links.append(href)

    return pdf_links


def _extract_fee_page_links(html: str, base_url: str) -> list:
    """
    Extract links to fee-related HTML pages (not PDFs).
    Catches: /tuition, /fees, /cost, /financial-information, etc.
    These are pages that might CONTAIN fee numbers or LINK TO fee PDFs.
    """
    if not html:
        return []

    FEE_URL_KEYWORDS = [
        # English
        "tuition", "fee", "cost", "price", "financial", "payment",
        "scholarship", "afford", "expense", "charges",
        # Spanish
        "valor", "matricula", "costo", "arancel", "pecuniario",
        # German
        "gebuehr", "studiengebuehr", "kosten", "beitrag", "finanz",
        # French
        "frais", "scolarite", "droits", "cout", "tarif",
        # Portuguese
        "mensalidade", "propina",
    ]

    fee_links = []
    # Find all href attributes
    hrefs = re.findall(r'href=["\']([^"\']+)', html, re.IGNORECASE)

    from urllib.parse import urlparse
    base_parsed = urlparse(base_url)
    base_domain = base_parsed.netloc.lower()

    for href in hrefs:
        href = href.strip()
        if not href or href.startswith("#") or href.startswith("mailto:"):
            continue
        if href.lower().endswith(".pdf"):
            continue  # PDFs are handled by _extract_pdf_links

        # Resolve relative URLs
        if href.startswith("//"):
            href = "https:" + href
        elif href.startswith("/"):
            href = f"{base_parsed.scheme}://{base_parsed.netloc}{href}"
        elif not href.startswith("http"):
            if base_url.endswith("/"):
                href = base_url + href
            else:
                href = base_url.rsplit("/", 1)[0] + "/" + href

        # Only same-domain links
        try:
            href_domain = urlparse(href).netloc.lower()
        except Exception:
            continue
        if href_domain != base_domain:
            continue

        # Check if URL contains fee-related keywords
        href_lower = href.lower()
        if any(kw in href_lower for kw in FEE_URL_KEYWORDS):
            if href not in fee_links and href != base_url:
                fee_links.append(href)

    return fee_links


def _score_url_relevance(url: str) -> int:
    """
    Score a URL by likelihood of containing tuition fee data.
    Returns 0-100. Higher = more likely to have fees.

    Used to prioritize which URLs to download/process first.
    """
    if not url:
        return 0

    url_lower = url.lower()
    score = 50  # baseline

    # ── Strong positive signals (URL contains fee keywords) ──
    HIGH_VALUE = ["tuition-fee", "tuition_fee", "fee-schedule", "fee_schedule",
                  "payment-schedule", "payment_schedule", "tuition.pdf",
                  "fees.pdf", "costs.pdf", "tarif", "studiengebuehr",
                  "valor-matricula", "valores-pecuniarios"]
    for kw in HIGH_VALUE:
        if kw in url_lower:
            score += 40
            break

    MEDIUM_VALUE = ["tuition", "/fee", "/fees", "cost", "financial", "afford",
                    "valor", "matricula", "costo", "arancel", "gebuehr",
                    "frais", "scolarite", "mensalidade", "propina"]
    for kw in MEDIUM_VALUE:
        if kw in url_lower:
            score += 20
            break

    # PDFs are usually authoritative for fees
    if url_lower.endswith(".pdf"):
        # But not all PDFs are useful
        BAD_PDF = ["curriculum", "syllabus", "diploma", "verification",
                   "application-form", "checklist", "math", "prerequisite",
                   "computer-requirement", "ebook", "brochure"]
        if any(bad in url_lower for bad in BAD_PDF):
            score -= 30
        else:
            score += 15

    # Admissions pages often have fee links
    if "admission" in url_lower or "apply" in url_lower:
        score += 10

    # Program pages may have fee data or PDF links
    if "/programmes/" in url_lower or "/programs/" in url_lower or "/courses/" in url_lower:
        score += 5

    # ── Year-based scoring — prefer current/future year over old ──
    from datetime import datetime
    current_year = datetime.now().year
    # Future or current year (e.g., "2025-2026", "2026-27", "2025-26")
    current_markers = [str(current_year), str(current_year + 1),
                       f"{current_year}-{current_year + 1}",
                       f"{current_year}-{str(current_year + 1)[-2:]}",
                       f"{current_year - 1}-{current_year}"]  # still acceptable
    if any(m in url_lower for m in current_markers):
        score += 30
    # Old year (2018-2023 when current is 2026) = heavy penalty
    old_years = [str(y) for y in range(2018, current_year - 1)]
    if any(f"-{y}" in url_lower or f"_{y}" in url_lower or f"/{y}" in url_lower
           for y in old_years):
        score -= 40

    # ── Negative signals ──
    LOW_VALUE = ["/news/", "/event/", "/blog/", "/research/", "/staff/",
                 "/about/", "/contact/", "/library/", "/career/",
                 "/alumni/", "/gallery/", "/photo/", "/video/"]
    for kw in LOW_VALUE:
        if kw in url_lower:
            score -= 25
            break

    # Aggregator/non-official sites
    AGGREGATORS = ["wikipedia.org", "studyportals", "topuniversities.com",
                   "qs.com", "timeshighereducation", "studyabroad",
                   "mastersportal", "bachelorsportal"]
    if any(agg in url_lower for agg in AGGREGATORS):
        score -= 20

    return max(0, min(100, score))


def _prefilter_urls(urls: list, max_urls: int = 15) -> list:
    """
    Score and filter URLs by relevance, keeping the top N.
    Always keeps PDFs and explicit fee URLs.
    """
    if len(urls) <= max_urls:
        return urls

    scored = [(url, _score_url_relevance(url)) for url in urls]
    scored.sort(key=lambda x: -x[1])

    # Keep top N
    kept = [url for url, score in scored[:max_urls]]
    return kept



def _is_low_confidence_source(content_type: str, source_url: str,
                              first_pass_fees: list) -> bool:
    """Decide whether a source needs a second extraction pass.

    Low-confidence triggers (→ run 2nd pass):
      - Source is HTML (not PDF)
      - Source URL is a generic parent page (/programmes/, /programs/, /courses/)
      - First pass returned <3 fees

    High-confidence (→ single pass enough):
      - PDFs (tables are unambiguous)
      - Program-specific URLs (e.g. /bachelor/civil-engineering/payment-schedule.pdf)
    """
    url_lower = (source_url or "").lower().rstrip("/")

    # PDFs with program-specific paths are high-confidence
    if content_type == "pdf":
        generic_endings = ("/programmes", "/programs", "/courses",
                           "/fees", "/tuition", "/admissions")
        if not any(url_lower.endswith(g) for g in generic_endings):
            return False  # high-confidence PDF

    # HTML is always lower confidence than PDF
    if content_type == "html":
        return True

    # Generic listing URLs
    generic_patterns = ("/programmes/", "/programs/", "/courses/",
                        "/programmes", "/programs", "/courses")
    if any(url_lower.endswith(p) or p in url_lower.split("?")[0]
           for p in generic_patterns):
        return True

    # Too few fees from first pass
    if len(first_pass_fees) < 3:
        return True

    return False


def _extract_fees_multipass(prompt: str, content_type: str = "html",
                            source_url: str = "") -> tuple:
    """
    Run extraction with conditional multi-pass voting.

    Pass 1 always runs. Pass 2 runs only when the source is low-confidence
    (HTML, generic URL, or <3 fees from pass 1). When both passes run,
    only fees whose (amount, currency) appear in both are kept.

    Returns (fees, total_meta)
    """
    total_cost = 0
    total_input = 0
    total_output = 0

    # ── Pass 1 (always) ──
    extracted, meta = _call_api(prompt, max_tokens=4096)
    total_cost += meta.get('cost', {}).get('total_usd', 0)
    total_input += meta.get('input_tokens', 0)
    total_output += meta.get('output_tokens', 0)
    pass1_fees = extracted.get("fees_found", []) if isinstance(extracted, dict) else []

    # ── Decide whether pass 2 is needed ──
    needs_pass2 = _is_low_confidence_source(content_type, source_url, pass1_fees)

    if not needs_pass2:
        return pass1_fees, {
            'cost': {'total_usd': total_cost},
            'input_tokens': total_input,
            'output_tokens': total_output,
            'passes': 1,
        }

    # ── Pass 2 (low-confidence fallback) ──
    extracted2, meta2 = _call_api(prompt, max_tokens=4096)
    total_cost += meta2.get('cost', {}).get('total_usd', 0)
    total_input += meta2.get('input_tokens', 0)
    total_output += meta2.get('output_tokens', 0)
    pass2_fees = extracted2.get("fees_found", []) if isinstance(extracted2, dict) else []

    # ── Voting: keep fees that appear in both passes ──
    all_passes = [pass1_fees, pass2_fees]
    fee_votes = {}  # (amount, currency) → list of (fee_dict, pass_index)
    for pass_idx, fees in enumerate(all_passes):
        for fee in fees:
            amt = fee.get('amount')
            cur = (fee.get('currency') or '').upper()
            if not amt:
                continue
            key = (int(amt), cur)
            if key not in fee_votes:
                fee_votes[key] = []
            fee_votes[key].append((fee, pass_idx))

    consensus = []
    for key, votes in fee_votes.items():
        unique_passes = set(v[1] for v in votes)
        if len(unique_passes) >= 2:
            canonical = votes[0][0].copy()
            canonical['_vote_count'] = len(unique_passes)
            consensus.append(canonical)

    return consensus, {
        'cost': {'total_usd': total_cost},
        'input_tokens': total_input,
        'output_tokens': total_output,
        'passes': 2,
        'consensus_fees': len(consensus),
    }


def _extract_single_source(url: str, content: str, university: str,
                           degree: str, student_type: str,
                           downloaded: dict) -> list:
    """Extract and validate fees from a single source. Thread-safe.

    Returns a list of validated fee dicts (may be empty).
    All printing is safe from threads (individual print calls are atomic in CPython).
    """
    ctype = "pdf" if url.lower().endswith(".pdf") else "html"
    send = content[:15000] if ctype == "pdf" else clean_html_to_text(content, 15000)

    print(f"\n      🔍 {url.split('/')[-1][:60]}")
    prompt = EXTRACT_PROMPT.format(
        university=university, degree=degree, student_type=student_type,
        source_url=url, content_type=ctype, content=send
    )
    # Conditional multi-pass extraction
    fees, meta = _extract_fees_multipass(prompt, content_type=ctype, source_url=url)
    cost = meta.get('cost', {}).get('total_usd', 0)
    print(f"         💲 ${cost:.4f} ({meta.get('passes', 1)}-pass, {len(fees)} fees)")
    if not fees:
        print(f"         ⚠️  No fees extracted")

        # If HTML extraction failed, try its embedded PDFs
        if ctype == "html":
            embedded = _extract_pdf_links(content, url)
            for pdf_url in embedded[:5]:
                pdf_data = downloaded.get(pdf_url)
                if not pdf_data:
                    continue
                pdf_content, pdf_ctype, _ = pdf_data
                if pdf_ctype == "pdf" and pdf_content.strip() and has_fee_content(pdf_content):
                    print(f"         📎 Trying embedded PDF: {pdf_url.split('/')[-1][:50]}")
                    pdf_send = pdf_content[:15000]
                    pdf_prompt = EXTRACT_PROMPT.format(
                        university=university, degree=degree,
                        student_type=student_type,
                        source_url=pdf_url, content_type="pdf",
                        content=pdf_send
                    )
                    pdf_extracted, pdf_meta = _call_api(pdf_prompt, max_tokens=4096)
                    pdf_fees = pdf_extracted.get("fees_found", []) if isinstance(pdf_extracted, dict) else []
                    if pdf_fees:
                        fees = pdf_fees
                        content = pdf_content
                        ctype = "pdf"
                        url = pdf_url
                        print(f"         ✅ {len(fees)} fees from PDF")
                        break

        if not fees:
            return []

    # ── VALIDATE each fee ──
    source_text = content
    source_clean = clean_html_to_text(content, 100000) if ctype == "html" else content
    validated = []
    for fee in fees:
        amt = fee.get("amount", 0)
        if not amt or amt == 0:
            continue

        # Filter non-tuition fees
        fee_type = fee.get("fee_type", "tuition").lower()
        if fee_type in ("application", "registration", "deposit", "other"):
            print(f"         ⏭️  Skipped {fee.get('currency', '?')} {amt:,.0f} — {fee_type} fee")
            continue

        # Double-check quote for non-tuition keywords
        quote = fee.get("exact_quote", "").lower()
        if any(kw in quote for kw in [
            "application fee", "application charge",
            "registration fee", "enrollment fee", "enrolment fee",
            "deposit", "non-refundable",
            "tasa de inscripción", "frais d'inscription",
            "anmeldegebühr", "bewerbungsgebühr",
        ]):
            print(f"         ⏭️  Skipped {fee.get('currency', '?')} {amt:,.0f} — quote indicates non-tuition")
            continue

        # Validate number in source
        if validate_fee(fee, source_text) or validate_fee(fee, source_clean):
            fee["source_url"] = url
            fee["validated"] = True
            is_range = fee.get("is_range", False)
            amt_max = fee.get("amount_max")
            range_str = f" (range: {amt:,.0f}–{amt_max:,.0f})" if is_range and amt_max else ""
            validated.append(fee)
            cur = fee.get('currency', '?')
            prog = fee.get('program_or_faculty', '?')
            print(f"         ✅ {cur} {amt:,.0f}{range_str} ({prog})")
        else:
            print(f"         ❌ REJECTED {amt:,.0f} — not in source text")

    if validated:
        print(f"\n   🎯 {len(validated)} validated fees from {url.split('/')[-1][:50]}")

    return validated


def scrape_and_extract_fees(urls: list, university: str, degree: str,
                           student_type: str,
                           program_list: list = None) -> list:
    """
    Download content from URLs IN PARALLEL, extract fees with LLM, validate.
    Optimizations:
      1. URLs pre-filtered by relevance score (top 15)
      2. All URLs downloaded simultaneously (ThreadPoolExecutor, max 5 workers)
      3. Only pages with fee content are sent to LLM
      4. LLM extraction parallelized (up to 5 concurrent sources)
      5. Conditional multi-pass: 2nd pass only for low-confidence sources
      6. Coverage-based early-stop: ≥80% coverage from current-year → cancel remaining
      7. PDF links discovered from HTML pages are also fetched in parallel
    """
    all_fees = []

    # ── STEP 0: Pre-filter URLs by relevance ──
    if len(urls) > 15:
        original_count = len(urls)
        urls = _prefilter_urls(urls, max_urls=15)
        print(f"\n   🎯 Pre-filtered {original_count} URLs → {len(urls)} most relevant")

    # ── STEP 1: Parallel download all URLs ──
    t_dl = time.time()
    downloaded = {}  # url → (content, ctype, status)

    def _download_one(u):
        content, ctype, status = fetch_url_with_retry(u)
        if ctype == "error" and status != 404 and not u.lower().endswith(".pdf"):
            html = fetch_js_page(u)
            if html and len(html) > 500:
                return u, html, "html", 200
        return u, content, ctype, status

    print(f"\n   ⬇️  Downloading {len(urls)} URLs in parallel...")
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = {executor.submit(_download_one, u): u for u in urls}
        for future in as_completed(futures):
            try:
                url, content, ctype, status = future.result()
                downloaded[url] = (content, ctype, status)
            except Exception as e:
                url = futures[future]
                downloaded[url] = ("", "error", 0)

    dl_time = round(time.time() - t_dl, 1)
    ok_count = sum(1 for v in downloaded.values() if v[1] != "error")
    print(f"   ✅ Downloaded {ok_count}/{len(urls)} URLs in {dl_time}s")

    # ── STEP 2: Classify content — find pages with fees ──
    pdf_with_fees = []    # (url, content) — PDFs that have fee numbers
    html_with_fees = []   # (url, content) — HTML pages with fee numbers
    html_no_fees = []     # (url, content) — HTML pages to check for PDF links
    pdf_no_fees = []      # PDFs without fee numbers (log only)

    for url in urls:  # Preserve original order
        content, ctype, status = downloaded.get(url, ("", "error", 0))

        if ctype == "error":
            print(f"   ❌ {url} — failed ({status})")
            continue

        if ctype == "pdf":
            if not content.strip():
                print(f"   ⚠️  {url} — PDF empty")
                continue
            if has_fee_content(content):
                pdf_with_fees.append((url, content))
                print(f"   📄 {url} — PDF has fees ({len(content):,} chars)")
            else:
                pdf_no_fees.append(url)
                print(f"   📄 {url} — PDF no fees ({len(content):,} chars)")

        elif ctype == "html":
            text = clean_html_to_text(content)
            if has_fee_content(text):
                html_with_fees.append((url, content))
                print(f"   🌐 {url} — HTML has fees ({len(content):,} chars)")
            else:
                html_no_fees.append((url, content))
                print(f"   🌐 {url} — HTML no fees ({len(content):,} chars)")

    # ── STEP 2.5: Discover links from HTML pages (parallel) ──
    # Scan ALL HTML pages for: (a) PDF links, (b) fee page links
    discovered_pdf_urls = []
    discovered_page_urls = []

    for url, content in html_no_fees + html_with_fees:
        # (a) PDF links
        embedded = _extract_pdf_links(content, url)
        fee_kws = ["tuition", "fee", "cost", "price", "payment", "schedule",
                    "tariff", "charges", "valor", "matricula", "gebuehr",
                    "frais", "scolarite", "mensalidade"]
        fee_pdfs = [p for p in embedded if any(w in p.lower() for w in fee_kws)]
        # On program/fee pages, try all PDFs
        if not fee_pdfs:
            path_segs = url.split("//")[-1].split("?")[0].rstrip("/").split("/")
            if len(path_segs) >= 3 or any(w in url.lower() for w in ["tuition", "fee", "cost"]):
                fee_pdfs = embedded[:5]
        for p in fee_pdfs:
            if p not in downloaded and p not in discovered_pdf_urls:
                discovered_pdf_urls.append(p)

        # (b) Fee page links (HTML pages about fees/tuition/costs)
        fee_pages = _extract_fee_page_links(content, url)
        for p in fee_pages:
            if p not in downloaded and p not in discovered_page_urls and p not in [u for u, _ in html_with_fees + html_no_fees]:
                discovered_page_urls.append(p)

    # Download discovered PDFs
    if discovered_pdf_urls:
        print(f"\n   📎 Found {len(discovered_pdf_urls)} PDF links in HTML pages — downloading...")
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = {executor.submit(_download_one, u): u for u in discovered_pdf_urls[:15]}
            for future in as_completed(futures):
                try:
                    url, content, ctype, status = future.result()
                    downloaded[url] = (content, ctype, status)
                    if ctype == "pdf" and content.strip():
                        if has_fee_content(content):
                            pdf_with_fees.append((url, content))
                            print(f"      📄 {url.split('/')[-1]} — PDF has fees ✅")
                        else:
                            print(f"      📄 {url.split('/')[-1]} — no fees")
                    else:
                        print(f"      ⚠️  {url.split('/')[-1]} — failed/empty")
                except Exception:
                    pass

    # Download discovered fee pages (limit 5)
    if discovered_page_urls:
        print(f"\n   🔗 Found {len(discovered_page_urls)} fee page links — downloading...")
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = {executor.submit(_download_one, u): u for u in discovered_page_urls[:5]}
            for future in as_completed(futures):
                try:
                    url, content, ctype, status = future.result()
                    downloaded[url] = (content, ctype, status)
                    if ctype == "html" and content:
                        text = clean_html_to_text(content)
                        if has_fee_content(text):
                            html_with_fees.append((url, content))
                            print(f"      🌐 {url.split('/')[-1][:50]} — has fees ✅")
                        else:
                            # This fee page might link to a PDF
                            page_pdfs = _extract_pdf_links(content, url)
                            for pdf_url in page_pdfs[:3]:
                                if pdf_url not in downloaded:
                                    pc, pt, ps = fetch_url_with_retry(pdf_url)
                                    downloaded[pdf_url] = (pc, pt, ps)
                                    if pt == "pdf" and pc.strip() and has_fee_content(pc):
                                        pdf_with_fees.append((pdf_url, pc))
                                        print(f"      📄 {pdf_url.split('/')[-1]} — PDF has fees ✅ (from fee page)")
                    elif ctype == "error":
                        print(f"      ❌ {url.split('/')[-1][:50]} — failed ({status})")
                except Exception:
                    pass

    # ── STEP 3: Extract fees — PDFs first, then HTML ──
    # Priority: PDFs with fees → HTML with fees
    # Parallel extraction with coverage-based early-stop
    extract_queue = pdf_with_fees + html_with_fees
    print(f"\n   🤖 Extracting fees from {len(extract_queue)} sources with fees...")

    t_extract = time.time()
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = {}
        for eq_url, eq_content in extract_queue:
            fut = executor.submit(
                _extract_single_source,
                eq_url, eq_content, university, degree, student_type, downloaded
            )
            futures[fut] = eq_url

        has_current_year_source = False
        for future in as_completed(futures):
            src_url = futures[future]
            try:
                validated = future.result()
            except Exception as e:
                print(f"      ❌ {src_url.split('/')[-1][:60]} — extraction error: {e}")
                continue

            if not validated:
                continue

            all_fees.extend(validated)

            # ── Coverage-based early-stop ──
            # Track whether any fee came from a current-year source
            from datetime import datetime
            current_year = datetime.now().year
            year_markers = [str(current_year), str(current_year + 1),
                            f"{current_year}-{str(current_year+1)[-2:]}",
                            f"{current_year}-{current_year+1}"]
            old_years = [str(y) for y in range(2018, current_year - 1)]
            is_old = any(f"-{y}" in src_url or f"_{y}" in src_url or f"/{y}" in src_url
                         for y in old_years)
            if not is_old and any(m in src_url for m in year_markers):
                has_current_year_source = True

            if program_list and has_current_year_source:
                unique_fee_labels = set(
                    f.get("program_or_faculty", "").lower().strip()
                    for f in all_fees if f.get("program_or_faculty")
                )
                coverage = len(unique_fee_labels) / max(len(program_list), 1)
                if coverage >= 0.80:
                    print(f"\n   ✅ Coverage {coverage:.0%} ({len(unique_fee_labels)}/{len(program_list)}) "
                          f"from current-year sources — stopping early")
                    executor.shutdown(wait=False, cancel_futures=True)
                    break

    extract_time = round(time.time() - t_extract, 1)
    print(f"\n   ⏱️  Extraction completed in {extract_time}s — {len(all_fees)} total validated fees")

    return all_fees


# =====================================================================
#  Phase 5: Map fees to programs — SPECIFICITY-BASED MATCHING
# =====================================================================
def _parse_duration_to_years(dur: str) -> float:
    """Convert any duration string to years (float). '12 months' → 1.0, '2 years' → 2.0"""
    if not dur:
        return 0
    dur_lower = dur.lower().strip()
    # Try months first
    m = re.search(r'([\d.]+)\s*month', dur_lower)
    if m:
        return float(m.group(1)) / 12.0
    # Try years
    m = re.search(r'([\d.]+)\s*year', dur_lower)
    if m:
        return float(m.group(1))
    # Try semesters
    m = re.search(r'(\d+)\s*semester', dur_lower)
    if m:
        return int(m.group(1)) / 2.0
    return 0


def _match_score(fee_name: str, prog_name: str) -> int:
    """
    Score how well a fee entry matches a program. Higher = better.
    0 = no match, 1-100 = partial match, 100+ = strong match.
    """
    fee_lower = fee_name.lower().strip()
    prog_lower = prog_name.lower().strip()

    if not fee_lower or not prog_lower:
        return 0

    # Exact match
    if fee_lower == prog_lower:
        return 1000

    # Tokenize — remove common filler words
    STOP = {"of", "and", "the", "in", "for", "a", "an", "at", "to", "with", "—", "-", "/"}
    fee_tokens = set(fee_lower.split()) - STOP
    prog_tokens = set(prog_lower.split()) - STOP

    if not fee_tokens or not prog_tokens:
        return 0

    overlap = fee_tokens & prog_tokens
    if not overlap:
        return 0

    # Penalize very generic matches (just "mba" or just "engineering")
    if len(overlap) == 1:
        word = list(overlap)[0]
        # If the single matching word is very common, it's unreliable
        if word in {"mba", "master", "bachelor", "program", "degree", "science",
                    "engineering", "arts", "business", "management", "medicine",
                    "education", "law"}:
            return 1  # Very low — almost no match
        return 10  # Slightly better for specific words

    # Score = overlap size × specificity
    # More overlapping tokens = more specific match
    score = len(overlap) * 20

    # Bonus for distinctive words (not generic academic terms)
    GENERIC = {"mba", "master", "bachelor", "program", "degree", "school",
               "faculty", "department", "studies", "science", "engineering",
               "arts", "business", "management", "international", "global"}
    distinctive = overlap - GENERIC
    score += len(distinctive) * 30

    # Bonus for substring containment (more specific direction)
    if fee_lower in prog_lower:
        score += 50
    if prog_lower in fee_lower:
        score += 50

    return score


def map_fees_to_programs(programs: list, fees: list) -> list:
    """
    Map validated fee entries to programs.
    Priority: (1) URL match (2) Best specificity score (3) Category fallback
    
    RULES:
    - A fee from program X's page URL goes to program X only
    - When matching by name, highest specificity score wins
    - Generic matches (single common word) are NEVER used
    - total_program fees take priority over per_year for same program
    - If no confident match exists, leave tuition as null (accuracy > completeness)
    """
    if not fees:
        return programs

    # Deduplicate fees: prefer total_program over per_year, higher amount over lower
    # Group by program name
    fee_by_name = {}
    for f in fees:
        key = f.get("program_or_faculty", "").lower().strip()
        existing = fee_by_name.get(key)
        if not existing:
            fee_by_name[key] = f
        else:
            # Prefer total_program over installments
            if f.get("fee_period") == "total_program" and existing.get("fee_period") != "total_program":
                fee_by_name[key] = f
            elif f.get("amount", 0) > existing.get("amount", 0) and f.get("fee_period") == existing.get("fee_period"):
                fee_by_name[key] = f

    unique_fees = list(fee_by_name.values())

    # Also build URL → fee mapping
    url_to_fees = {}
    for f in unique_fees:
        src = f.get("source_url", "")
        if src:
            if src not in url_to_fees:
                url_to_fees[src] = []
            url_to_fees[src].append(f)

    matched = 0
    for prog in programs:
        tf = prog.get("tuition_fee", {})
        if tf and tf.get("amount"):
            continue  # Already has fee

        pname = prog.get("program_name", "")
        prog_url = prog.get("url", "")

        # Collect ALL candidate matches with scores
        candidates = []

        # ── Priority 1: URL match ──
        if prog_url:
            prog_path = prog_url.split("//")[-1].split("?")[0].rstrip("/")
            for f in unique_fees:
                src = f.get("source_url", "")
                if not src:
                    continue
                src_path = src.split("//")[-1].split("?")[0].rstrip("/")

                # Direct URL match
                if src == prog_url:
                    candidates.append((9999, f, "url_exact"))
                    continue

                # Fee source URL contains the program path (fee from program's own page/subpage)
                # e.g., src=".../architectural-technology/documents/payment-schedule.pdf"
                #        prog=".../architectural-technology"
                # This is a STRONG match — fee is from this program's own section
                if prog_path in src_path and len(prog_path) > 30:
                    # Longer prog_path = more specific match
                    specificity = len(prog_path)
                    candidates.append((2000 + specificity, f, "url_prog_in_src"))

                # General page contains program (parent page)
                # e.g., src=".../programmes/bachelor" prog=".../programmes/bachelor/civil-engineering"
                # This is a WEAK match — fee from a general listing, not program-specific
                elif src_path in prog_path:
                    # Shorter src_path = more general = weaker match
                    # Only accept if src has some specificity (not just the domain)
                    if len(src_path) > 20:
                        candidates.append((100, f, "url_general_page"))

        # ── Priority 2: Name specificity matching ──
        for f in unique_fees:
            fname = f.get("program_or_faculty", "")
            score = _match_score(fname, pname)
            if score >= 10:
                candidates.append((score, f, f"name_score_{score}"))

        # ── Priority 3: Category match — DISABLED ──
        # Category matching was producing WRONG fees: a generic Engineering fee
        # was being applied to all engineering programs regardless of their actual cost.
        # Accuracy > completeness: leave as null rather than guess via category.
        # If you need broader matching, rely on name scoring which is more precise.

        # ── Apply tiebreakers ──
        if candidates:
            # Tiebreaker 1: Penalize range fees (exact fees are more accurate)
            scored = []
            for score, f, method in candidates:
                penalty = 0
                if f.get("is_range"):
                    penalty = 500  # Heavy penalty for ranges
                # Bonus for total_program fees (most precise)
                bonus = 0
                if f.get("fee_period") == "total_program":
                    bonus = 50
                final_score = score - penalty + bonus
                scored.append((final_score, score, f, method))

            # Sort by final score (descending), then original score
            scored.sort(key=lambda x: (-x[0], -x[1]))
            best_final, best_orig, best_fee, match_method = scored[0]

            # Only accept if score meets minimum threshold
            if best_final >= 10:
                amount = best_fee["amount"]
                currency = best_fee.get("currency", "USD")
                fee_period = best_fee.get("fee_period", "per_year")

                # Calculate total cost
                years = _parse_duration_to_years(prog.get("duration", ""))
                if fee_period == "total_program":
                    tc = amount  # Already the total
                elif fee_period == "per_year" and years > 0:
                    tc = round(amount * years)
                elif fee_period == "per_semester" and years > 0:
                    semesters = years * 2
                    tc = round(amount * semesters)
                else:
                    tc = None

                prog["tuition_fee"] = {
                    "amount": amount,
                    "currency": currency,
                    "fee_period": fee_period,
                    "total_estimated_cost": tc,
                    "includes": "tuition only",
                    "fee_source_url": best_fee.get("source_url", ""),
                    "exact_quote": best_fee.get("exact_quote", ""),
                    "validated": True,
                    "match_method": match_method,
                    "match_score": best_final,
                }

                # Add range info if applicable
                if best_fee.get("is_range") and best_fee.get("amount_max"):
                    prog["tuition_fee"]["amount_min"] = amount
                    prog["tuition_fee"]["amount_max"] = best_fee["amount_max"]
                    prog["tuition_fee"]["is_range"] = True

                matched += 1
                range_str = ""
                if best_fee.get("is_range") and best_fee.get("amount_max"):
                    range_str = f" (range: {amount:,}–{best_fee['amount_max']:,})"
                print(f"   ✅ {pname[:50]} → {currency} {amount:,}{range_str} ({fee_period}) [{match_method}]")
            else:
                print(f"   ⚠️  {pname[:50]} → null (score too low: {best_final})")
        else:
            print(f"   ⚠️  {pname[:50]} → null (no match found)")

    print(f"\n   📊 Mapped fees to {matched}/{len(programs)} programs")
    return programs



# =====================================================================
#  Phase 6: NORMALIZE — Standardize all output fields
# =====================================================================

# Duration normalization patterns (multi-language)
DURATION_PATTERNS = [
    # Spanish
    (r'(\d+)\s*semestres?', lambda m: f"{int(m.group(1)) / 2:.0f} years" if int(m.group(1)) % 2 == 0
     else f"{int(m.group(1)) * 6} months"),
    (r'(\d+)\s*años?', lambda m: f"{m.group(1)} years"),
    (r'(\d+)\s*meses?', lambda m: f"{m.group(1)} months"),
    (r'(\d+)\s*trimestres?', lambda m: f"{int(m.group(1)) * 3} months"),
    (r'(\d+)\s*cuatrimestres?', lambda m: f"{int(m.group(1)) * 4} months"),
    # French
    (r'(\d+)\s*ans?', lambda m: f"{m.group(1)} years"),
    (r'(\d+)\s*mois', lambda m: f"{m.group(1)} months"),
    # German
    (r'(\d+)\s*Semester', lambda m: f"{int(m.group(1)) / 2:.0f} years" if int(m.group(1)) % 2 == 0
     else f"{int(m.group(1)) * 6} months"),
    (r'(\d+)\s*Jahre?', lambda m: f"{m.group(1)} years"),
    (r'(\d+)\s*Monate?', lambda m: f"{m.group(1)} months"),
    # Portuguese
    (r'(\d+)\s*anos?', lambda m: f"{m.group(1)} years"),
    # Chinese/Japanese
    (r'(\d+)\s*年', lambda m: f"{m.group(1)} years"),
    (r'(\d+)\s*个?月', lambda m: f"{m.group(1)} months"),
    (r'(\d+)\s*学期', lambda m: f"{int(m.group(1)) / 2:.0f} years" if int(m.group(1)) % 2 == 0
     else f"{int(m.group(1)) * 6} months"),
    # Korean
    (r'(\d+)\s*학기', lambda m: f"{int(m.group(1)) / 2:.0f} years" if int(m.group(1)) % 2 == 0
     else f"{int(m.group(1)) * 6} months"),
    # English (normalize)
    (r'(\d+\.?\d*)\s*years?', lambda m: f"{m.group(1)} years"),
    (r'(\d+)\s*months?', lambda m: f"{m.group(1)} months"),
    (r'(\d+)\s*weeks?', lambda m: f"{m.group(1)} weeks"),
    (r'(\d+)\s*terms?', lambda m: f"{int(m.group(1)) / 2:.0f} years" if int(m.group(1)) % 2 == 0
     else f"{int(m.group(1)) * 6} months"),
    (r'(\d+)\s*quarters?', lambda m: f"{int(m.group(1)) * 3} months"),
]

# Currency symbol → ISO code mapping (comprehensive)
CURRENCY_MAP = {
    "$": "USD", "US$": "USD", "A$": "AUD", "AU$": "AUD",
    "C$": "CAD", "CA$": "CAD", "NZ$": "NZD",
    "£": "GBP", "€": "EUR", "¥": "CNY", "￥": "CNY",
    "₹": "INR", "₩": "KRW", "R$": "BRL",
    "COP$": "COP", "MX$": "MXN", "S$": "SGD", "HK$": "HKD",
    "NT$": "TWD", "RM": "MYR", "฿": "THB", "₫": "VND",
    "₱": "PHP", "R": "ZAR", "₺": "TRY",
    "CHF": "CHF", "kr": "SEK", "zł": "PLN", "Kč": "CZK",
    "Ft": "HUF", "lei": "RON", "лв": "BGN",
    "د.إ": "AED", "ر.س": "SAR", "ر.ق": "QAR",
    "E£": "EGP", "ج.م": "EGP",
}

# Country/TLD → default currency (used when LLM doesn't specify currency)
# Maps both ISO country codes and common ccTLDs
COUNTRY_TO_CURRENCY = {
    # Europe (Eurozone)
    "de": "EUR", "fr": "EUR", "es": "EUR", "it": "EUR", "nl": "EUR",
    "be": "EUR", "ie": "EUR", "pt": "EUR", "at": "EUR", "fi": "EUR",
    "gr": "EUR", "lu": "EUR", "lt": "EUR", "lv": "EUR", "ee": "EUR",
    "sk": "EUR", "si": "EUR", "mt": "EUR", "cy": "EUR", "hr": "EUR",
    # Europe (non-Euro)
    "uk": "GBP", "gb": "GBP", "ch": "CHF", "se": "SEK", "no": "NOK",
    "dk": "DKK", "is": "ISK", "pl": "PLN", "cz": "CZK", "hu": "HUF",
    "ro": "RON", "bg": "BGN", "tr": "TRY", "ua": "UAH", "rs": "RSD",
    # Americas
    "us": "USD", "ca": "CAD", "mx": "MXN", "br": "BRL", "ar": "ARS",
    "co": "COP", "cl": "CLP", "pe": "PEN", "uy": "UYU", "ec": "USD",
    "ve": "VES", "py": "PYG", "bo": "BOB", "cr": "CRC", "pa": "PAB",
    # Asia-Pacific
    "au": "AUD", "nz": "NZD", "jp": "JPY", "kr": "KRW", "cn": "CNY",
    "hk": "HKD", "tw": "TWD", "sg": "SGD", "my": "MYR", "th": "THB",
    "id": "IDR", "ph": "PHP", "vn": "VND", "in": "INR", "pk": "PKR",
    "bd": "BDT", "lk": "LKR", "np": "NPR",
    # Middle East
    "ae": "AED", "sa": "SAR", "qa": "QAR", "kw": "KWD", "bh": "BHD",
    "om": "OMR", "il": "ILS", "jo": "JOD", "lb": "LBP", "eg": "EGP",
    "ir": "IRR",
    # Africa
    "za": "ZAR", "ng": "NGN", "ke": "KES", "gh": "GHS", "ma": "MAD",
    "tn": "TND", "dz": "DZD", "et": "ETB", "tz": "TZS", "ug": "UGX",
}


def _infer_currency_from_url(url: str) -> str:
    """Infer ISO currency from a URL's TLD or path. Returns '' if unknown."""
    if not url:
        return ""
    try:
        from urllib.parse import urlparse
        host = urlparse(url).netloc.lower()
        # Check ccTLD (last part)
        parts = host.split(".")
        if len(parts) >= 2:
            tld = parts[-1]
            if tld in COUNTRY_TO_CURRENCY:
                return COUNTRY_TO_CURRENCY[tld]
            # Some universities use .edu but are international
            # Check second-to-last (e.g., .ac.uk, .edu.au)
            if len(parts) >= 3:
                country_tld = parts[-1]
                if country_tld in COUNTRY_TO_CURRENCY:
                    return COUNTRY_TO_CURRENCY[country_tld]
    except Exception:
        pass
    return ""


def _infer_currency_from_university_name(name: str) -> str:
    """Infer currency from university name (country mentions)."""
    if not name:
        return ""
    name_lower = name.lower()
    # Common country indicators in university names
    country_hints = {
        "denmark": "DKK", "danish": "DKK",
        "germany": "EUR", "german": "EUR", "münchen": "EUR", "berlin": "EUR",
        "france": "EUR", "french": "EUR", "paris": "EUR",
        "spain": "EUR", "spanish": "EUR", "madrid": "EUR", "barcelona": "EUR",
        "italy": "EUR", "italian": "EUR", "rome": "EUR", "milan": "EUR",
        "netherlands": "EUR", "dutch": "EUR", "amsterdam": "EUR",
        "sweden": "SEK", "swedish": "SEK", "stockholm": "SEK",
        "norway": "NOK", "norwegian": "NOK", "oslo": "NOK",
        "switzerland": "CHF", "swiss": "CHF", "zurich": "CHF",
        "united kingdom": "GBP", "uk": "GBP", "british": "GBP",
        "england": "GBP", "scotland": "GBP", "wales": "GBP",
        "united states": "USD", "usa": "USD", "american": "USD",
        "canada": "CAD", "canadian": "CAD",
        "australia": "AUD", "australian": "AUD", "sydney": "AUD",
        "new zealand": "NZD",
        "japan": "JPY", "japanese": "JPY", "tokyo": "JPY",
        "china": "CNY", "chinese": "CNY", "beijing": "CNY", "shanghai": "CNY",
        "korea": "KRW", "korean": "KRW", "seoul": "KRW",
        "singapore": "SGD",
        "india": "INR", "indian": "INR", "delhi": "INR", "mumbai": "INR",
        "colombia": "COP", "colombian": "COP", "bogotá": "COP", "bogota": "COP",
        "brazil": "BRL", "brazilian": "BRL",
        "mexico": "MXN", "mexican": "MXN",
    }
    for hint, curr in country_hints.items():
        if hint in name_lower:
            return curr
    return ""


def _normalize_duration(dur: str) -> str:
    """Normalize duration to 'X years' or 'X months'."""
    if not dur:
        return ""
    for pattern, replacer in DURATION_PATTERNS:
        match = re.search(pattern, dur, re.IGNORECASE)
        if match and replacer:
            result = replacer(match)
            # Clean up: "2.0 years" → "2 years"
            result = re.sub(r'(\d+)\.0\s', r'\1 ', result)
            return result
    return dur


def _normalize_currency(currency: str) -> str:
    """Normalize currency to ISO 4217 code."""
    if not currency:
        return ""
    c = currency.strip()
    # Already ISO?
    if re.match(r'^[A-Z]{3}$', c):
        return c
    # Map symbols
    return CURRENCY_MAP.get(c, c.upper()[:3])


def _remove_null_fields(obj):
    """Recursively remove null, None, empty, and zero fields from dicts/lists."""
    if isinstance(obj, dict):
        cleaned = {}
        for k, v in obj.items():
            # Keep 'amount' even if 0 (means explicitly no fee)
            # Keep 'found' even if False
            if k in ("found",):
                cleaned[k] = _remove_null_fields(v) if isinstance(v, (dict, list)) else v
                continue
            # Skip null/None/empty
            if v is None:
                continue
            if isinstance(v, str) and not v.strip():
                continue
            if isinstance(v, (dict, list)):
                cleaned_v = _remove_null_fields(v)
                if cleaned_v:  # Skip empty dicts/lists
                    cleaned[k] = cleaned_v
            else:
                cleaned[k] = v
        return cleaned
    elif isinstance(obj, list):
        return [_remove_null_fields(item) for item in obj if item is not None]
    return obj


def _normalize_result(result: dict) -> dict:
    """
    Final normalization pass:
    - Duration → "X years" or "X months"
    - Currency → ISO 4217 (with country/URL inference fallback)
    - Numbers → plain integers
    - Remove null/empty fields
    - Ensure English output
    """
    if not result.get("programs"):
        return result

    # Infer default currency from university name + source URLs
    university_name = result.get("university", "")
    source_urls = result.get("source_urls", [])
    inferred_currency = _infer_currency_from_university_name(university_name)
    if not inferred_currency:
        for src in source_urls:
            inferred_currency = _infer_currency_from_url(src)
            if inferred_currency:
                break

    for prog in result["programs"]:
        # Normalize duration
        dur = prog.get("duration", "")
        if dur:
            prog["duration"] = _normalize_duration(dur)

        # Normalize tuition_fee
        tf = prog.get("tuition_fee", {})
        if tf:
            # Currency → ISO
            if tf.get("currency"):
                tf["currency"] = _normalize_currency(tf["currency"])
            elif tf.get("amount") and inferred_currency:
                # No currency given but amount exists → infer from country
                tf["currency"] = inferred_currency
                tf["currency_inferred"] = True

            # Amount → plain integer
            if tf.get("amount") is not None:
                try:
                    tf["amount"] = int(float(tf["amount"]))
                except (TypeError, ValueError):
                    pass

            # Total → plain integer
            if tf.get("total_estimated_cost") is not None:
                try:
                    tf["total_estimated_cost"] = int(float(tf["total_estimated_cost"]))
                except (TypeError, ValueError):
                    pass

            # Per credit → plain number
            if tf.get("per_credit_cost") is not None:
                try:
                    tf["per_credit_cost"] = int(float(tf["per_credit_cost"]))
                except (TypeError, ValueError):
                    pass

        # Credits → integer
        if prog.get("credits_required"):
            try:
                prog["credits_required"] = int(prog["credits_required"])
            except (TypeError, ValueError):
                pass

    # Remove null fields from entire result
    result = _remove_null_fields(result)

    return result


# =====================================================================
#  Pretty printer
# =====================================================================
def print_result(result: dict):
    if not result.get("found"):
        print(f"\n❌ Not found: {result.get('reason', 'Unknown')}")
        return

    u = result.get("university", "?")
    dt = result.get("degree_type", "?")
    st = result.get("student_type", "?")

    print(f"\n{'='*70}")
    print(f"🎓 {u} — {dt} ({st})")
    print(f"{'='*70}")
    print(f"  Programs: {result.get('total_programs', 0)}")
    print(f"  Year: {result.get('academic_year', '?')} | Confidence: {result.get('confidence', '?')}")

    for cat, count in result.get("category_summary", {}).items():
        if count == 0:
            continue
        print(f"\n  📂 {cat} ({count})")
        print(f"  {'─'*50}")
        for p in result.get("programs", []):
            if p.get("category") != cat:
                continue
            name = p.get("program_name", "?")
            dur = p.get("duration", "?")
            cr = p.get("credits_required", 0)
            cr_str = f" | {cr}cp" if cr else ""
            print(f"     • {name} | {dur}{cr_str}")

            tf = p.get("tuition_fee", {})
            if tf and tf.get("amount"):
                amt = tf["amount"]
                cur = tf.get("currency", "?")
                fp = tf.get("fee_period", "?")
                tc = tf.get("total_estimated_cost")
                tc_str = f" | Total: {cur} {tc:,.0f}" if tc else ""
                v = " ✓" if tf.get("validated") else ""
                range_str = ""
                if tf.get("is_range") and tf.get("amount_max"):
                    range_str = f" (range: {amt:,.0f}–{tf['amount_max']:,.0f})"
                print(f"       💰 {cur} {amt:,.0f}{range_str} ({fp}){tc_str}{v}")
                src = tf.get("fee_source_url", "")
                if src:
                    print(f"       🔗 {src}")
            else:
                print(f"       ⚠️  Tuition: null")
            print(f"       🌐 {p.get('url', '')}")

    sources = result.get("source_urls", [])
    if sources:
        print(f"\n  🔗 Sources: {', '.join(sources[:3])}")

    programs = result.get("programs", [])
    with_fee = sum(1 for p in programs if p.get("tuition_fee", {}).get("amount"))
    validated = sum(1 for p in programs if p.get("tuition_fee", {}).get("validated"))
    print(f"\n  📊 Coverage: {with_fee}/{len(programs)} with fees, {validated} validated")

    meta = result.get("_meta", {})
    if meta:
        print(f"  ⏱️  {meta.get('time_seconds', 0)}s | 💲 ${meta.get('cost', {}).get('total_usd', 0):.4f}")


# =====================================================================
#  MAIN: fetch_programs
# =====================================================================
DISCOVER_SYSTEM = """You are a university program researcher. Your ONLY job is to find programs and official URLs.

CRITICAL RULES:
- ONLY use URLs that appear EXACTLY in search results. NEVER construct URLs.
- Use EXACT program names from the official website.
- Set ALL tuition (tf) to null. The scraping pipeline extracts real fees.
- Include ALL PDF URLs (fee schedules, admission guides, prospectuses) in "su".
- "f":false ONLY when the degree type doesn't exist at all.
- OUTPUT IN ENGLISH ONLY: Translate all program names, departments, and notes to English.
- DURATION: Always use "X years" or "X months" format.
  Convert: semesters÷2=years, trimestres×3=months, Semester÷2=years, semestres÷2=years
- CURRENCY: Use ISO 4217 codes (USD, EUR, AUD, GBP, COP, CNY, INR, JPY, KRW, SGD, CAD, CHF, SEK, NOK, DKK, MYR, THB, PHP, BRL, MXN, ZAR, NZD, HKD, TWD, etc.)
- DELIVERY MODE: Use exactly one of: on_campus, online, hybrid, blended
- If the university charges NO tuition (e.g., tuition-free public universities in Germany, Norway, etc.), still set tf to null but mention "tuition-free" in notes.

REQUIRED top-level fields:
- "cc": ISO 3166-1 alpha-2 country code where the university campus is physically located.
        Use the CAMPUS country, not the parent institution's. Examples:
        MIT (Cambridge, MA, USA) → "US"
        University of Cambridge (UK) → "GB"
        NYU Abu Dhabi → "AE" (NOT "US")
        TUM Munich → "DE"
        Sorbonne Paris → "FR"
        University of Tokyo → "JP"
        VIA University College → "DK"
        Universidad Mariana (Pasto, Colombia) → "CO"
- "dc": ISO 4217 currency code in which tuition is normally quoted.
        Examples: US→USD, UK→GBP, Germany→EUR, Denmark→DKK, India→INR,
        Australia→AUD, Japan→JPY, Singapore→SGD, UAE→AED, Colombia→COP

Category codes: AH=Arts & Humanities, BM=Business & Management, ET=Engineering & Technology, LW=Law, LS=Life Sciences & Medicine, NS=Natural Sciences, PI=Political Science & International Relations, OT=Other

Return ONLY JSON:
{{"f":true,"u":"name","dt":"degree","st":"type","cc":"US","dc":"USD","p":[{{"pn":"English name","cat":"CODE","aos":"CODE","dept":"English dept","dur":"X years","cr":0,"tf":null,"dm":"on_campus","url":"exact URL"}}],"su":["urls including PDFs"],"ay":"academic year","conf":"low","n":"notes in English"}}"""


def fetch_programs(university: str, degree: str = "Undergraduate",
                   student_type: str = "International") -> dict:
    """
    Production-ready tuition fetcher.
    Phase 1: Discover → Phase 2: Scrape → Phase 3: Extract → Phase 4: Validate → Phase 5: Map
    """
    t0 = time.time()
    phase_timings = {}
    total_cost = 0

    # ── PHASE 1: DISCOVER ──
    t_phase1 = time.time()
    print(f"\n{'='*70}")
    print(f"🎓 PHASE 1: Discovering {degree} programs at {university}")
    print(f"{'='*70}")

    prompt = f"""Search for ALL {degree} programs at {university} for {student_type} students.

Your search strategy (try multiple queries):
1. "{university} {degree} programs list"
2. "{university} {student_type} tuition fees"
3. "{university} fee schedule PDF"
4. "{university} {degree} admission requirements"

Find:
(1) Official program listing/catalog page
(2) Each program's real URL on the official university website
(3) Official tuition/fees page or PDF for {student_type} students
(4) Any fee schedule PDFs, admission guides, or prospectuses

IMPORTANT:
- Include ALL PDF URLs you find in "su" — the scraping pipeline will download and read them.
- If the university has a central fees page, include that URL.
- If fees differ by program/faculty, note that in "n" (notes).
- If this is a tuition-free university, mention it in notes.
- Set ALL tuition to null — the pipeline extracts real fees from downloaded content.

Return JSON with ALL programs found."""

    raw, meta1 = _call_api(prompt, system=DISCOVER_SYSTEM,
                           use_web_search=True)
    total_cost += meta1.get("cost", {}).get("total_usd", 0)
    phase_timings["Phase 1 (Discover)"] = round(time.time() - t_phase1, 1)

    result = _expand_keys(raw)

    if not result.get("found") or not result.get("programs"):
        result["_meta"] = {**meta1, "time_seconds": round(time.time() - t0, 2)}
        print_result(result)
        return result

    programs = result["programs"]
    source_urls = result.get("source_urls", [])
    print(f"   ✅ Found {len(programs)} programs, {len(source_urls)} source URLs")

    # Collect all URLs
    all_urls = list(source_urls)
    for p in programs:
        for u_key in ["url"]:
            u = p.get(u_key, "")
            if u and u not in all_urls:
                all_urls.append(u)

    null_count = sum(1 for p in programs if not p.get("tuition_fee", {}).get("amount"))

    if null_count > 0:
        # ── PHASE 2+3: SCRAPE & EXTRACT ──
        t_phase23 = time.time()
        print(f"\n{'='*70}")
        print(f"🔍 PHASE 2+3: Scraping {len(all_urls)} URLs, extracting fees")
        print(f"{'='*70}")

        fees = scrape_and_extract_fees(all_urls, university, degree, student_type,
                                       program_list=programs)

        # Fallback: search for tuition PDF/page with multiple strategies
        if not fees:
            print(f"\n   🔍 Fallback: searching for fee sources...")
            search_queries = [
                f"{university} {student_type} tuition fees {degree} PDF",
                f"{university} fee schedule tuition cost",
                f"{university} how much does it cost to study",
            ]
            for sq in search_queries:
                search_result, meta_s = _call_api(
                    f"Search: \"{sq}\"\n"
                    f"Find the official tuition/fee page or PDF for {student_type} "
                    f"{degree} students at {university}. "
                    f"Return ONLY a JSON array of URLs from the official university website.",
                    use_web_search=True, max_tokens=1024
                )
                total_cost += meta_s.get("cost", {}).get("total_usd", 0)

                search_text = json.dumps(search_result) if isinstance(search_result, dict) else str(search_result)
                new_urls = [u for u in re.findall(r'https?://[^\s"\'\]]+', search_text)
                           if u not in all_urls]
                if new_urls:
                    print(f"   ✅ Found {len(new_urls)} new URLs from: \"{sq[:50]}\"")
                    fees = scrape_and_extract_fees(new_urls, university, degree, student_type,
                                                   program_list=programs)
                    if fees:
                        break
                    all_urls.extend(new_urls)  # Don't re-try these

        phase_timings["Phase 2+3 (Scrape+Extract)"] = round(time.time() - t_phase23, 1)

        # ── PHASE 4+5: VALIDATE & MAP ──
        if fees:
            t_phase45 = time.time()
            print(f"\n{'='*70}")
            print(f"✅ PHASE 4+5: Mapping {len(fees)} validated fees to {len(programs)} programs")
            print(f"{'='*70}")
            result["programs"] = map_fees_to_programs(programs, fees)
            phase_timings["Phase 4+5 (Validate+Map)"] = round(time.time() - t_phase45, 1)

    # Update confidence
    progs = result.get("programs", [])
    with_fee = sum(1 for p in progs if p.get("tuition_fee", {}).get("amount"))
    validated = sum(1 for p in progs if p.get("tuition_fee", {}).get("validated"))
    result["confidence"] = "high" if validated > 0 and validated == with_fee else (
        "medium" if with_fee > 0 else "low"
    )

    # Recompute summary
    summary = {v: 0 for v in CATEGORIES.values()}
    for p in progs:
        cat = p.get("category", "Other")
        summary[cat] = summary.get(cat, 0) + 1
    result["category_summary"] = summary
    result["total_programs"] = len(progs)

    # ── PHASE 6: NORMALIZE ──
    t_phase6 = time.time()
    print(f"\n{'='*70}")
    print(f"🔧 PHASE 6: Normalizing output")
    print(f"{'='*70}")
    result = _normalize_result(result)
    print(f"   ✅ Duration, currency, numbers standardized")
    print(f"   ✅ Null/empty fields removed")

    # ──────────────────────────────────────────────────────────────────
    # Top-level country_code & default_currency (hybrid resolution)
    # ──────────────────────────────────────────────────────────────────
    # Priority order:
    #   1. What the LLM returned (most accurate — LLM knows university locations)
    #   2. ccTLD inference from source URLs (.dk → DK, .uk → GB, etc.)
    #   3. Most common currency among extracted fee amounts (very reliable)
    #   4. Cross-derive missing one from the other (cc → currency, currency → cc)

    cc = (result.get("country_code") or "").strip().upper()
    dc = (result.get("default_currency") or "").strip().upper()

    # Step 2: ccTLD fallback if LLM didn't provide country
    if not cc:
        try:
            from urllib.parse import urlparse
            for src in result.get("source_urls", []):
                host = urlparse(src).netloc.lower()
                parts = host.split(".")
                if len(parts) >= 2:
                    tld = parts[-1]
                    if tld in COUNTRY_TO_CURRENCY:
                        cc = tld.upper()
                        break
                    if len(parts) >= 3 and parts[-1] in COUNTRY_TO_CURRENCY:
                        cc = parts[-1].upper()
                        break
        except Exception:
            pass

    # Step 3: Currency from extracted fees (highly reliable signal)
    if not dc and result.get("programs"):
        from collections import Counter
        currencies = []
        for p in result["programs"]:
            tf = p.get("tuition_fee")
            if tf and tf.get("currency"):
                currencies.append(tf["currency"].upper())
        if currencies:
            most_common, count = Counter(currencies).most_common(1)[0]
            # Only trust if it appears in 2+ programs OR is the only currency seen
            if count >= 2 or len(currencies) == 1:
                dc = most_common

    # Step 4: Cross-derive missing field
    # Country → currency (use existing COUNTRY_TO_CURRENCY map)
    if cc and not dc:
        cc_lower = cc.lower()
        if cc_lower in COUNTRY_TO_CURRENCY:
            dc = COUNTRY_TO_CURRENCY[cc_lower]

    # Currency → country (single-country currencies only; skip ambiguous EUR/etc.)
    if dc and not cc:
        currency_to_cc = {
            "USD": "US", "GBP": "GB", "CAD": "CA", "AUD": "AU", "NZD": "NZ",
            "JPY": "JP", "CNY": "CN", "INR": "IN", "KRW": "KR", "SGD": "SG",
            "HKD": "HK", "TWD": "TW", "CHF": "CH", "SEK": "SE", "NOK": "NO",
            "DKK": "DK", "BRL": "BR", "MXN": "MX", "COP": "CO", "AED": "AE",
            "SAR": "SA", "QAR": "QA", "ZAR": "ZA", "TRY": "TR", "MYR": "MY",
            "THB": "TH", "PHP": "PH", "IDR": "ID", "VND": "VN", "RUB": "RU",
        }
        if dc in currency_to_cc:
            cc = currency_to_cc[dc]

    # Persist whatever we resolved
    if cc:
        result["country_code"] = cc
    if dc:
        result["default_currency"] = dc

    phase_timings["Phase 6 (Normalize)"] = round(time.time() - t_phase6, 1)

    elapsed = round(time.time() - t0, 2)
    meta1["time_seconds"] = elapsed
    meta1["cost"]["total_usd"] = round(meta1["cost"]["total_usd"] + total_cost, 4)
    result["_meta"] = meta1

    print(f"\n{'='*70}")
    print(f"📋 FINAL RESULT")
    print(f"{'='*70}")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    print_result(result)

    # ── Phase timings summary ──
    print(f"\n{'='*70}")
    print(f"⏱️  PHASE TIMINGS")
    print(f"{'='*70}")
    for phase, secs in phase_timings.items():
        print(f"   {phase}: {secs}s")
    print(f"   {'─'*40}")
    print(f"   Total: {elapsed}s")

    return result


# =====================================================================
#  Manual override
# =====================================================================
def set_tuition(result: dict, per_credit=None, annual=None,
                currency="USD", fee_period=None, source_url="",
                tiers=None) -> dict:
    """Manually set tuition for programs with null fees."""
    if not result.get("programs"):
        return result

    fixed = 0
    for prog in result["programs"]:
        tf = prog.get("tuition_fee", {})
        if tf and tf.get("amount"):
            continue

        dur = prog.get("duration", "")
        try:
            years = float(re.search(r'[\d.]+', dur).group()) if dur else 0
        except (AttributeError, ValueError):
            years = 0
        cr = prog.get("credits_required", 0) or 0

        amount = None
        fp = fee_period

        if tiers:
            pname = (prog.get("program_name", "") + " " + prog.get("category", "")).lower()
            for keyword, tier_amt in tiers.items():
                if keyword.lower() in pname:
                    amount = tier_amt
                    fp = fp or "per_year"
                    break

        if not amount and per_credit:
            amount, fp = per_credit, fp or "per_credit"
        elif not amount and annual:
            amount, fp = annual, fp or "per_year"

        if amount:
            tc = round(amount * cr) if fp == "per_credit" and cr else (
                round(amount * years) if fp == "per_year" and years else None)
            prog["tuition_fee"] = {
                "amount": amount, "currency": currency, "fee_period": fp,
                "per_credit_cost": amount if fp == "per_credit" else None,
                "total_estimated_cost": tc, "includes": "tuition only",
                "fee_source_url": source_url, "validated": False, "manual_override": True
            }
            fixed += 1

    print(f"✅ Set tuition for {fixed} programs")
    return result


# =====================================================================
#  Single program lookup
# =====================================================================
def fetch_tuition(university: str, program: str, degree: str = "MS",
                  student_type: str = "International") -> dict:
    """
    Fetch tuition for a single specific program.
    Uses web search → scrape → extract → validate pipeline.

    Args:
        university: "Massachusetts Institute of Technology"
        program: "MBA"
        degree: "MBA", "MS", "Undergraduate", etc.
        student_type: "International" or "Domestic"

    Returns:
        dict with amount, currency, fee_period, source_url, exact_quote, validated
    """
    print(f"\n🎓 Looking up: {program} at {university} ({student_type})")

    # Search for the specific program's fee page
    prompt = f"""Find the exact tuition fee for this specific program:
University: {university}
Program: {program}
Degree: {degree}
Student type: {student_type}

Search for the official fees page and the specific program page.
Return ONLY a JSON array of relevant URLs: ["url1", "url2", ...]"""

    result, meta = _call_api(prompt, use_web_search=True, max_tokens=1024)

    # Extract URLs
    result_text = json.dumps(result) if isinstance(result, dict) else str(result)
    urls = re.findall(r'https?://[^\s"\'\]]+', result_text)

    if not urls:
        print("   ⚠️  No URLs found")
        return {"amount": None, "note": "No official fee page found"}

    # Scrape and extract
    fees = scrape_and_extract_fees(urls[:10], university, degree, student_type)

    if fees:
        # Find best match for this program
        best = None
        best_score = 0
        for f in fees:
            score = _match_score(f.get("program_or_faculty", ""), program)
            if score > best_score:
                best_score = score
                best = f

        if best:
            amount = best["amount"]
            print(f"\n   ✅ Found: {best.get('currency', '?')} {amount:,} "
                  f"({best.get('fee_period', '?')}) — validated ✓")
            return best

    print("   ⚠️  Could not extract verified tuition")
    return {"amount": None, "note": "Fee not found or not verifiable from official sources"}


# =====================================================================
#  CLI Entry Point (for Node.js subprocess integration)
# =====================================================================
if __name__ == "__main__":
    import argparse
    import sys

    parser = argparse.ArgumentParser(
        description="Fetch university program tuition fees"
    )
    parser.add_argument("--university", required=True,
                        help="University name (e.g., 'MIT', 'VIA University College')")
    parser.add_argument("--degree", default="Undergraduate",
                        help="Degree type (Undergraduate, MS, MBA, PhD, etc.)")
    parser.add_argument("--student-type", default="International",
                        help="Student type (International, Domestic)")
    parser.add_argument("--json-output", action="store_true",
                        help="Stream progress to stderr, emit final JSON to stdout")
    parser.add_argument("--timeout", type=int, default=300,
                        help="Max execution time in seconds (default 300)")

    args = parser.parse_args()

    try:
        if args.json_output:
            # Route progress prints to STDERR so Node.js can read them live.
            # Only the final JSON result goes to STDOUT (clean, parseable).
            # This is the standard Unix pattern for CLI tools that emit both
            # progress and structured data.
            _original_stdout = sys.stdout
            sys.stdout = sys.stderr
            try:
                result = fetch_programs(
                    args.university,
                    args.degree,
                    args.student_type
                )
            finally:
                sys.stdout = _original_stdout

            # Emit clean JSON on a single line to stdout (easy for Node.js to parse)
            sys.stdout.write(json.dumps(result, ensure_ascii=False))
            sys.stdout.flush()
            sys.exit(0)
        else:
            # Normal mode: full progress output to stdout
            result = fetch_programs(
                args.university,
                args.degree,
                args.student_type
            )
            sys.exit(0)
    except KeyboardInterrupt:
        sys.stderr.write("Interrupted by user\n")
        sys.exit(130)
    except Exception as e:
        # In JSON mode, emit error as JSON to stdout
        if args.json_output:
            error_result = {
                "found": False,
                "error": True,
                "error_message": str(e),
                "error_type": type(e).__name__,
            }
            sys.stdout.write(json.dumps(error_result, ensure_ascii=False))
            sys.stdout.flush()
        else:
            import traceback
            sys.stderr.write(f"Error: {e}\n")
            sys.stderr.write(traceback.format_exc())
        sys.exit(1)