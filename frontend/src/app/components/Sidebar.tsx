"use client";

import { useState } from "react";
import {
  FaBars,
  FaTimes,
  FaHome,
  FaPlusCircle,
  FaListAlt,
  FaFolderPlus,
  FaChartLine,
  FaTable,
  FaUsersCog,
} from "react-icons/fa";
import Link from "next/link";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Menü listesi
  const menuItems = [
    { name: "Anasayfa", icon: <FaHome />, href: "/dashboard" },
    { name: "Gelir / Gider Ekle", icon: <FaPlusCircle />, href: "/dashboard/transactions" },
    { name: "Kategori Ekle", icon: <FaListAlt />, href: "/dashboard/categories" },
    { name: "Proje Ekle", icon: <FaFolderPlus />, href: "/dashboard/projects" },
    { name: "Raporlar", icon: <FaChartLine />, href: "/reports" },
    { name: "Tüm Kayıtlar", icon: <FaTable />, href: "/records" },
    { name: "Kullanıcı Yönetimi", icon: <FaUsersCog />, href: "/users" },
  ];

  // Sidebar genişliği
  const sidebarWidth = isOpen || isHovered ? "w-64" : "w-16";

  return (
    <div
      className={`${sidebarWidth} bg-[#0d1b2a] h-screen text-white transition-all duration-300 flex flex-col`}
      onMouseEnter={() => {
        if (window.innerWidth > 768 && !isOpen) setIsHovered(true); // sadece desktop
      }}
      onMouseLeave={() => {
        if (window.innerWidth > 768 && !isOpen) setIsHovered(false); // sadece desktop
      }}
    >
      {/* Üst Kısım */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {(isOpen || isHovered) && (
          <span className="text-lg font-bold whitespace-nowrap">KA Gelir / Gider APP</span>
        )}
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      {/* Menü Linkleri */}
      <nav className="flex-1 p-2">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className="flex items-center gap-3 p-2 rounded hover:bg-gray-700"
              >
                {item.icon}
                {(isOpen || isHovered) && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
