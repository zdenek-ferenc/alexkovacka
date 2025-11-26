import Sidebar from "@/components/admin/Sidebar";
import AddProjectForm from "@/components/admin/AddProjectForm";
import ProjectList from "@/components/admin/ProjectList";
import { Project } from "./actions"; 
import { createClient } from "@supabase/supabase-js"; 

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { persistSession: false } }
  );
}

export default async function AdminProjectsPage() {
  const supabaseAdmin = createAdminClient();

  const { data: projectsRaw, error } = await supabaseAdmin 
    .from("projects")
    .select("*")
    .order("order_index", { ascending: true }); 
  
  const projects = (projectsRaw as Project[]) || [];

  // Vyfiltrujeme pouze kolekce, abychom je nabídli ve formuláři
  const collections = projects.filter(p => p.is_collection);

  return (
    <div className="flex min-h-screen h-full bg-gray-100">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b flex items-center px-8">
          <h1 className="text-xl font-semibold">Správa projektů</h1>
        </header>
        <div className="p-8 space-y-8">
          <div className="p-6 bg-white rounded-lg">
            <h2 className="text-lg font-bold mb-4">Přidat nový projekt / kolekci</h2>
            {/* Předáme existující kolekce do formuláře */}
            <AddProjectForm collections={collections} />
          </div>
          <div className="p-6 bg-white rounded-lg">
            <h2 className="text-lg font-bold mb-4">Seznam projektů</h2>
            <ProjectList initialProjects={projects} /> 
            {error && <p className="text-red-500 mt-4">Chyba načítání projektů: {error.message}</p>}
          </div>
        </div>
      </main>
    </div>
  );
}