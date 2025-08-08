import requests
import xml.etree.ElementTree as ET
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import ExchangeRate
from datetime import date

router = APIRouter()

@router.get("/exchange-rates")
def get_and_save_exchange_rates(db: Session = Depends(get_db)):
    url = "https://www.tcmb.gov.tr/kurlar/today.xml"
    response = requests.get(url)
    response.encoding = "utf-8"

    if response.status_code != 200:
        return {"error": "Kur verisi alınamadı"}

    root = ET.fromstring(response.text)
    tarih = root.attrib.get("Tarih", "")
    today = date.today()

    allowed_codes = ["USD", "EUR", "CHF", "GBP", "CAD"]
    data = []

    for currency in root.findall("Currency"):
        code = currency.get("CurrencyCode")
        if code not in allowed_codes:
            continue

        forex_buying = currency.find("ForexBuying").text

        if forex_buying is None or forex_buying == "":
            continue

        rate = float(forex_buying.replace(",", "."))

        # ✅ Eğer aynı gün ve para birimi varsa, güncelle
        existing = db.query(ExchangeRate).filter_by(currency=code, date=today).first()
        if existing:
            existing.rate_to_try = rate
        else:
            db.add(ExchangeRate(currency=code, rate_to_try=rate, date=today))

        data.append({
            "code": code,
            "rate": rate
        })

    db.commit()

    return {
        "date": tarih,
        "message": "Veriler kaydedildi.",
        "saved_rates": data
    }
