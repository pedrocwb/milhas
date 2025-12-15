import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatBRL, formatNumber, formatDate } from '../utils/storage';
import type { Sale, Program } from '../types';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CurrencyDollarIcon,
  XMarkIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const programs: Program[] = ['AZUL', 'LATAM', 'SMILES', 'LIVELO'];

type SaleStatus = 'PENDING' | 'COMPLETED' | 'PARTIAL';

interface SaleFormData {
  personId: string;
  program: Program;
  saleDate: string;
  receiveDate: string;
  quantity: number;
  usedQuantity: number;
  pricePerThousand: number;
  notes: string;
}

const emptyFormData: SaleFormData = {
  personId: '',
  program: 'SMILES',
  saleDate: new Date().toISOString().split('T')[0],
  receiveDate: '',
  quantity: 0,
  usedQuantity: 0,
  pricePerThousand: 22,
  notes: '',
};

const defaultPrices: Record<Program, number> = {
  AZUL: 25,
  LATAM: 24,
  SMILES: 22,
  LIVELO: 40,
};

export const Sales = () => {
  const { state, addSale, updateSale, deleteSale } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [formData, setFormData] = useState<SaleFormData>(emptyFormData);
  const [filterProgram, setFilterProgram] = useState<Program | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<SaleStatus | 'ALL'>('ALL');

  const filteredSales = state.sales.filter(sale => {
    if (filterProgram !== 'ALL' && sale.program !== filterProgram) return false;
    if (filterStatus !== 'ALL' && sale.status !== filterStatus) return false;
    return true;
  });

  // Sort by date, most recent first
  const sortedSales = [...filteredSales].sort((a, b) => 
    new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()
  );

  const openAddModal = () => {
    setEditingSale(null);
    setFormData(emptyFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (sale: Sale) => {
    setEditingSale(sale);
    setFormData({
      personId: sale.personId,
      program: sale.program,
      saleDate: sale.saleDate,
      receiveDate: sale.receiveDate,
      quantity: sale.quantity,
      usedQuantity: sale.usedQuantity,
      pricePerThousand: sale.pricePerThousand,
      notes: sale.notes || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSale(null);
    setFormData(emptyFormData);
  };

  const calculateStatus = (quantity: number, usedQuantity: number): SaleStatus => {
    if (usedQuantity === 0) return 'PENDING';
    if (usedQuantity >= quantity) return 'COMPLETED';
    return 'PARTIAL';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalValue = (formData.quantity / 1000) * formData.pricePerThousand;
    const status = calculateStatus(formData.quantity, formData.usedQuantity);
    
    const saleData = {
      ...formData,
      totalValue,
      status,
    };

    if (editingSale) {
      updateSale(editingSale.id, saleData);
    } else {
      addSale(saleData);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta venda?')) {
      deleteSale(id);
    }
  };

  const handleProgramChange = (program: Program) => {
    setFormData({
      ...formData,
      program,
      pricePerThousand: defaultPrices[program],
    });
  };

  const totalSalesValue = sortedSales.reduce((sum, s) => sum + s.totalValue, 0);
  const totalMilesSold = sortedSales.reduce((sum, s) => sum + s.quantity, 0);
  const pendingCount = state.sales.filter(s => s.status === 'PENDING').length;
  const completedCount = state.sales.filter(s => s.status === 'COMPLETED').length;

  const StatusIcon = ({ status }: { status: SaleStatus }) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon className="w-4 h-4 text-emerald-400" />;
      case 'PARTIAL':
        return <ArrowPathIcon className="w-4 h-4 text-amber-400" />;
      default:
        return <ClockIcon className="w-4 h-4 text-slate-400" />;
    }
  };

  const statusLabel: Record<SaleStatus, string> = {
    PENDING: 'Pendente',
    PARTIAL: 'Parcial',
    COMPLETED: 'Completa',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-100">Vendas</h1>
          <p className="text-slate-400 mt-1">Acompanhe as vendas de milhas realizadas</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Nova Venda
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-sm text-slate-400">Total Vendido</p>
          <p className="text-2xl font-bold text-primary-light">{formatBRL(totalSalesValue)}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-slate-400">Milhas Vendidas</p>
          <p className="text-2xl font-bold text-slate-200">{formatNumber(totalMilesSold)}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-slate-400">Pendentes</p>
          <p className="text-2xl font-bold text-amber-400">{pendingCount}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-slate-400">Completas</p>
          <p className="text-2xl font-bold text-emerald-400">{completedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
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
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as SaleStatus | 'ALL')}
            className="input w-auto"
          >
            <option value="ALL">Todos Status</option>
            <option value="PENDING">Pendentes</option>
            <option value="PARTIAL">Parciais</option>
            <option value="COMPLETED">Completas</option>
          </select>
        </div>
      </div>

      {/* Sales List */}
      {sortedSales.length > 0 ? (
        <div className="card table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Pessoa</th>
                <th>Programa</th>
                <th>Data Venda</th>
                <th>Data Receber</th>
                <th>Quantidade</th>
                <th>Usadas</th>
                <th>Valor</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {sortedSales.map((sale) => {
                const person = state.people.find(p => p.id === sale.personId);
                const usagePercent = sale.quantity > 0 ? (sale.usedQuantity / sale.quantity) * 100 : 0;
                
                return (
                  <tr key={sale.id}>
                    <td>
                      <span className="font-medium text-slate-200">
                        {person?.name || 'Desconhecido'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-${sale.program.toLowerCase()}`}>
                        {sale.program}
                      </span>
                    </td>
                    <td className="text-slate-400">{formatDate(sale.saleDate)}</td>
                    <td className="text-slate-400">
                      {sale.receiveDate ? formatDate(sale.receiveDate) : '-'}
                    </td>
                    <td className="font-medium">{formatNumber(sale.quantity)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className={sale.usedQuantity > 0 ? 'text-slate-200' : 'text-slate-500'}>
                          {formatNumber(sale.usedQuantity)}
                        </span>
                        {sale.quantity > 0 && (
                          <div className="w-12 h-1.5 bg-surface-lighter rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                usagePercent >= 100 ? 'bg-emerald-500' :
                                usagePercent > 0 ? 'bg-amber-500' :
                                'bg-slate-600'
                              }`}
                              style={{ width: `${Math.min(usagePercent, 100)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="font-medium text-primary-light">
                      {formatBRL(sale.totalValue)}
                    </td>
                    <td>
                      <span className={`badge flex items-center gap-1 w-fit ${
                        sale.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        sale.status === 'PARTIAL' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                      }`}>
                        <StatusIcon status={sale.status} />
                        {statusLabel[sale.status]}
                      </span>
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEditModal(sale)}
                          className="p-2 rounded-lg hover:bg-surface-lighter text-slate-400 hover:text-slate-200"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(sale.id)}
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
          <CurrencyDollarIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">
            Nenhuma venda registrada
          </h3>
          <p className="text-slate-400 mb-6">
            {state.people.length === 0
              ? 'Cadastre uma pessoa primeiro'
              : 'Comece registrando uma venda de milhas'}
          </p>
          {state.people.length > 0 && (
            <button onClick={openAddModal} className="btn-primary">
              Registrar Primeira Venda
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-light rounded-2xl border border-slate-700/50 w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
              <h2 className="text-xl font-display font-semibold text-slate-100">
                {editingSale ? 'Editar Venda' : 'Nova Venda'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-surface-lighter text-slate-400"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Data da Venda</label>
                  <input
                    type="date"
                    value={formData.saleDate}
                    onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Data a Receber</label>
                  <input
                    type="date"
                    value={formData.receiveDate}
                    onChange={(e) => setFormData({ ...formData, receiveDate: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Quantidade de Milhas</label>
                  <input
                    type="number"
                    value={formData.quantity || ''}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="input"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="label">Milhas Usadas</label>
                  <input
                    type="number"
                    value={formData.usedQuantity || ''}
                    onChange={(e) => setFormData({ ...formData, usedQuantity: Number(e.target.value) })}
                    className="input"
                    placeholder="0"
                    min="0"
                    max={formData.quantity}
                  />
                </div>
              </div>

              <div>
                <label className="label">Preço por 1.000 milhas (R$)</label>
                <input
                  type="number"
                  value={formData.pricePerThousand || ''}
                  onChange={(e) => setFormData({ ...formData, pricePerThousand: Number(e.target.value) })}
                  className="input"
                  placeholder="22.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="p-4 rounded-xl bg-surface-lighter/50">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Valor Total</span>
                  <span className="text-xl font-bold text-primary-light">
                    {formatBRL((formData.quantity / 1000) * formData.pricePerThousand)}
                  </span>
                </div>
              </div>

              <div>
                <label className="label">Observações</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input min-h-[80px] resize-none"
                  placeholder="Anotações sobre a venda..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-700/50">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingSale ? 'Salvar' : 'Registrar Venda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};




