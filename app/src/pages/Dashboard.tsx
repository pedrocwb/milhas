import { useApp } from '../context/AppContext';
import { formatBRL, formatNumber, saveData, loadData } from '../utils/storage';
import { createSampleData } from '../utils/sampleData';
import {
  ChartBarIcon,
  UserGroupIcon,
  TicketIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import type { Program } from '../types';

const programColors: Record<Program, string> = {
  AZUL: 'from-blue-500 to-blue-600',
  LATAM: 'from-red-500 to-red-600',
  SMILES: 'from-orange-500 to-orange-600',
  LIVELO: 'from-purple-500 to-purple-600',
};

const programIcons: Record<Program, string> = {
  AZUL: '🔵',
  LATAM: '🔴',
  SMILES: '🟠',
  LIVELO: '🟣',
};

export const Dashboard = () => {
  const { state, getDashboardSummary } = useApp();
  const summary = getDashboardSummary();

  const totalValue = summary.totalPointsValue + summary.totalOrganicValue;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-100">Dashboard</h1>
        <p className="text-slate-400 mt-1">Visão geral do seu patrimônio em milhas</p>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <BanknotesIcon className="w-6 h-6 text-primary-light" />
              </div>
              <ArrowTrendingUpIcon className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-sm text-slate-400 mb-1">Valor Total Estimado</p>
            <p className="text-2xl font-bold text-slate-100">{formatBRL(totalValue)}</p>
          </div>
        </div>

        <div className="stat-card group">
          <div className="absolute inset-0 bg-gradient-to-br from-accent to-amber-600 opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-accent-light" />
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-1">Total de Pontos</p>
            <p className="text-2xl font-bold text-slate-100">{formatNumber(summary.totalPoints)}</p>
          </div>
        </div>

        <div className="stat-card group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-600 opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-1">Acúmulo Orgânico</p>
            <p className="text-2xl font-bold text-slate-100">{formatBRL(summary.totalOrganicValue)}</p>
          </div>
        </div>

        <div className="stat-card group">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-violet-600 opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-violet-400" />
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-1">Pessoas Cadastradas</p>
            <p className="text-2xl font-bold text-slate-100">{state.people.length}</p>
          </div>
        </div>
      </div>

      {/* Secondary stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-4">
            <TicketIcon className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-slate-200">Beneficiários Ativos</h3>
          </div>
          <p className="text-3xl font-bold text-slate-100">{summary.activeBeneficiaries}</p>
          <p className="text-sm text-slate-400 mt-1">
            de {state.beneficiaries.length} total
          </p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-4">
            <BanknotesIcon className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-slate-200">Vendas Pendentes</h3>
          </div>
          <p className="text-3xl font-bold text-slate-100">{summary.pendingSales}</p>
          <p className="text-sm text-slate-400 mt-1">
            de {state.sales.length} total
          </p>
        </div>
      </div>

      {/* Miles by Program */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-slate-200 mb-6">Milhas por Programa</h3>
        
        {summary.pointsByProgram.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {summary.pointsByProgram.map(({ program, points, value }) => (
              <div
                key={program}
                className={`relative overflow-hidden rounded-xl p-4 bg-gradient-to-br ${programColors[program as Program]} bg-opacity-10`}
              >
                <div className="absolute top-2 right-2 text-2xl opacity-50">
                  {programIcons[program as Program]}
                </div>
                <p className="text-sm font-medium text-white/80 mb-1">{program}</p>
                <p className="text-xl font-bold text-white">{formatNumber(points)}</p>
                <p className="text-sm text-white/70 mt-1">{formatBRL(value)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ChartBarIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Nenhuma milha cadastrada ainda</p>
            <p className="text-sm text-slate-500 mt-1">
              Adicione pessoas e suas milhas para ver as estatísticas
            </p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-slate-200 mb-6">Atividade Recente</h3>
        
        {state.sales.length > 0 ? (
          <div className="space-y-3">
            {state.sales.slice(0, 5).map((sale) => {
              const person = state.people.find(p => p.id === sale.personId);
              return (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-lighter/50 hover:bg-surface-lighter transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      sale.status === 'COMPLETED' ? 'bg-emerald-400' :
                      sale.status === 'PARTIAL' ? 'bg-amber-400' : 'bg-slate-400'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        {person?.name || 'Desconhecido'} - {sale.program}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatNumber(sale.quantity)} milhas
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-slate-300">
                    {formatBRL(sale.totalValue)}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <BanknotesIcon className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400">Nenhuma venda registrada</p>
          </div>
        )}
      </div>

      {/* Quick tips for empty state */}
      {state.people.length === 0 && (
        <div className="card p-6 border-dashed border-2 border-primary/30 bg-primary/5">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">🚀 Comece aqui!</h3>
          <div className="space-y-3 text-sm text-slate-400 mb-6">
            <p>1. Adicione pessoas na seção <strong className="text-primary-light">Pessoas</strong></p>
            <p>2. Cadastre as milhas de cada pessoa em <strong className="text-primary-light">Milhas</strong></p>
            <p>3. Gerencie os beneficiários em <strong className="text-primary-light">Beneficiários</strong></p>
            <p>4. Registre suas vendas em <strong className="text-primary-light">Vendas</strong></p>
          </div>
          <button
            onClick={() => {
              const sampleData = createSampleData();
              saveData(sampleData);
              window.location.reload();
            }}
            className="btn-secondary text-sm"
          >
            ✨ Carregar dados de exemplo
          </button>
        </div>
      )}
    </div>
  );
};

