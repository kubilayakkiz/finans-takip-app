import requests
import xml.etree.ElementTree as ET
from datetime import date, timedelta
from database import SessionLocal
from models import ExchangeRate

def fetch_and_save_rates(start_date, end_date):
    session = SessionLocal()
    current = start_date

    while current <= end_date:
        year_month = current.strftime("%Y%m")
        day = current.strftime("%d%m%Y")
        url = f"https://www.tcmb.gov.tr/kurlar/{year_month}/{day}.xml"

        try:
            resp = requests.get(url)
            if resp.status_code != 200:
                print(f"Kayıt yok: {current}")
                current += timedelta(days=1)
                continue

            root = ET.fromstring(resp.content)
            for currency in root.findall("Currency"):
                code = currency.get("CurrencyCode")
                forex_buying = currency.find("ForexBuying").text

                # BAZI KURLAR BOŞ OLABİLİR!
                def try_float(x): return float(x) if x else None

                if code in ["USD", "EUR", "GBP"]:   # Sadece ihtiyacın olanlar
                    rate = ExchangeRate(
                        date=current,
                        currency=code,
                        rate_to_try=try_float(forex_buying)
                    )
                    if not session.query(ExchangeRate).filter_by(date=current, currency=code).first():
                        session.add(rate)
            session.commit()
            print(f"{current} eklendi")
        except Exception as e:
            print(f"{current} hata: {e}")
        current += timedelta(days=1)

if __name__ == "__main__":
    start = date(2023, 1, 1)
    end = date.today()
    fetch_and_save_rates(start, end)
