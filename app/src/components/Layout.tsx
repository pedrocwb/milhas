import { ReactNode, useState } from 'react';
import {
  HomeIcon,
  UsersIcon,
  ChartBarIcon,
  TicketIcon,
  CurrencyDollarIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navigation = [
  { name: 'Dashboard', id: 'dashboard', icon: HomeIcon },
  { name: 'Pessoas', id: 'people', icon: UsersIcon },
  { name: 'Milhas', id: 'miles', icon: ChartBarIcon },
  { name: 'Beneficiários', id: 'beneficiaries', icon: TicketIcon },
  { name: 'Vendas', id: 'sales', icon: CurrencyDollarIcon },
];

export const Layout = ({ children, currentPage, onNavigate }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-surface-light border-r border-slate-700/50
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                <span className="text-xl">✈️</span>
              </div>
              <div>
                <h1 className="text-lg font-display font-bold text-slate-100">MilhasApp</h1>
                <p className="text-xs text-slate-500">Gerenciamento de Milhas</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-surface-lighter"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setSidebarOpen(false);
                }}
                className={`sidebar-link w-full ${currentPage === item.id ? 'active' : ''}`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700/50">
            <div className="card p-4 bg-gradient-to-br from-primary/10 to-primary-dark/10 border-primary/20">
              <p className="text-sm text-slate-300 mb-2">💡 Dica</p>
              <p className="text-xs text-slate-400">
                Mantenha suas milhas atualizadas para um melhor controle financeiro.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between h-16 px-4 bg-surface-light border-b border-slate-700/50">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-surface-lighter"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-display font-bold">MilhasApp</h1>
          <div className="w-10" /> {/* Spacer */}
        </header>

        {/* Page content */}
        <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};




