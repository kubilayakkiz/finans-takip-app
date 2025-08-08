import React, { useState, useEffect } from "react";

interface Transaction {
  id: number;
  type: string;
  project_id: number;
  category_id: number;
  date: string;
  amount: number;
  currency: string;
  description: string;
}

interface Project { id: number; name: string; }
interface Category { id: number; type: string; name: string; }

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transaction: Transaction | null;
  projects: Project[];
  categories: Category[];
}

export default function TransactionModal({
  isOpen,
  onClose,
  onSuccess,
  transaction,
  projects,
  categories,
}: Props) {
  const [form, setForm] = useState<Transaction | null>(transaction);

  useEffect(() => {
    setForm(transaction);
  }, [transaction]);

  if (!isOpen || !form) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const res = await fetch(`http://127.0.0.1:8000/transactions/${form.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      onSuccess();
      onClose();
    } else {
      alert("Güncellenemedi");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[400px] shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-xl text-gray-600 hover:text-black"
        >✕</button>
        <h2 className="font-bold text-lg mb-4">Kayıt Düzenle</h2>
        <div className="flex flex-col gap-3">
          <select name="type" value={form.type} onChange={handleChange} className="border p-2 rounded">
            <option value="gelir">Gelir</option>
            <option value="gider">Gider</option>
          </select>
          <select name="project_id" value={form.project_id} onChange={handleChange} className="border p-2 rounded">
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select name="category_id" value={form.category_id} onChange={handleChange} className="border p-2 rounded">
            {categories.filter(c => c.type === form.type).map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input type="date" name="date" value={form.date} onChange={handleChange} className="border p-2 rounded" />
          <input type="number" name="amount" value={form.amount} onChange={handleChange} className="border p-2 rounded" />
          <select name="currency" value={form.currency} onChange={handleChange} className="border p-2 rounded">
            <option value="TRY">TL</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
          <input name="description" value={form.description} onChange={handleChange} className="border p-2 rounded" placeholder="Açıklama" />
          <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-3">
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
