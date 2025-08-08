"use client";

import { useState, useRef, useEffect } from "react";
import { FaBell, FaUserCircle } from "react-icons/fa";
import LogoutButton from "@/app/components/LogoutButton";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Menü dışına tıklanınca kapatma
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="h-16 bg-white flex items-center justify-between px-6 shadow-sm">
      {/* Arama Kutusu */}
      <div className="w-40 md:w-64">
        <input
            type="text"
            placeholder="Ara..."
            className="w-full px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
        />
      </div>


      {/* Sağ Taraf */}
      <div className="flex items-center gap-6 relative" ref={menuRef}>
        <FaBell className="text-gray-600 text-xl cursor-pointer hover:text-blue-500 transition-colors" />

        {/* Kullanıcı Menüsü */}
        <div className="relative">
          <FaUserCircle
            className="text-gray-600 text-2xl cursor-pointer hover:text-blue-500 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          />
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md border border-gray-100 z-50">
              <ul className="py-2 text-sm text-gray-700">
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  Profilim
                </li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  Ayarlar
                </li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600">
                  <LogoutButton />
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
