// app/admin/projects/page.tsx
import Sidebar from "@/components/admin/Sidebar";
import { supabase } from "@/lib/supabaseClient";
import { addProject, deleteProject } from "./actions";
import AddProjectForm from "@/components/admin/AddProjectForm";
import { Trash2 } from "lucide-react";

// Typová definice pro projekt
type Project = {
  id: number;
  name: string;
  slug: string;
  created_at: string;
};

export default async function AdminProjectsPage() {
  // Načteme všechny projekty ze Supabase
  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b flex items-center px-8">
          <h1 className="text-xl font-semibold">Správa projektů</h1>
        </header>

        <div className="p-8 space-y-8">
          {/* SEKCE 1: Přidání nového projektu */}
          <div className="p-6 bg-white rounded-lg">
            <h2 className="text-lg font-bold mb-4">Přidat nový projekt</h2>
            <AddProjectForm />
          </div>

          {/* SEKCE 2: Seznam existujících projektů */}
          <div className="p-6 bg-white rounded-lg">
            <h2 className="text-lg font-bold mb-4">Seznam projektů</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="p-4">Název</th>
                    <th className="p-4">Slug (URL)</th>
                    <th className="p-4 text-right">Akce</th>
                  </tr>
                </thead>
                <tbody>
                    {projects?.map((project: Project) => (
                        <tr key={project.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-medium">
                            {/* TOTO JE KLÍČOVÁ ZMĚNA */}
                            <a href={`/admin/projects/${project.id}`} className="block">
                            {project.name}
                            </a>
                        </td>
                        <td className="p-4 text-gray-500">
                            <a href={`/admin/projects/${project.id}`} className="block">
                            /{project.slug}
                            </a>
                        </td>
                        <td className="p-4 text-right">
                            <form action={async () => {
                            'use server';
                            await deleteProject(project.id);
                            }}>
                            <button type="submit" className="text-red-500 hover:text-red-700 p-2 rounded-md cursor-pointer">
                                <Trash2 size={20} />
                            </button>
                            </form>
                        </td>
                        </tr>
                    ))}
                    </tbody>
              </table>
              {error && <p className="text-red-500 mt-4">Chyba načítání projektů.</p>}
              {projects?.length === 0 && <p className="text-gray-500 mt-4">Zatím tu nejsou žádné projekty.</p>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}