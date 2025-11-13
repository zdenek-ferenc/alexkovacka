'use client';

import { useRouter } from 'next/navigation'; 
import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { addProject } from '../../../src/app/[lang]/admin/projects/actions';

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

export default function AddProjectForm() {
  const router = useRouter();
  const initialState = { error: null, success: false };
  
  const [state, formAction] = useActionState(addProject, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      router.refresh(); 
    }
  }, [state, router]); 

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
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