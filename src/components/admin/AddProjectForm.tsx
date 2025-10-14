
'use client';


import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { addProject } from '@/app/admin/projects/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 font-bold text-white bg-black rounded-md hover:bg-gray-800 disabled:bg-gray-400"
    >
      {pending ? 'Přidávám...' : 'Přidat'}
    </button>
  );
}

export default function AddProjectForm() {
  const initialState = { error: null, success: false };
  
  const [state, formAction] = useActionState(addProject, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state]);

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
      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
    </form>
  );
}