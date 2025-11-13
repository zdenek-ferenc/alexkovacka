"use client";
import React from 'react';
import { AppDictionary } from '@/types'; 

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  dict: AppDictionary;
}

export default function ContactModal({ isOpen, onClose, dict }: ContactModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Formulář odeslán (simulace).');
    onClose();
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

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
              {dict.form.name}
            </label>
            <input 
              type="text" 
              id="name" 
              className="w-full rounded-md border border-gray-300 p-2 text-gray-900 focus:border-black focus:ring-black" 
              required 
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
              {dict.form.email}
            </label>
            <input 
              type="email" 
              id="email" 
              className="w-full rounded-md border border-gray-300 p-2 text-gray-900 focus:border-black focus:ring-black" 
              required 
            />
          </div>
          <div className="mb-4">
            <label htmlFor="message" className="mb-2 block text-sm font-medium text-gray-700">
              {dict.form.message}
            </label>
            <textarea 
              id="message" 
              rows={4} 
              className="w-full rounded-md border border-gray-300 p-2 text-gray-900 focus:border-black focus:ring-black" 
              required 
            ></textarea>
          </div>
          <button 
            type="submit" 
            className="w-full rounded-md bg-black px-4 cursor-pointer py-2 text-white transition-colors duration-200 hover:bg-gray-800"
          >
            {dict.form.submit}
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