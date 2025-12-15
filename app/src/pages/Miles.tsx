import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatBRL, formatNumber } from '../utils/storage';
import type { MilesBalance, Program } from '../types';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  XMarkIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const programs: Program[] = ['AZUL', 'LATAM', 'SMILES', 'LIVELO'];

interface MilesFormData {
  personId: string;
  program: Program;
  currentPoints: number;
  estimatedValueBRL: number;
  pendingPoints: number;
  isOrganic: boolean;
}

const emptyFormData: MilesFormData = {
  personId: '',
  program: 'SMILES',
  currentPoints: 0,
  estimatedValueBRL: 0,
  pendingPoints: 0,
  isOrganic: false,
};

// Average value per 1000 miles (can be adjusted)
const defaultPricePerThousand: Record<Program, number> = {
  AZUL: 25,
  LATAM: 24,
  SMILES: 22,
  LIVELO: 40,
};

export const Miles = () => {
  const { state, addMilesBalance, updateMilesBalance, deleteMilesBalance } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBalance, setEditingBalance] = useState<MilesBalance | null>(null);
  const [formData, setFormData] = useState<MilesFormData>(emptyFormData);
  const [filterProgram, setFilterProgram] = useState<Program | 'ALL'>('ALL');
  const [showOrganic, setShowOrganic] = useState<boolean | 'ALL'>('ALL');

  const filteredBalances = state.milesBalances.filter(balance => {
    if (filterProgram !== 'ALL' && balance.program !== filterProgram) return false;
    if (showOrganic !== 'ALL' && balance.isOrganic !== showOrganic) return false;
    return true;
  });

  // Group by person for display
  const balancesByPerson = filteredBalances.reduce((acc, balance) => {
    const person = state.people.find(p => p.id === balance.personId);
    const personName = person?.name || 'Desconhecido';
    if (!acc[personName]) acc[personName] = [];
    acc[personName].push(balance);
    return acc;
  }, {} as Record<string, MilesBalance[]>);

  const openAddModal = () => {
    setEditingBalance(null);
    setFormData(emptyFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (balance: MilesBalance) => {
    setEditingBalance(balance);
    setFormData({
      personId: balance.personId,
      program: balance.program,
      currentPoints: balance.currentPoints,
      estimatedValueBRL: balance.estimatedValueBRL,
      pendingPoints: balance.pendingPoints,
      isOrganic: balance.isOrganic,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBalance(null);
    setFormData(emptyFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBalance) {
      updateMilesBalance(editingBalance.id, formData);
    } else {
      addMilesBalance(formData);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este saldo de milhas?')) {
      deleteMilesBalance(id);
    }
  };

  const handlePointsChange = (points: number) => {
    const estimatedValue = (points / 1000) * defaultPricePerThousand[formData.program];
    setFormData({
      ...formData,
      currentPoints: points,
      estimatedValueBRL: Math.round(estimatedValue * 100) / 100,
    });
  };

  const handleProgramChange = (program: Program) => {
    const estimatedValue = (formData.currentPoints / 1000) * defaultPricePerThousand[program];
    setFormData({
      ...formData,
      program,
      estimatedValueBRL: Math.round(estimatedValue * 100) / 100,
    });
  };

  const totalPoints = filteredBalances.reduce((sum, b) => sum + b.currentPoints, 0);
  const totalValue = filteredBalances.reduce((sum, b) => sum + b.estimatedValueBRL, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-100">Milhas</h1>
          <p className="text-slate-400 mt-1">Acompanhe os saldos de pontos e milhas</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Adicionar Saldo
        </button>
      </div>

      {/* Filters & Summary */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <select
              value={filterProgram}
              onChange={(e) => setFilterProgram(e.target.value as Program | 'ALL')}
              className="input w-auto"
            >
              <option value="ALL">Todos Programas</option>
              {programs.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select
              value={showOrganic === 'ALL' ? 'ALL' : showOrganic ? 'true' : 'false'}
              onChange={(e) => setShowOrganic(
                e.target.value === 'ALL' ? 'ALL' : e.target.value === 'true'
              )}
              className="input w-auto"
            >
              <option value="ALL">Todos os Tipos</option>
              <option value="false">Comprados</option>
              <option value="true">Orgânicos</option>
            </select>
          </div>
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-slate-400">Total Pontos:</span>{' '}
              <span className="font-semibold text-slate-200">{formatNumber(totalPoints)}</span>
            </div>
            <div>
              <span className="text-slate-400">Valor Estimado:</span>{' '}
              <span className="font-semibold text-primary-light">{formatBRL(totalValue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Balances List */}
      {Object.keys(balancesByPerson).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(balancesByPerson).map(([personName, balances]) => (
            <div key={personName} className="card overflow-hidden">
              <div className="px-6 py-4 bg-surface-lighter/50 border-b border-slate-700/50">
                <h3 className="font-semibold text-slate-200">{personName}</h3>
              </div>
              <div className="divide-y divide-slate-700/50">
                {balances.map((balance) => (
                  <div
                    key={balance.id}
                    className="flex items-center justify-between p-4 hover:bg-surface-lighter/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        balance.program === 'AZUL' ? 'bg-blue-500/20' :
                        balance.program === 'LATAM' ? 'bg-red-500/20' :
                        balance.program === 'SMILES' ? 'bg-orange-500/20' :
                        'bg-purple-500/20'
                      }`}>
                        {balance.isOrganic ? (
                          <SparklesIcon className={`w-5 h-5 ${
                            balance.program === 'AZUL' ? 'text-blue-400' :
                            balance.program === 'LATAM' ? 'text-red-400' :
                            balance.program === 'SMILES' ? 'text-orange-400' :
                            'text-purple-400'
                          }`} />
                        ) : (
                          <ChartBarIcon className={`w-5 h-5 ${
                            balance.program === 'AZUL' ? 'text-blue-400' :
                            balance.program === 'LATAM' ? 'text-red-400' :
                            balance.program === 'SMILES' ? 'text-orange-400' :
                            'text-purple-400'
                          }`} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`badge-${balance.program.toLowerCase()}`}>
                            {balance.program}
                          </span>
                          {balance.isOrganic && (
                            <span className="badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Orgânico
                            </span>
                          )}
                        </div>
                        <p className="text-lg font-semibold text-slate-200 mt-1">
                          {formatNumber(balance.currentPoints)} pontos
                        </p>
                        {balance.pendingPoints > 0 && (
                          <p className="text-xs text-slate-400">
                            +{formatNumber(balance.pendingPoints)} pendentes
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-semibold text-primary-light">
                          {formatBRL(balance.estimatedValueBRL)}
                        </p>
                        <p className="text-xs text-slate-400">valor estimado</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditModal(balance)}
                          className="p-2 rounded-lg hover:bg-surface-lighter text-slate-400 hover:text-slate-200"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(balance.id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <ChartBarIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">
            Nenhum saldo cadastrado
          </h3>
          <p className="text-slate-400 mb-6">
            {state.people.length === 0
              ? 'Cadastre uma pessoa primeiro para adicionar milhas'
              : 'Comece adicionando o saldo de milhas de uma pessoa'}
          </p>
          {state.people.length > 0 && (
            <button onClick={openAddModal} className="btn-primary">
              Adicionar Primeiro Saldo
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-light rounded-2xl border border-slate-700/50 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
              <h2 className="text-xl font-display font-semibold text-slate-100">
                {editingBalance ? 'Editar Saldo' : 'Novo Saldo de Milhas'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-surface-lighter text-slate-400"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Pessoa</label>
                <select
                  value={formData.personId}
                  onChange={(e) => setFormData({ ...formData, personId: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Selecione uma pessoa</option>
                  {state.people.map(person => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Programa</label>
                <select
                  value={formData.program}
                  onChange={(e) => handleProgramChange(e.target.value as Program)}
                  className="input"
                  required
                >
                  {programs.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Pontos Atuais</label>
                <input
                  type="number"
                  value={formData.currentPoints || ''}
                  onChange={(e) => handlePointsChange(Number(e.target.value))}
                  className="input"
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="label">Valor Estimado (R$)</label>
                <input
                  type="number"
                  value={formData.estimatedValueBRL || ''}
                  onChange={(e) => setFormData({ ...formData, estimatedValueBRL: Number(e.target.value) })}
                  className="input"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Calculado automaticamente com base no programa
                </p>
              </div>

              <div>
                <label className="label">Pontos Pendentes</label>
                <input
                  type="number"
                  value={formData.pendingPoints || ''}
                  onChange={(e) => setFormData({ ...formData, pendingPoints: Number(e.target.value) })}
                  className="input"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-lighter/50">
                <input
                  type="checkbox"
                  id="isOrganic"
                  checked={formData.isOrganic}
                  onChange={(e) => setFormData({ ...formData, isOrganic: e.target.checked })}
                  className="w-4 h-4 rounded bg-surface-lighter border-slate-600 text-primary focus:ring-primary"
                />
                <label htmlFor="isOrganic" className="text-sm text-slate-300">
                  <span className="font-medium">Acúmulo Orgânico</span>
                  <span className="block text-xs text-slate-400">
                    Pontos acumulados por gastos em cartões
                  </span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-700/50">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingBalance ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};




