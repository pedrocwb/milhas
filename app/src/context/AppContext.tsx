import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AppState, Person, MilesBalance, Beneficiary, Sale } from '../types';
import * as storage from '../utils/storage';

interface AppContextType {
  state: AppState;
  // People
  addPerson: (person: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePerson: (id: string, updates: Partial<Person>) => void;
  deletePerson: (id: string) => void;
  // Miles
  addMilesBalance: (balance: Omit<MilesBalance, 'id' | 'updatedAt'>) => void;
  updateMilesBalance: (id: string, updates: Partial<MilesBalance>) => void;
  deleteMilesBalance: (id: string) => void;
  // Beneficiaries
  addBeneficiary: (beneficiary: Omit<Beneficiary, 'id' | 'updatedAt'>) => void;
  updateBeneficiary: (id: string, updates: Partial<Beneficiary>) => void;
  deleteBeneficiary: (id: string) => void;
  // Sales
  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => void;
  updateSale: (id: string, updates: Partial<Sale>) => void;
  deleteSale: (id: string) => void;
  // Utils
  getPersonById: (id: string) => Person | undefined;
  getDashboardSummary: () => ReturnType<typeof storage.calculateDashboardSummary>;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(() => storage.loadData());

  // Save to localStorage whenever state changes
  useEffect(() => {
    storage.saveData(state);
  }, [state]);

  const value: AppContextType = {
    state,
    
    // People operations
    addPerson: (person) => {
      setState(prev => storage.addPerson(prev, person));
    },
    updatePerson: (id, updates) => {
      setState(prev => storage.updatePerson(prev, id, updates));
    },
    deletePerson: (id) => {
      setState(prev => storage.deletePerson(prev, id));
    },

    // Miles operations
    addMilesBalance: (balance) => {
      setState(prev => storage.addMilesBalance(prev, balance));
    },
    updateMilesBalance: (id, updates) => {
      setState(prev => storage.updateMilesBalance(prev, id, updates));
    },
    deleteMilesBalance: (id) => {
      setState(prev => storage.deleteMilesBalance(prev, id));
    },

    // Beneficiaries operations
    addBeneficiary: (beneficiary) => {
      setState(prev => storage.addBeneficiary(prev, beneficiary));
    },
    updateBeneficiary: (id, updates) => {
      setState(prev => storage.updateBeneficiary(prev, id, updates));
    },
    deleteBeneficiary: (id) => {
      setState(prev => storage.deleteBeneficiary(prev, id));
    },

    // Sales operations
    addSale: (sale) => {
      setState(prev => storage.addSale(prev, sale));
    },
    updateSale: (id, updates) => {
      setState(prev => storage.updateSale(prev, id, updates));
    },
    deleteSale: (id) => {
      setState(prev => storage.deleteSale(prev, id));
    },

    // Utility functions
    getPersonById: (id) => state.people.find(p => p.id === id),
    getDashboardSummary: () => storage.calculateDashboardSummary(state),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};




