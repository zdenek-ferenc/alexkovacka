import Sidebar from "../../../components/admin/Sidebar";
import { supabase } from "../../../lib/supabaseClient";
import { FolderKanban, Eye, EyeOff, Image, ArrowRight } from "lucide-react";
import Link from 'next/link';

type DraftProject = {
  id: number;
  name: string;
};

function StatCard({ title, value, icon: Icon }: { title: string, value: number | string, icon: React.ElementType }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-black">{value}</p>
        </div>
        <div className="p-3 bg-gray-100 rounded-full">
          <Icon className="w-6 h-6 text-gray-700" />
        </div>
      </div>
    </div>
  );
}

async function getCount(tableName: string, filter?: { column: string, value: any }) {
  let query = supabase.from(tableName).select('*', { count: 'exact', head: true });
  if (filter) {
    query = query.eq(filter.column, filter.value);
  }
  const { count, error } = await query;
  return error ? 0 : count ?? 0;
}

export default async function AdminDashboardPage() {
  
  const [
    totalProjects,
    publishedProjects,
    draftProjects,
    totalPhotos,
    recentDraftsResult
  ] = await Promise.all([
    getCount('projects'),
    getCount('projects', { column: 'is_published', value: true }),
    getCount('projects', { column: 'is_published', value: false }),
    getCount('photos'),
    supabase
      .from('projects')
      .select('id, name')
      .eq('is_published', false)
      .order('created_at', { ascending: false }) 
      .limit(5) 
  ]);

  const recentDrafts: DraftProject[] = recentDraftsResult.data || [];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8">
          <h1 className="text-xl font-semibold">Přehled</h1>
        </header>
        
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Projektů celkem" value={totalProjects} icon={FolderKanban} />
            <StatCard title="Publikovaných" value={publishedProjects} icon={Eye} />
            <StatCard title="Konceptů (draftů)" value={draftProjects} icon={EyeOff} />
            <StatCard title="Fotografií celkem" value={totalPhotos} icon={Image} />
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Poslední koncepty</h2>
            {recentDrafts.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {recentDrafts.map((project) => (
                  <li key={project.id} className="py-3 flex items-center justify-between">
                    <span className="font-medium text-gray-800">{project.name}</span>
                    <Link 
                      href={`/admin/projects/${project.id}`} 
                      className="flex items-center text-sm font-medium text-black hover:underline"
                    >
                      Dokončit <ArrowRight size={16} className="ml-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">
                Skvělá práce, žádné rozpracované projekty!
              </p>
            )}
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Rychlé akce</h2>
            <div className="flex gap-4">
              <Link href="/admin/projects" className="px-5 py-3 font-bold text-white bg-black rounded-md hover:bg-gray-800">
                Spravovat všechny projekty
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}