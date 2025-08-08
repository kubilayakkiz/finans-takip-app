"use client";

import { useEffect, useState } from "react";
import CategoryModal from "@/app/components/CategoryModal";
import { FaEdit, FaTrash, FaSortUp, FaSortDown } from "react-icons/fa";

interface Category {
  id: number;
  type: string;
  name: string;
  created_at: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [sortColumn, setSortColumn] = useState<keyof Category>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    fetchCategories();
  }, [page, search, limit, sortColumn, sortOrder]);

  const fetchCategories = async () => {
    const res = await fetch(
      `http://127.0.0.1:8000/categories?search=${search}&skip=${(page - 1) * limit}&limit=${limit}&sort_by=${sortColumn}&sort_order=${sortOrder}`
    );
    const data = await res.json();
    setCategories(data.items);
    setTotal(data.total);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Bu kategoriyi silmek istediğinizden emin misiniz?")) {
      const res = await fetch(`http://127.0.0.1:8000/categories/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchCategories();
      }
    }
  };

  const handleSort = (column: keyof Category) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const startEntry = (page - 1) * limit + 1;
  const endEntry = Math.min(page * limit, total);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Sayfa Başlığı ve Buton */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Kategoriler</h1>
        <button
          onClick={() => {
            setEditCategory(null);
            setModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + Yeni Kategori
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
            placeholder="Kategori ara..."
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
              <th
                className="px-4 py-3 text-left cursor-pointer"
                onClick={() => handleSort("id")}
              >
                ID{" "}
                {sortColumn === "id" &&
                  (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />)}
              </th>
              <th
                className="px-4 py-3 text-left cursor-pointer"
                onClick={() => handleSort("type")}
              >
                Tür{" "}
                {sortColumn === "type" &&
                  (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />)}
              </th>
              <th
                className="px-4 py-3 text-left cursor-pointer"
                onClick={() => handleSort("name")}
              >
                Kategori Adı{" "}
                {sortColumn === "name" &&
                  (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />)}
              </th>
              <th
                className="px-4 py-3 text-left cursor-pointer"
                onClick={() => handleSort("created_at")}
              >
                Oluşturulma Tarihi{" "}
                {sortColumn === "created_at" &&
                  (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />)}
              </th>
              <th className="px-4 py-3 text-center">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr
                key={cat.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition"
              >
                <td className="px-4 py-2">{cat.id}</td>
                <td className="px-4 py-2">{cat.type}</td>
                <td className="px-4 py-2">{cat.name}</td>
                <td className="px-4 py-2">
                  {new Date(cat.created_at).toLocaleDateString("tr-TR")}
                </td>
                <td className="px-4 py-2 text-center space-x-2">
                  <button
                    onClick={() => {
                      setEditCategory(cat);
                      setModalOpen(true);
                    }}
                    className="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  Kayıt bulunamadı
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Alt Bilgi ve Pagination */}
        <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
          <div>
            Toplam {total} kayıt içerisinden {startEntry} - {endEntry} arası
            gösteriliyor
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
            >
              &lt;
            </button>
            <span className="px-3 py-1 border rounded bg-blue-600 text-white">
              {page}
            </span>
            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={categories.length < limit}
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <CategoryModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={fetchCategories}
          category={editCategory}
        />
      )}
    </div>
  );
}
