'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
// Důležité: Importujeme i typ Project
import { addProject, Project } from '../../../src/app/[lang]/admin/projects/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 font-bold text-white bg-black rounded-md cursor-pointer hover:bg-black/80 transition-all ease-in-out duration-200 disabled:bg-gray-400"
    >
      {pending ? 'Přidávám...' : 'Přidat'}
    </button>
  );
}

// ZDE JE TA ZMĚNA: Komponenta nyní přijímá props { collections }
export default function AddProjectForm({ collections }: { collections: Project[] }) {
  const router = useRouter();
  const initialState = { error: null, success: false };

  const [state, formAction] = useActionState(addProject, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [isCollection, setIsCollection] = useState(false);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setIsCollection(false);
      router.refresh();
    }
  }, [state, router]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="flex flex-col space-y-3">
        {/* První řádek: Název a tlačítko */}
        <div className="flex items-start space-x-4">
          <input
            type="text"
            name="name"
            placeholder="Název projektu (např. Svatba 2025)"
            className="flex-grow px-3 py-2 border rounded-md"
            required
          />
          <SubmitButton />
        </div>

        {/* Druhý řádek: Nastavení typu a rodiče */}
        <div className="flex items-center space-x-6 p-2 bg-gray-50 rounded-md border border-gray-100">
          {/* Checkbox: Je to kolekce? */}
          <label className="flex items-center cursor-pointer space-x-2">
            <input
              type="checkbox"
              name="is_collection"
              className="w-4 h-4"
              onChange={(e) => setIsCollection(e.target.checked)}
            />
            <span className="text-sm font-medium">Vytvořit jako Kolekci (složku)</span>
          </label>

          {/* Select: Patří do kolekce? (Zobrazíme jen pokud nevytváříme kolekci) */}
          {!isCollection && collections.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Patří do:</span>
              <select name="parent_id" className="border rounded px-2 py-1 text-sm bg-white">
                <option value="none">-- Žádná (Hlavní úroveň) --</option>
                {collections.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
        <textarea
          name="description_cs"
          placeholder="Český popis projektu..."
          className="flex-grow px-3 py-2 border rounded-md min-h-[100px]"
        />
        <textarea
          name="description_en"
          placeholder="Anglický popis projektu..."
          className="flex-grow px-3 py-2 border rounded-md min-h-[100px]"
        />
      </div>
      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
    </form>
  );
}