
import Sidebar from "@/components/admin/Sidebar";

export default function AdminDashboardPage() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8">
          <h1 className="text-xl font-semibold">Přehled</h1>
        </header>
        <div className="p-8">
          <div className="p-6 bg-white rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Vítej v administraci!</h2>
            <p className="text-gray-700">
              Tady můžeš spravovat obsah svého portfolia. V levém menu si vyber sekci,
              kterou chceš upravit. Začni tím, že přejdeš do sekce <strong>"Projekty"</strong>,
              kde můžeš přidávat a spravovat své fotogalerie.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}