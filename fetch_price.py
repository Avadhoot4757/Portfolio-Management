import yfinance as yf
import sys
from datetime import datetime, timedelta

def get_price(symbol, date_str):
    try:
        
        target_date = datetime.fromisoformat(date_str)
        # Create a 3-day window to account for weekends/holidays (especially for bonds)
        end_date = target_date + timedelta(days=3)

        # 2. Initialize the Ticker (Works for Stocks, Crypto, and many Bonds/ETFs)
        ticker = yf.Ticker(symbol)
        
        # 3. Fetch history
        df = ticker.history(start=target_date.strftime('%Y-%m-%d'),
                            end=end_date.strftime('%Y-%m-%d'))

        if not df.empty:
            
            print(df['Close'].iloc[0])
        else:
            print("0")
    except Exception:
       
        print("0")

if __name__ == "__main__":
    
    if len(sys.argv) > 2:
        get_price(sys.argv[1], sys.argv[2])