import type { AppState, Person, MilesBalance, Beneficiary, Sale, CreditCard } from '../types';

const STORAGE_KEY = 'milhas_app_data';

// Get initial empty state
const getInitialState = (): AppState => ({
  people: [],
  milesBalances: [],
  beneficiaries: [],
  sales: [],
  creditCards: [],
});

// Load all data from localStorage
export const loadData = (): AppState => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
  }
  return getInitialState();
};

// Save all data to localStorage
export const saveData = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving data to localStorage:', error);
  }
};

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Format currency to BRL
export const formatBRL = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Format number with thousand separators
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR').format(value);
};

// Format date to Brazilian format
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

// Parse Brazilian date string to ISO
export const parseBRDate = (dateString: string): string => {
  const [day, month, year] = dateString.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

// CRUD Operations for People
export const addPerson = (state: AppState, person: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>): AppState => {
  const newPerson: Person = {
    ...person,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const newState = { ...state, people: [...state.people, newPerson] };
  saveData(newState);
  return newState;
};

export const updatePerson = (state: AppState, id: string, updates: Partial<Person>): AppState => {
  const newState = {
    ...state,
    people: state.people.map(p =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    ),
  };
  saveData(newState);
  return newState;
};

export const deletePerson = (state: AppState, id: string): AppState => {
  const newState = {
    ...state,
    people: state.people.filter(p => p.id !== id),
    milesBalances: state.milesBalances.filter(m => m.personId !== id),
    beneficiaries: state.beneficiaries.filter(b => b.personId !== id),
    sales: state.sales.filter(s => s.personId !== id),
    creditCards: state.creditCards.filter(c => c.personId !== id),
  };
  saveData(newState);
  return newState;
};

// CRUD Operations for Miles Balances
export const addMilesBalance = (state: AppState, balance: Omit<MilesBalance, 'id' | 'updatedAt'>): AppState => {
  const newBalance: MilesBalance = {
    ...balance,
    id: generateId(),
    updatedAt: new Date().toISOString(),
  };
  const newState = { ...state, milesBalances: [...state.milesBalances, newBalance] };
  saveData(newState);
  return newState;
};

export const updateMilesBalance = (state: AppState, id: string, updates: Partial<MilesBalance>): AppState => {
  const newState = {
    ...state,
    milesBalances: state.milesBalances.map(m =>
      m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
    ),
  };
  saveData(newState);
  return newState;
};

export const deleteMilesBalance = (state: AppState, id: string): AppState => {
  const newState = {
    ...state,
    milesBalances: state.milesBalances.filter(m => m.id !== id),
  };
  saveData(newState);
  return newState;
};

// CRUD Operations for Beneficiaries
export const addBeneficiary = (state: AppState, beneficiary: Omit<Beneficiary, 'id' | 'updatedAt'>): AppState => {
  const newBeneficiary: Beneficiary = {
    ...beneficiary,
    id: generateId(),
    updatedAt: new Date().toISOString(),
  };
  const newState = { ...state, beneficiaries: [...state.beneficiaries, newBeneficiary] };
  saveData(newState);
  return newState;
};

export const updateBeneficiary = (state: AppState, id: string, updates: Partial<Beneficiary>): AppState => {
  const newState = {
    ...state,
    beneficiaries: state.beneficiaries.map(b =>
      b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
    ),
  };
  saveData(newState);
  return newState;
};

export const deleteBeneficiary = (state: AppState, id: string): AppState => {
  const newState = {
    ...state,
    beneficiaries: state.beneficiaries.filter(b => b.id !== id),
  };
  saveData(newState);
  return newState;
};

// CRUD Operations for Sales
export const addSale = (state: AppState, sale: Omit<Sale, 'id' | 'createdAt'>): AppState => {
  const newSale: Sale = {
    ...sale,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  const newState = { ...state, sales: [...state.sales, newSale] };
  saveData(newState);
  return newState;
};

export const updateSale = (state: AppState, id: string, updates: Partial<Sale>): AppState => {
  const newState = {
    ...state,
    sales: state.sales.map(s =>
      s.id === id ? { ...s, ...updates } : s
    ),
  };
  saveData(newState);
  return newState;
};

export const deleteSale = (state: AppState, id: string): AppState => {
  const newState = {
    ...state,
    sales: state.sales.filter(s => s.id !== id),
  };
  saveData(newState);
  return newState;
};

// CRUD Operations for Credit Cards
export const addCreditCard = (state: AppState, card: Omit<CreditCard, 'id'>): AppState => {
  const newCard: CreditCard = {
    ...card,
    id: generateId(),
  };
  const newState = { ...state, creditCards: [...state.creditCards, newCard] };
  saveData(newState);
  return newState;
};

export const updateCreditCard = (state: AppState, id: string, updates: Partial<CreditCard>): AppState => {
  const newState = {
    ...state,
    creditCards: state.creditCards.map(c =>
      c.id === id ? { ...c, ...updates } : c
    ),
  };
  saveData(newState);
  return newState;
};

export const deleteCreditCard = (state: AppState, id: string): AppState => {
  const newState = {
    ...state,
    creditCards: state.creditCards.filter(c => c.id !== id),
  };
  saveData(newState);
  return newState;
};

// Calculate dashboard summary
export const calculateDashboardSummary = (state: AppState): {
  totalPointsValue: number;
  totalOrganicValue: number;
  totalPoints: number;
  pointsByProgram: { program: string; points: number; value: number }[];
  activeBeneficiaries: number;
  pendingSales: number;
} => {
  const regularBalances = state.milesBalances.filter(m => !m.isOrganic);
  const organicBalances = state.milesBalances.filter(m => m.isOrganic);

  const totalPointsValue = regularBalances.reduce((sum, m) => sum + m.estimatedValueBRL, 0);
  const totalOrganicValue = organicBalances.reduce((sum, m) => sum + m.estimatedValueBRL, 0);
  const totalPoints = state.milesBalances.reduce((sum, m) => sum + m.currentPoints, 0);

  const programGroups = state.milesBalances.reduce((acc, m) => {
    if (!acc[m.program]) {
      acc[m.program] = { points: 0, value: 0 };
    }
    acc[m.program].points += m.currentPoints;
    acc[m.program].value += m.estimatedValueBRL;
    return acc;
  }, {} as Record<string, { points: number; value: number }>);

  const pointsByProgram = Object.entries(programGroups).map(([program, data]) => ({
    program,
    points: data.points,
    value: data.value,
  }));

  const activeBeneficiaries = state.beneficiaries.filter(b => b.status === 'ATIVO').length;
  const pendingSales = state.sales.filter(s => s.status === 'PENDING').length;

  return {
    totalPointsValue,
    totalOrganicValue,
    totalPoints,
    pointsByProgram,
    activeBeneficiaries,
    pendingSales,
  };
};




