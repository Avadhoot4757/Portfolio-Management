import os
import sys
import json
from datetime import datetime, timedelta

import requests


RAPIDAPI_HOST_DEFAULT = "apidojo-yahoo-finance-v1.p.rapidapi.com"
CHART_URL = "https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v3/get-chart"


def _get_headers():
    api_key = (os.getenv("RAPIDAPI_KEY") or os.getenv("YAHOO_API_KEY") or "").strip()
    api_host = (os.getenv("RAPIDAPI_HOST") or RAPIDAPI_HOST_DEFAULT).strip()
    if not api_key:
        raise RuntimeError("Missing RAPIDAPI_KEY environment variable.")
    return {
        "X-RapidAPI-Key": api_key,
        "X-RapidAPI-Host": api_host,
    }


def _fetch_chart(symbol, range_value="1mo", interval="1d"):
    params = {
        "symbol": symbol,
        "region": "US",
        "range": range_value,
        "interval": interval,
    }
    response = requests.get(CHART_URL, headers=_get_headers(), params=params, timeout=15)
    if response.status_code == 204:
        return []
    response.raise_for_status()
    data = response.json()
    result = (data.get("chart") or {}).get("result") or []
    if not result:
        return []
    result0 = result[0]
    timestamps = result0.get("timestamp") or []
    indicators = result0.get("indicators") or {}
    quote = (indicators.get("quote") or [{}])[0]
    closes = quote.get("close") or []
    points = []
    for idx, ts in enumerate(timestamps):
        close_val = closes[idx] if idx < len(closes) else None
        if ts is None or close_val is None:
            continue
        points.append({"date": datetime.fromtimestamp(ts).strftime("%Y-%m-%d"), "value": close_val})
    return points


def get_last_30_days(symbol):
    series = _fetch_chart(symbol, range_value="1mo", interval="1d")
    recent = series[-30:]
    print(json.dumps(recent))


def get_price_for_date(symbol, date_str):
    target_date = datetime.fromisoformat(date_str).date()
    end_date = target_date + timedelta(days=3)

    series = _fetch_chart(symbol, range_value="3mo", interval="1d")
    for item in series:
        item_date = datetime.fromisoformat(item["date"]).date()
        if target_date <= item_date <= end_date:
            print(item["value"])
            return
    print("0")


if __name__ == "__main__":
    if len(sys.argv) >= 2:
        symbol_arg = sys.argv[1]
        if len(sys.argv) >= 3:
            get_price_for_date(symbol_arg, sys.argv[2])
        else:
            get_last_30_days(symbol_arg)
