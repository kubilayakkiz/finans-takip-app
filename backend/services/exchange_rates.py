import requests
import xml.etree.ElementTree as ET
from datetime import datetime
from sqlalchemy.orm import Session
from models.exchange_rate import ExchangeRate

TCMB_URL = "https://www.tcmb.gov.tr/kurlar/today.xml"

def fetch_and_store_exchange_rates(db: Session):
    try:
        response = requests.get(TCMB_URL)
        response.raise_for_status()

        tree = ET.fromstring(response.content)
        today = datetime.today().date()

        for currency in tree.findall("Currency"):
            code = currency.get("CurrencyCode")
            forex_selling = currency.find("ForexSelling").text

            if not forex_selling:
                continue

            rate = float(forex_selling.replace(",", "."))

            # TL zaten 1 olduğu için eklemeye gerek yok
            if code == "TRY":
                continue

            # Daha önce aynı gün için kayıt varsa güncelle
            existing_rate = (
                db.query(ExchangeRate)
                .filter(ExchangeRate.currency == code, ExchangeRate.date == today)
                .first()
            )

            if existing_rate:
                existing_rate.rate_to_try = rate
            else:
                new_rate = ExchangeRate(
                    currency=code,
                    rate_to_try=rate,
                    date=today
                )
                db.add(new_rate)

        db.commit()
        return {"message": "Kurlar başarıyla güncellendi."}

    except Exception as e:
        return {"error": str(e)}
