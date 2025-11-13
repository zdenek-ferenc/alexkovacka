'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { addClientGallery } from '../../../src/app/[lang]/admin/clients/actions';
import { useRouter } from 'next/navigation';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 font-bold text-white cursor-pointer bg-black rounded-md hover:bg-black/80 transition-all ease-in-out duration-200 disabled:bg-gray-400"
    >
      {pending ? 'Vytvářím...' : 'Vytvořit'}
    </button>
  );
}

export default function AddClientGalleryForm() {
  const router = useRouter();
  const initialState = { error: null, success: false };
  const [state, formAction] = useActionState(addClientGallery, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
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
          placeholder="Název galerie (např. Svatba Novákovi)"
          className="flex-grow px-3 py-2 border rounded-md"
          required
        />
        <SubmitButton />
      </div>
      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
    </form>
  );
}