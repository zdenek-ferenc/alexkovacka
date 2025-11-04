// src/app/admin/projects/page.tsx
import Sidebar from "@/components/admin/Sidebar";
import { supabase } from "@/lib/supabaseClient";
import AddProjectForm from "@/components/admin/AddProjectForm";
import ProjectList from "@/components/admin/ProjectList";
import { Project } from "./actions"; 

export default async function AdminProjectsPage() {
  
  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .order("order_index", { ascending: true }); 

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b flex items-center px-8">
          <h1 className="text-xl font-semibold">Správa projektů</h1>
        </header>
        <div className="p-8 space-y-8">
          <div className="p-6 bg-white rounded-lg">
            <h2 className="text-lg font-bold mb-4">Přidat nový projekt</h2>
            <AddProjectForm />
          </div>
          <div className="p-6 bg-white rounded-lg">
            <h2 className="text-lg font-bold mb-4">Seznam projektů</h2>
            <ProjectList initialProjects={(projects as Project[]) || []} />
            {error && <p className="text-red-500 mt-4">Chyba načítání projektů: {error.message}</p>}
          </div>
        </div>
      </main>
    </div>
  );
}