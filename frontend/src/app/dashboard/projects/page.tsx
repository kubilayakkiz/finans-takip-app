"use client";

import { useEffect, useState } from "react";
import ProjectModal from "@/app/components/ProjectModal";
import { FaEdit, FaTrash } from "react-icons/fa";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

interface Project {
  id: number;
  name: string;
  created_at: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [sortColumn, setSortColumn] = useState<keyof Project>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    fetchProjects();
  }, [page, search, limit, sortColumn, sortOrder]);

  const fetchProjects = async () => {
    const res = await fetch(
      `http://127.0.0.1:8000/projects?search=${search}&skip=${(page - 1) * limit}&limit=${limit}&sort_by=${sortColumn}&sort_order=${sortOrder}`
    );
    const data = await res.json();
    setProjects(data.items);
    setTotal(data.total);
  };

  const handleSort = (column: keyof Project) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Bu projeyi silmek istediğinizden emin misiniz?")) {
      const res = await fetch(`http://127.0.0.1:8000/projects/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchProjects();
      }
    }
  };

  const startEntry = (page - 1) * limit + 1;
  const endEntry = Math.min(page * limit, total);

  const getSortIcon = (column: keyof Project) => {
    if (sortColumn !== column) return <FaSort className="inline ml-1" />;
    return sortOrder === "asc" ? (
      <FaSortUp className="inline ml-1" />
    ) : (
      <FaSortDown className="inline ml-1" />
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Başlık ve Buton */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Projeler</h1>
        <button
          onClick={() => {
            setEditProject(null);
            setModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + Yeni Proje
        </button>
      </div>

      {/* Üst Kontroller */}
      <div className="flex justify-between items-center mb-4">
        {/* Gösterim Sayısı */}
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

        {/* Arama */}
        <div>
          <input
            type="text"
            placeholder="Proje ara..."
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
                ID {getSortIcon("id")}
              </th>
              <th
                className="px-4 py-3 text-left cursor-pointer"
                onClick={() => handleSort("name")}
              >
                Proje Adı {getSortIcon("name")}
              </th>
              <th
                className="px-4 py-3 text-left cursor-pointer"
                onClick={() => handleSort("created_at")}
              >
                Oluşturulma Tarihi {getSortIcon("created_at")}
              </th>
              <th className="px-4 py-3 text-center">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr
                key={project.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition"
              >
                <td className="px-4 py-2">{project.id}</td>
                <td className="px-4 py-2">{project.name}</td>
                <td className="px-4 py-2">
                  {new Date(project.created_at).toLocaleDateString("tr-TR")}
                </td>
                <td className="px-4 py-2 text-center space-x-2">
                  <button
                    onClick={() => {
                      setEditProject(project);
                      setModalOpen(true);
                    }}
                    className="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-500">
                  Kayıt bulunamadı
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Alt Bilgi ve Pagination */}
        <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
          <div>
            Toplam {total} kayıt içerisinden {startEntry} - {endEntry} arası gösteriliyor
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
              disabled={projects.length < limit}
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <ProjectModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={fetchProjects}
          project={editProject}
        />
      )}
    </div>
  );
}
