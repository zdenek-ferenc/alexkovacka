// zdenek-ferenc/alexkovacka/src/components/ContactModal.tsx
"use client";
import React, { useState, useTransition } from 'react';
import { AppDictionary } from '@/types'; 
import { sendEmail } from '@/app/actions/sendEmail'; // Import server action

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  dict: AppDictionary;
}

export default function ContactModal({ isOpen, onClose, dict }: ContactModalProps) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ type: null, message: '' });
    
    // Získáme data z formuláře
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await sendEmail(formData);

      if (result.success) {
        setStatus({ type: 'success', message: 'Zpráva byla úspěšně odeslána!' });
        // Počkáme chvilku, aby si uživatel přečetl zprávu, a pak zavřeme (volitelné)
        setTimeout(() => {
          onClose();
          setStatus({ type: null, message: '' }); // Reset pro příště
        }, 2000);
      } else {
        setStatus({ type: 'error', message: result.message || 'Něco se pokazilo.' });
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 transition-opacity duration-300">
      
      <div className="relative w-full max-w-md rounded-lg bg-white p-8 text-black shadow-xl transform transition-all duration-300 scale-95 opacity-0 animate-fadeInScale">
        
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-2xl cursor-pointer font-bold text-gray-500 hover:text-gray-900"
          aria-label="Zavřít"
        >
          &times;
        </button>

        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
          {dict.home.contact}
        </h2>

        {status.message && (
          <div className={`mb-4 p-3 rounded text-sm ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
              {dict.form.name}
            </label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              className="w-full rounded-md border border-gray-300 p-2 text-gray-900 focus:border-black focus:ring-black" 
              required 
              disabled={isPending}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
              {dict.form.email}
            </label>
            <input 
              type="email" 
              id="email" 
              name="email"
              className="w-full rounded-md border border-gray-300 p-2 text-gray-900 focus:border-black focus:ring-black" 
              required 
              disabled={isPending}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="message" className="mb-2 block text-sm font-medium text-gray-700">
              {dict.form.message}
            </label>
            <textarea 
              id="message" 
              name="message"
              rows={4} 
              className="w-full rounded-md border border-gray-300 p-2 text-gray-900 focus:border-black focus:ring-black" 
              required 
              disabled={isPending}
            ></textarea>
          </div>
          <button 
            type="submit" 
            disabled={isPending}
            className={`w-full rounded-md px-4 py-2 text-white transition-colors duration-200 ${isPending ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800 cursor-pointer'}`}
          >
            {isPending ? 'Odesílám...' : dict.form.submit}
          </button>
        </form>
      </div>
      
      <style jsx global>{`
        @keyframes fadeInScale {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fadeInScale {
          animation: fadeInScale 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}