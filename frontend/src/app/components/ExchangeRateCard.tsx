"use client";

import { useEffect, useState } from "react";

interface ExchangeRate {
  code: string;
  name: string;
  forex_buying: string;
  forex_selling: string | null;
}

export default function ExchangeRateCard() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [date, setDate] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/exchange-rates")
      .then((res) => res.json())
      .then((data) => {
        setRates(data.rates || []);
        setDate(data.date || "");
        setLoading(false);
      })
      .catch((err) => {
        console.error("Kur verisi alınamadı:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md text-sm">
        <p>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
      {/* Başlık ve Tarih */}
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">
          Döviz Kurları
        </h2>
        <span className="text-xs sm:text-sm text-gray-500">{date}</span>
      </div>

      {/* Liste */}
      <ul className="divide-y divide-gray-100">
        {rates.map((rate) => (
          <li
            key={rate.code}
            className="flex items-center justify-between py-2 sm:py-3 hover:bg-gray-50 rounded-lg px-1 sm:px-2 transition-all"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-lg sm:text-2xl">
                {getCurrencyIcon(rate.code)}
              </span>
              <div>
                <p className="font-medium text-gray-700 text-sm sm:text-base">
                  {rate.name}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-400">
                  {rate.code}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs sm:text-sm">
                <span className="font-semibold text-green-600">Alış:</span>{" "}
                {rate.forex_buying}
              </p>
              <p className="text-xs sm:text-sm">
                <span className="font-semibold text-red-500">Satış:</span>{" "}
                {rate.forex_selling}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Para birimi ikonları
function getCurrencyIcon(code: string) {
  const icons: Record<string, string> = {
    USD: "$", // ABD Doları
    EUR: "€", // Euro
    GBP: "£", // İngiliz Sterlini
    CHF: "₣", // İsviçre Frangı
    CAD: "$", // Kanada Doları
  };
  return icons[code] || "💰";
}
