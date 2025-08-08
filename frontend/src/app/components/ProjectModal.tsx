"use client";

import { useState, useEffect } from "react";

interface Project {
  id: number;
  name: string;
}

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Listeyi yenilemek için
  project?: Project | null;
}

export default function ProjectModal({
  isOpen,
  onClose,
  onSuccess,
  project,
}: ProjectModalProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (project) {
      setName(project.name);
    } else {
      setName("");
    }
  }, [project]);

  if (!isOpen) return null; // Modal kapalıysa render etme

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Proje adı boş olamaz");
      return;
    }

    setLoading(true);

    try {
      const method = project ? "PUT" : "POST";
      const url = project
        ? `http://127.0.0.1:8000/projects/${project.id}`
        : "http://127.0.0.1:8000/projects";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">
          {project ? "Proje Düzenle" : "Yeni Proje Ekle"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Proje adı"
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
