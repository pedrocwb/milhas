import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/storage';
import type { Person, ProgramCredentials, Program } from '../types';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserCircleIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

const programs: Program[] = ['AZUL', 'LATAM', 'SMILES', 'LIVELO'];

interface PersonFormData {
  name: string;
  cpf: string;
  birthDate: string;
  credentials: ProgramCredentials[];
}

const emptyFormData: PersonFormData = {
  name: '',
  cpf: '',
  birthDate: '',
  credentials: [],
};

export const People = () => {
  const { state, addPerson, updatePerson, deletePerson } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [formData, setFormData] = useState<PersonFormData>(emptyFormData);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPeople = state.people.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.cpf.includes(searchTerm)
  );

  const openAddModal = () => {
    setEditingPerson(null);
    setFormData(emptyFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (person: Person) => {
    setEditingPerson(person);
    setFormData({
      name: person.name,
      cpf: person.cpf,
      birthDate: person.birthDate,
      credentials: person.credentials,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPerson(null);
    setFormData(emptyFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPerson) {
      updatePerson(editingPerson.id, formData);
    } else {
      addPerson(formData);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta pessoa? Todos os dados relacionados serão perdidos.')) {
      deletePerson(id);
    }
  };

  const addCredential = (program: Program) => {
    if (!formData.credentials.find(c => c.program === program)) {
      setFormData({
        ...formData,
        credentials: [...formData.credentials, { program, login: '', password: '' }],
      });
    }
  };

  const updateCredential = (program: Program, field: keyof ProgramCredentials, value: string) => {
    setFormData({
      ...formData,
      credentials: formData.credentials.map(c =>
        c.program === program ? { ...c, [field]: value } : c
      ),
    });
  };

  const removeCredential = (program: Program) => {
    setFormData({
      ...formData,
      credentials: formData.credentials.filter(c => c.program !== program),
    });
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11);
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-100">Pessoas</h1>
          <p className="text-slate-400 mt-1">Gerencie os cadastros e credenciais</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Adicionar Pessoa
        </button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <input
          type="text"
          placeholder="Buscar por nome ou CPF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input"
        />
      </div>

      {/* People List */}
      {filteredPeople.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPeople.map((person) => (
            <div key={person.id} className="card p-5 hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary-dark/20 flex items-center justify-center">
                    <UserCircleIcon className="w-7 h-7 text-primary-light" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-200">{person.name}</h3>
                    <p className="text-sm text-slate-400">{person.cpf}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(person)}
                    className="p-2 rounded-lg hover:bg-surface-lighter text-slate-400 hover:text-slate-200"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(person.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-slate-400">
                  <span className="text-slate-500">Nascimento:</span>{' '}
                  {person.birthDate ? formatDate(person.birthDate) : 'Não informado'}
                </p>
                
                {person.credentials.length > 0 && (
                  <div className="pt-2 border-t border-slate-700/50">
                    <p className="text-slate-500 text-xs mb-2">Programas:</p>
                    <div className="flex flex-wrap gap-1">
                      {person.credentials.map((cred) => (
                        <span
                          key={cred.program}
                          className={`badge-${cred.program.toLowerCase()}`}
                        >
                          {cred.program}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <UserCircleIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">
            {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhuma pessoa cadastrada'}
          </h3>
          <p className="text-slate-400 mb-6">
            {searchTerm
              ? 'Tente buscar com outros termos'
              : 'Comece adicionando uma pessoa ao sistema'}
          </p>
          {!searchTerm && (
            <button onClick={openAddModal} className="btn-primary">
              Adicionar Primeira Pessoa
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-light rounded-2xl border border-slate-700/50 w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
              <h2 className="text-xl font-display font-semibold text-slate-100">
                {editingPerson ? 'Editar Pessoa' : 'Nova Pessoa'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-surface-lighter text-slate-400"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Nome Completo</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    placeholder="João da Silva"
                    required
                  />
                </div>
                <div>
                  <label className="label">CPF</label>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                    className="input"
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Data de Nascimento</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              {/* Credentials */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="label mb-0">Credenciais dos Programas</label>
                  <div className="flex gap-1">
                    {programs.map((program) => (
                      <button
                        key={program}
                        type="button"
                        onClick={() => addCredential(program)}
                        disabled={formData.credentials.some(c => c.program === program)}
                        className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                          formData.credentials.some(c => c.program === program)
                            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            : 'bg-surface-lighter hover:bg-slate-600 text-slate-300'
                        }`}
                      >
                        + {program}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.credentials.length > 0 ? (
                  <div className="space-y-4">
                    {formData.credentials.map((cred) => (
                      <div
                        key={cred.program}
                        className="p-4 rounded-xl bg-surface-lighter/50 border border-slate-700/50"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className={`badge-${cred.program.toLowerCase()}`}>
                            {cred.program}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeCredential(cred.program)}
                            className="text-slate-400 hover:text-red-400"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-slate-400">Login</label>
                            <input
                              type="text"
                              value={cred.login}
                              onChange={(e) => updateCredential(cred.program, 'login', e.target.value)}
                              className="input mt-1"
                              placeholder="CPF ou email"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-400">Senha</label>
                            <div className="relative mt-1">
                              <input
                                type={showPasswords[cred.program] ? 'text' : 'password'}
                                value={cred.password}
                                onChange={(e) => updateCredential(cred.program, 'password', e.target.value)}
                                className="input pr-10"
                                placeholder="••••••••"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPasswords({
                                  ...showPasswords,
                                  [cred.program]: !showPasswords[cred.program]
                                })}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                              >
                                {showPasswords[cred.program] ? (
                                  <EyeSlashIcon className="w-4 h-4" />
                                ) : (
                                  <EyeIcon className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                          {cred.program === 'LATAM' && (
                            <div className="sm:col-span-2">
                              <label className="text-xs text-slate-400">Código de Resgate</label>
                              <input
                                type="text"
                                value={cred.rescueCode || ''}
                                onChange={(e) => updateCredential(cred.program, 'rescueCode', e.target.value)}
                                className="input mt-1"
                                placeholder="Código para resgates"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4 bg-surface-lighter/30 rounded-xl">
                    Clique nos botões acima para adicionar credenciais
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-700/50">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingPerson ? 'Salvar Alterações' : 'Adicionar Pessoa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};




