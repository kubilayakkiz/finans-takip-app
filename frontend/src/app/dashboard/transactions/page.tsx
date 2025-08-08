"use client";

import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import TransactionModal from "@/app/components/TransactionModal";

interface Transaction {
  id: number;
  type: string;
  project_id: number;
  category_id: number;
  project_name?: string;
  category_name?: string;
  date: string;
  amount: number;
  currency: string;
  description: string;
  tl_total: number;
}

interface Project {
  id: number;
  name: string;
}

interface Category {
  id: number;
  type: string;
  name: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortColumn, setSortColumn] = useState<keyof Transaction>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Form alanları
  const [formType, setFormType] = useState<"gelir" | "gider">("gelir");
  const [formProject, setFormProject] = useState<number | "">("");
  const [formCategory, setFormCategory] = useState<number | "">("");
  const [formDate, setFormDate] = useState("");
  const [formAmount, setFormAmount] = useState<number | "">("");
  const [formCurrency, setFormCurrency] = useState("TRY");
  const [formDescription, setFormDescription] = useState("");

  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchTransactions();
    fetchProjects();
    fetchCategories();
    // eslint-disable-next-line
  }, [page, limit, search, sortColumn, sortOrder]);

  const fetchTransactions = async () => {
    const res = await fetch(
      `http://127.0.0.1:8000/transactions?search=${search}&skip=${(page - 1) * limit}&limit=${limit}&sort_by=${sortColumn}&sort_order=${sortOrder}`
    );
    const data = await res.json();
    setTransactions(data.items);
    setTotal(data.total);
  };

  const fetchProjects = async () => {
    const res = await fetch("http://127.0.0.1:8000/projects?limit=1000");
    const data = await res.json();
    setProjects(data.items || data);
  };

  const fetchCategories = async () => {
    const res = await fetch("http://127.0.0.1:8000/categories?limit=1000");
    const data = await res.json();
    setCategories(data.items || data);
  };

  const handleSort = (column: keyof Transaction) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (column: keyof Transaction) => {
    if (sortColumn !== column) return <FaSort className="inline ml-1" />;
    return sortOrder === "asc" ? (
      <FaSortUp className="inline ml-1" />
    ) : (
      <FaSortDown className="inline ml-1" />
    );
  };

  const handleDelete = async (id: number) => {
    if (confirm("Bu kaydı silmek istediğinize emin misiniz?")) {
      const res = await fetch(`http://127.0.0.1:8000/transactions/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchTransactions();
      }
    }
  };

  const handleAddTransaction = async () => {
    if (!formProject || !formCategory || !formDate || !formAmount) {
      alert("Lütfen tüm alanları doldurun.");
      return;
    }

    const payload = {
      type: formType,
      project_id: formProject,
      category_id: formCategory,
      date: formDate,
      amount: formAmount,
      currency: formCurrency,
      description: formDescription,
    };

    const res = await fetch("http://127.0.0.1:8000/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      resetForm();
      fetchTransactions();
    } else {
      const err = await res.json();
      alert(err.detail || "Kayıt eklenemedi.");
    }
  };

  const resetForm = () => {
    setFormType("gelir");
    setFormProject("");
    setFormCategory("");
    setFormDate("");
    setFormAmount("");
    setFormCurrency("TRY");
    setFormDescription("");
  };

  const startEntry = (page - 1) * limit + 1;
  const endEntry = Math.min(page * limit, total);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Gelir / Gider Kayıtları</h1>

      {/* Form */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 flex flex-wrap gap-4">
        <select value={formType} onChange={(e) => setFormType(e.target.value as "gelir" | "gider")} className="border p-2 rounded">
          <option value="gelir">Gelir</option>
          <option value="gider">Gider</option>
        </select>
        <select value={formProject} onChange={(e) => setFormProject(Number(e.target.value))} className="border p-2 rounded">
          <option value="">Proje Seç</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          value={formCategory}
          onChange={(e) => setFormCategory(Number(e.target.value))}
          className="border p-2 rounded"
        >
          <option value="">Kategori Seç</option>
          {categories
            .filter((c) => c.type === formType)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </select>
        <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="border p-2 rounded" />
        <input type="number" placeholder="Tutar" value={formAmount} onChange={(e) => setFormAmount(Number(e.target.value))} className="border p-2 rounded" />
        <select value={formCurrency} onChange={(e) => setFormCurrency(e.target.value)} className="border p-2 rounded">
          <option value="TRY">TL</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
        </select>
        <input type="text" placeholder="Açıklama" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="border p-2 rounded" />
        <button onClick={handleAddTransaction} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Ekle
        </button>
      </div>


{/* Üst Kontroller */}
      <div className="flex justify-between items-center mb-4">
        {/* Sayfa başına kayıt */}
        <div className="flex items-center space-x-2">
          <span>Göster:</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="border p-1 rounded"
          >
            {[5, 10, 15, 20, 25].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>

        {/* Arama Kutusu */}
        <div>
          <input
            type="text"
            placeholder="Tip,Proje,Kategori,PB,Açıklama ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full table-auto text-sm text-gray-700">
          <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
            <tr>
              <th onClick={() => handleSort("id")} className="px-4 py-3 text-left cursor-pointer">ID {getSortIcon("id")}</th>
              <th onClick={() => handleSort("type")} className="px-4 py-3 text-left cursor-pointer">Tip {getSortIcon("type")}</th>
              <th onClick={() => handleSort("project_name")} className="px-4 py-3 text-left cursor-pointer">Proje {getSortIcon("project_name")}</th>
              <th onClick={() => handleSort("category_name")} className="px-4 py-3 text-left cursor-pointer">Kategori {getSortIcon("category_name")}</th>
              <th onClick={() => handleSort("date")} className="px-4 py-3 text-left cursor-pointer">Tarih {getSortIcon("date")}</th>
              <th onClick={() => handleSort("amount")} className="px-4 py-3 text-left cursor-pointer">Tutar {getSortIcon("amount")}</th>
              <th onClick={() => handleSort("currency")} className="px-4 py-3 text-left cursor-pointer">Para Birimi {getSortIcon("currency")}</th>
              <th className="px-4 py-3 text-left">Açıklama</th>
              <th onClick={() => handleSort("tl_total")} className="px-4 py-3 text-left cursor-pointer">TL Toplam {getSortIcon("tl_total")}</th>
              <th className="px-4 py-3 text-center">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                <td className="px-4 py-2">{t.id}</td>
                <td className="px-4 py-2">{t.type}</td>
                <td className="px-4 py-2">{t.project_name || "-"}</td>
                <td className="px-4 py-2">{t.category_name || "-"}</td>
                <td className="px-4 py-2">{new Date(t.date).toLocaleDateString("tr-TR")}</td>
                <td className="px-4 py-2">{t.amount}</td>
                <td className="px-4 py-2">{t.currency}</td>
                <td className="px-4 py-2">{t.description}</td>
                <td className="px-4 py-2">{t.tl_total}</td>
                <td className="px-4 py-2 text-center space-x-2">
                  <button
                    onClick={() => {
                      setEditTransaction(t);
                      setModalOpen(true);
                    }}
                    className="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                  >
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center py-6 text-gray-500">
                  Kayıt bulunamadı
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Alt Bilgi + Pagination */}
        <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
          <div>
            Toplam {total} kayıt içerisinden {startEntry} - {endEntry} arası gösteriliyor
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50">
              &lt;
            </button>
            <span className="px-3 py-1 border rounded bg-blue-600 text-white">{page}</span>
            <button onClick={() => setPage((p) => p + 1)} disabled={transactions.length < limit} className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50">
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Düzenleme Modali */}
      {modalOpen && (
        <TransactionModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={fetchTransactions}
          transaction={editTransaction}
          projects={projects}
          categories={categories}
        />
      )}
    </div>
  );
}
