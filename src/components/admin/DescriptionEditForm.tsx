'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateProjectDescriptions } from '@/app/[lang]/admin/projects/[id]/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 font-bold text-white bg-black rounded-md cursor-pointer hover:bg-gray-500 disabled:bg-gray-400"
    >
      {pending ? 'Ukládám...' : 'Uložit popisy'}
    </button>
  );
}

type Props = {
  projectId: number;
  descriptionCs: string | null;
  descriptionEn: string | null;
};


type FormState = {
  error: string | null;
  success: boolean;
};

export default function DescriptionEditForm({ projectId, descriptionCs, descriptionEn }: Props) {

  const initialState: FormState = { error: null, success: false };
  

  const [state, formAction] = useActionState(
    (prevState: FormState, formData: FormData) => 
      updateProjectDescriptions(prevState, projectId, formData),
    initialState
  );
  
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (state.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
        <div className="flex-1 space-y-4">
          <div className='flex flex-col gap-2'>
            <label htmlFor="description_cs" className="font-semibold text-sm">Český popis</label>
            <textarea
              id="description_cs"
              name="description_cs"
              placeholder="Český popis projektu..."
              className="w-full px-3 py-2 border rounded-md min-h-[150px]"
              defaultValue={descriptionCs || ''}
            />
          </div>
        </div>
        <div className="flex-1 space-y-4">
          <div className='flex flex-col gap-2'>
            <label htmlFor="description_en" className="font-semibold text-sm">Anglický popis</label>
            <textarea
              id="description_en"
              name="description_en"
              placeholder="Anglický popis projektu..."
              className="w-full px-3 py-2 border rounded-md min-h-[150px]"
              defaultValue={descriptionEn || ''}
            />
          </div>
          
        </div>
      </div>
      <div className="flex justify-end items-center gap-4">
        {showSuccess && <p className="text-sm text-green-600">Úspěšně uloženo!</p>}
        {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
        <SubmitButton />
      </div>
    </form>
  );
}