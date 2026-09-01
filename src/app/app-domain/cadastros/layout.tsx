"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, 
  Building2, 
  Truck,
  Home,
  FileBox,
  LayoutDashboard,
  ArrowLeft,
  Menu,
  X
} from "lucide-react";

const sidebarNavItems = [
  { title: "Painel de Cadastros", href: "/cadastros", icon: LayoutDashboard },
  { title: "Pessoas Físicas", href: "/cadastros/pessoas-fisicas", icon: Users },
  { title: "Pessoas Jurídicas", href: "/cadastros/pessoas-juridicas", icon: Building2 },
  { title: "Fornecedores", href: "/cadastros/fornecedores", icon: Truck },
  { title: "Imóveis", href: "/cadastros/imoveis", icon: Home },
  { title: "Documentos", href: "/cadastros/documentos", icon: FileBox },
];

export default function CadastrosLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div data-module-shell className="relative -my-2 mx-auto flex min-h-0 w-[calc(100%+1rem)] max-w-[calc(1600px+1rem)] flex-1 flex-col bg-slate-50/30 sm:-my-3 sm:w-[calc(100%+1.5rem)] sm:max-w-[calc(1600px+1.5rem)] md:flex-row">
      
      {/* Mobile Header with Hamburger */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 p-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 leading-tight">Cadastros Gerais</h2>
        </div>
         <button
           onClick={() => setIsSidebarOpen(!isSidebarOpen)}
           aria-label="Alternar menu de Cadastros Gerais"
           aria-expanded={isSidebarOpen}
           className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        w-full md:w-[260px] md:shrink-0 md:border-r border-slate-200 bg-white py-6 px-4 md:px-5 shadow-[2px_0_8px_rgba(0,0,0,0.02)] z-10 relative flex flex-col
        ${isSidebarOpen ? 'block' : 'hidden md:flex'}
      `}>
        <div className="mb-8 px-2 hidden md:block">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight leading-tight">Cadastros Gerais</h2>
          <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Cadastro Único</p>
        </div>
        
        <nav className="flex flex-col gap-1.5 flex-1">
          {sidebarNavItems.map((item) => {
            const isActive = item.href === "/cadastros" 
              ? pathname === "/cadastros" 
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 outline-none ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-600/50"
                }`}
              >
                <item.icon className={`h-[18px] w-[18px] ${isActive ? "text-white" : "text-slate-400"}`} strokeWidth={isActive ? 2.5 : 2} />
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Menu items */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <Link
            href="/dashboard"
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200"
          >
            <ArrowLeft className="h-[18px] w-[18px] text-slate-400" strokeWidth={2} />
            Voltar ao Dashboard
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex min-w-0 flex-1 flex-col bg-slate-50/50">
        <div className="flex-1 p-2 md:p-3">
          {children}
        </div>
      </main>
    </div>
  );
}
