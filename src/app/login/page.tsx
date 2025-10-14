// app/login/page.tsx
"use client";

import { useState } from 'react';
import { loginAction } from './actions'; // Tuto akci za chvíli vytvoříme

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  // Funkce, která se zavolá po odeslání formuláře
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const errorMessage = await loginAction(formData);

    if (errorMessage) {
      setError(errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Přihlášení do adminu</h1>
        {/* Formulář nyní volá naši funkci handleSubmit */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Uživatelské jméno</label>
            <input
              type="text"
              name="username" // Důležité: 'name' atributy
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Heslo</label>
            <input
              type="password"
              name="password" // Důležité: 'name' atributy
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full px-4 py-2 font-bold text-white bg-black rounded-md hover:bg-gray-800"
          >
            Přihlásit se
          </button>
        </form>
      </div>
    </div>
  );
}