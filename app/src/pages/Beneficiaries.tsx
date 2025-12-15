import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Beneficiary, Program, BeneficiaryStatus } from '../types';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  TicketIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

const programs: Program[] = ['AZUL', 'LATAM', 'SMILES'];

interface BeneficiaryFormData {
  personId: string;
  company: Program;
  usedSlots: number;
  totalSlots: number;
  status: BeneficiaryStatus;
}

const emptyFormData: BeneficiaryFormData = {
  personId: '',
  company: 'LATAM',
  usedSlots: 0,
  totalSlots: 25,
  status: 'ATIVO',
};

const defaultSlots: Record<Program, number> = {
  AZUL: 5,
  LATAM: 25,
  SMILES: 25,
  LIVELO: 10,
};

export const Beneficiaries = () => {
  const { state, addBeneficiary, updateBeneficiary, deleteBeneficiary } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null);
  const [formData, setFormData] = useState<BeneficiaryFormData>(emptyFormData);
  const [filterCompany, setFilterCompany] = useState<Program | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<BeneficiaryStatus | 'ALL'>('ALL');

  const filteredBeneficiaries = state.beneficiaries.filter(b => {
    if (filterCompany !== 'ALL' && b.company !== filterCompany) return false;
    if (filterStatus !== 'ALL' && b.status !== filterStatus) return false;
    return true;
  });

  const openAddModal = () => {
    setEditingBeneficiary(null);
    setFormData(emptyFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (beneficiary: Beneficiary) => {
    setEditingBeneficiary(beneficiary);
    setFormData({
      personId: beneficiary.personId,
      company: beneficiary.company,
      usedSlots: beneficiary.usedSlots,
      totalSlots: beneficiary.totalSlots,
      status: beneficiary.status,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBeneficiary(null);
    setFormData(emptyFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      remainingSlots: formData.totalSlots - formData.usedSlots,
    };
    if (editingBeneficiary) {
      updateBeneficiary(editingBeneficiary.id, data);
    } else {
      addBeneficiary(data);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este beneficiário?')) {
      deleteBeneficiary(id);
    }
  };

  const handleCompanyChange = (company: Program) => {
    setFormData({
      ...formData,
      company,
      totalSlots: defaultSlots[company],
    });
  };

  const activeCount = state.beneficiaries.filter(b => b.status === 'ATIVO').length;
  const inactiveCount = state.beneficiaries.filter(b => b.status === 'INATIVO').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-100">Beneficiários</h1>
          <p className="text-slate-400 mt-1">Gerencie os slots de beneficiários por companhia</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Adicionar Beneficiário
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-sm text-slate-400">Total</p>
          <p className="text-2xl font-bold text-slate-200">{state.beneficiaries.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-slate-400">Ativos</p>
          <p className="text-2xl font-bold text-emerald-400">{activeCount}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-slate-400">Inativos</p>
          <p className="text-2xl font-bold text-slate-500">{inactiveCount}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-slate-400">Slots Disponíveis</p>
          <p className="text-2xl font-bold text-primary-light">
            {state.beneficiaries.reduce((sum, b) => sum + b.remainingSlots, 0)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-2">
          <select
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value as Program | 'ALL')}
            className="input w-auto"
          >
            <option value="ALL">Todas Companhias</option>
            {programs.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as BeneficiaryStatus | 'ALL')}
            className="input w-auto"
          >
            <option value="ALL">Todos Status</option>
            <option value="ATIVO">Ativos</option>
            <option value="INATIVO">Inativos</option>
          </select>
        </div>
      </div>

      {/* Beneficiaries Table */}
      {filteredBeneficiaries.length > 0 ? (
        <div className="card table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Pessoa</th>
                <th>Companhia</th>
                <th>Usados</th>
                <th>Restantes</th>
                <th>Total</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredBeneficiaries.map((beneficiary) => {
                const person = state.people.find(p => p.id === beneficiary.personId);
                const usagePercent = (beneficiary.usedSlots / beneficiary.totalSlots) * 100;
                
                return (
                  <tr key={beneficiary.id}>
                    <td>
                      <span className="font-medium text-slate-200">
                        {person?.name || 'Desconhecido'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-${beneficiary.company.toLowerCase()}`}>
                        {beneficiary.company}
                      </span>
                    </td>
                    <td>
                      <span className="font-medium">{beneficiary.usedSlots}</span>
                    </td>
                    <td>
                      <span className={`font-medium ${
                        beneficiary.remainingSlots <= 2 ? 'text-red-400' :
                        beneficiary.remainingSlots <= 5 ? 'text-amber-400' :
                        'text-emerald-400'
                      }`}>
                        {beneficiary.remainingSlots}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span>{beneficiary.totalSlots}</span>
                        <div className="w-16 h-1.5 bg-surface-lighter rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              usagePercent >= 90 ? 'bg-red-500' :
                              usagePercent >= 70 ? 'bg-amber-500' :
                              'bg-emerald-500'
                            }`}
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      {beneficiary.status === 'ATIVO' ? (
                        <span className="badge-ativo flex items-center gap-1 w-fit">
                          <CheckCircleIcon className="w-3.5 h-3.5" />
                          Ativo
                        </span>
                      ) : (
                        <span className="badge-inativo flex items-center gap-1 w-fit">
                          <XCircleIcon className="w-3.5 h-3.5" />
                          Inativo
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEditModal(beneficiary)}
                          className="p-2 rounded-lg hover:bg-surface-lighter text-slate-400 hover:text-slate-200"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(beneficiary.id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card p-12 text-center">
          <TicketIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">
            Nenhum beneficiário cadastrado
          </h3>
          <p className="text-slate-400 mb-6">
            {state.people.length === 0
              ? 'Cadastre uma pessoa primeiro'
              : 'Comece adicionando um beneficiário'}
          </p>
          {state.people.length > 0 && (
            <button onClick={openAddModal} className="btn-primary">
              Adicionar Primeiro Beneficiário
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
                {editingBeneficiary ? 'Editar Beneficiário' : 'Novo Beneficiário'}
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
                <label className="label">Companhia</label>
                <select
                  value={formData.company}
                  onChange={(e) => handleCompanyChange(e.target.value as Program)}
                  className="input"
                  required
                >
                  {programs.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Slots Usados</label>
                  <input
                    type="number"
                    value={formData.usedSlots}
                    onChange={(e) => setFormData({ ...formData, usedSlots: Number(e.target.value) })}
                    className="input"
                    min="0"
                    max={formData.totalSlots}
                    required
                  />
                </div>
                <div>
                  <label className="label">Total de Slots</label>
                  <input
                    type="number"
                    value={formData.totalSlots}
                    onChange={(e) => setFormData({ ...formData, totalSlots: Number(e.target.value) })}
                    className="input"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Restantes</label>
                <input
                  type="number"
                  value={formData.totalSlots - formData.usedSlots}
                  className="input bg-surface-lighter/50"
                  disabled
                />
              </div>

              <div>
                <label className="label">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as BeneficiaryStatus })}
                  className="input"
                  required
                >
                  <option value="ATIVO">Ativo</option>
                  <option value="INATIVO">Inativo</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-700/50">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingBeneficiary ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};




