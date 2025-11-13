// src/app/[lang]/admin/projects/page.tsx

import Sidebar from "@/components/admin/Sidebar";
// 1. Odebereme import veřejného klienta
// import { supabase } from "@/lib/supabaseClient";
import AddProjectForm from "@/components/admin/AddProjectForm";
import ProjectList from "@/components/admin/ProjectList";
import { Project } from "./actions"; 
import { createClient } from "@supabase/supabase-js"; // 2. Přidáme import createClient

// 3. Přidáme funkci pro vytvoření Admin klienta
// Stejně jako v actions.ts
function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { persistSession: false } }
  );
}

export default async function AdminProjectsPage() {
  
  // 4. Vytvoříme a použijeme admin klienta
  const supabaseAdmin = createAdminClient();

  const { data: projects, error } = await supabaseAdmin // <-- POUŽÍVÁME ADMIN KLIENTA
    .from("projects")
    .select("*")
    .order("order_index", { ascending: true }); 

  return (
    <div className="flex h-full bg-gray-100">
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
            {/* 5. Předáme 'projects', které teď obsahují VŠECHNY projekty */}
            <ProjectList initialProjects={(projects as Project[]) || []} /> 
            {error && <p className="text-red-500 mt-4">Chyba načítání projektů: {error.message}</p>}
          </div>
        </div>
      </main>
    </div>
  );
}