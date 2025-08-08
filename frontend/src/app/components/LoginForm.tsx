"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error("Login failed");

      const data = await response.json();
      Cookies.set("token", data.access_token, { expires: 1 });
      localStorage.setItem("token", data.access_token);

      rememberMe
        ? localStorage.setItem("rememberEmail", email)
        : localStorage.removeItem("rememberEmail");

      router.push("/dashboard");
    } catch (err) {
      setError("E-posta veya şifre hatalı.");
    }
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-md">
      <div className="text-center mb-6">
        <img src="/images/logo.png" alt="Logo" className="mx-auto w-24 h-24" />
        <h2 className="text-xl font-bold">Gelir/Gider Takibi</h2>
        <p className="text-sm text-gray-500">Giriş yapmak için devam edin</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          className="w-full px-4 py-2 border rounded-lg"
          placeholder="E-posta adresiniz"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full px-4 py-2 border rounded-lg pr-10"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-2 text-gray-500"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
          />
          Hatırla Beni
        </label>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg"
        >
          Giriş Yap 🔐
        </button>
      </form>
    </div>
  );
}
