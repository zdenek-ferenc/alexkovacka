'use client';

import { useState, useTransition } from 'react';
import { updateProjectTitleStyle } from '../../../src/app/[lang]/admin/projects/[id]/actions';
import { Check, Loader2 } from 'lucide-react';
import Image from 'next/image';

type TitleStyle = 'white_text' | 'white_on_black' | 'black_text' | 'black_on_white';

const styleOptions: { id: TitleStyle; name: string }[] = [
  { id: 'white_text', name: 'Bílý text (Výchozí)' },
  { id: 'white_on_black', name: 'Bílý text / Černý box' },
  { id: 'black_text', name: 'Černý text' },
  { id: 'black_on_white', name: 'Černý text / Bílý box' },
];

type Props = {
  projectId: number;
  projectName: string;
  mainImageUrl: string | null;
  currentStyle: TitleStyle;
};

const getPreviewClasses = (style: TitleStyle) => {
  switch (style) {
    case 'white_on_black':
      return 'bg-black/70 text-white p-4';
    case 'black_text':
      return 'text-black';
    case 'black_on_white':
      return 'bg-white/70 text-black p-4';
    case 'white_text':
    default:
      return 'text-white';
  }
};

export default function TitleStyleSelector({ projectId, projectName, mainImageUrl, currentStyle }: Props) {
  const [selectedStyle, setSelectedStyle] = useState<TitleStyle>(currentStyle);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      await updateProjectTitleStyle(projectId, selectedStyle);
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Vyberte styl titulku</h3>
        <div className="space-y-3">
          {styleOptions.map((option) => (
            <label
              key={option.id}
              className={`flex items-center p-3 border rounded-md cursor-pointer ${
                selectedStyle === option.id ? 'border-black ring-2 ring-black' : 'border-gray-200'
              }`}
            >
              <input
                type="radio"
                name="titleStyle"
                value={option.id}
                checked={selectedStyle === option.id}
                onChange={() => setSelectedStyle(option.id)}
                className="w-4 h-4 text-black focus:ring-black"
              />
              <span className="ml-3 font-medium">{option.name}</span>
            </label>
          ))}
        </div>
        <button
          onClick={handleSave}
          disabled={isPending || selectedStyle === currentStyle}
          className="mt-6 px-4 py-2 cursor-pointer text-sm font-bold text-white bg-black rounded-md disabled:bg-gray-400 flex items-center gap-2"
        >
          {isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Check size={16} />
          )}
          {isPending ? 'Ukládám...' : 'Uložit styl'}
        </button>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Živý náhled</h3>
        <div 
          className="relative w-full h-64 bg-gray-300 rounded-lg overflow-hidden flex items-center justify-center border"
        >
          {mainImageUrl ? (
            <Image
              src={mainImageUrl}
              alt="Náhled hlavní fotky"
              layout="fill"
              objectFit="cover"
            />
          ) : (
            <span className="text-gray-500">Hlavní fotka chybí</span>
          )}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-4">
            <h1 
              className={`text-3xl font-bold text-center tracking-wider transition-all ${getPreviewClasses(selectedStyle)}`}
            >
              {projectName}
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}