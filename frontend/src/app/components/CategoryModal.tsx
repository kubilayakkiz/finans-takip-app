"use client";

import { useState, useEffect } from "react";

interface Category {
  id: number;
  type: string;
  name: string;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category?: Category | null;
}

export default function CategoryModal({
  isOpen,
  onClose,
  onSuccess,
  category,
}: CategoryModalProps) {
  const [type, setType] = useState("gelir");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (category) {
      setType(category.type);
      setName(category.name);
    } else {
      setType("gelir");
      setName("");
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Kategori adı boş olamaz");
      return;
    }

    setLoading(true);
    try {
      const method = category ? "PUT" : "POST";
      const url = category
        ? `http://127.0.0.1:8000/categories/${category.id}`
        : "http://127.0.0.1:8000/categories";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, name }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.detail || "Bir hata oluştu");
        setLoading(false);
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Sunucu hatası");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">
          {category ? "Kategori Düzenle" : "Yeni Kategori Ekle"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tip seçimi */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="gelir">Gelir</option>
            <option value="gider">Gider</option>
          </select>

          {/* İsim */}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Kategori adı"
            className="w-full border p-2 rounded"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
