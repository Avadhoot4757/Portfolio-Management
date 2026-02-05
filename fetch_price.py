import yfinance as yf
import sys
from datetime import datetime, timedelta

def get_price(symbol, date_str):
    try:
        # Convert your ISO string to a datetime object
        target_date = datetime.fromisoformat(date_str)
        # yfinance needs a start and end to find a specific day
        end_date = target_date + timedelta(days=1)

        ticker = yf.Ticker(symbol)
        # Fetch the history for that 1-day window
        df = ticker.history(start=target_date.strftime('%Y-%m-%d'),
                            end=end_date.strftime('%Y-%m-%d'))

        if not df.empty:
            print(df['Close'].iloc[0])
        else:
            print("0")
    except Exception as e:
        print("0")

if __name__ == "__main__":
    # Get arguments from Java: python fetch_price.py AAPL 2024-05-15
    get_price(sys.argv[1], sys.argv[2])