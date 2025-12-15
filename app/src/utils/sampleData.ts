import type { AppState } from '../types';
import { generateId } from './storage';

export const createSampleData = (): AppState => {
  const now = new Date().toISOString();
  
  // Sample people based on the PDF
  const people = [
    { id: generateId(), name: 'VINICIUS', cpf: '000.000.000-01', birthDate: '1990-01-15', credentials: [
      { program: 'SMILES' as const, login: 'vinicius@email.com', password: '***' },
      { program: 'LIVELO' as const, login: 'vinicius@email.com', password: '***' },
      { program: 'AZUL' as const, login: 'vinicius@email.com', password: '***' },
      { program: 'LATAM' as const, login: 'vinicius@email.com', password: '***', rescueCode: '1234' },
    ], createdAt: now, updatedAt: now },
    { id: generateId(), name: 'VANILDO', cpf: '000.000.000-02', birthDate: '1985-06-20', credentials: [
      { program: 'SMILES' as const, login: 'vanildo@email.com', password: '***' },
      { program: 'AZUL' as const, login: 'vanildo@email.com', password: '***' },
      { program: 'LATAM' as const, login: 'vanildo@email.com', password: '***', rescueCode: '5678' },
    ], createdAt: now, updatedAt: now },
    { id: generateId(), name: 'AMANDA', cpf: '000.000.000-03', birthDate: '1992-03-10', credentials: [
      { program: 'SMILES' as const, login: 'amanda@email.com', password: '***' },
      { program: 'LATAM' as const, login: 'amanda@email.com', password: '***', rescueCode: '9012' },
      { program: 'AZUL' as const, login: 'amanda@email.com', password: '***' },
    ], createdAt: now, updatedAt: now },
    { id: generateId(), name: 'ROBERTO', cpf: '000.000.000-04', birthDate: '1988-11-05', credentials: [
      { program: 'AZUL' as const, login: 'roberto@email.com', password: '***' },
      { program: 'SMILES' as const, login: 'roberto@email.com', password: '***' },
      { program: 'LATAM' as const, login: 'roberto@email.com', password: '***', rescueCode: '3456' },
    ], createdAt: now, updatedAt: now },
    { id: generateId(), name: 'ANA CAROLINE', cpf: '000.000.000-05', birthDate: '1995-08-25', credentials: [
      { program: 'SMILES' as const, login: 'ana@email.com', password: '***' },
      { program: 'AZUL' as const, login: 'ana@email.com', password: '***' },
      { program: 'LATAM' as const, login: 'ana@email.com', password: '***', rescueCode: '7890' },
    ], createdAt: now, updatedAt: now },
    { id: generateId(), name: 'FABIANE', cpf: '000.000.000-06', birthDate: '1991-12-30', credentials: [
      { program: 'SMILES' as const, login: 'fabiane@email.com', password: '***' },
      { program: 'AZUL' as const, login: 'fabiane@email.com', password: '***' },
      { program: 'LATAM' as const, login: 'fabiane@email.com', password: '***', rescueCode: '2345' },
    ], createdAt: now, updatedAt: now },
  ];

  // Miles balances based on PDF data
  const milesBalances = [
    // VINICIUS
    { id: generateId(), personId: people[0].id, program: 'SMILES' as const, currentPoints: 143000, estimatedValueBRL: 3146, pendingPoints: 0, isOrganic: false, updatedAt: now },
    { id: generateId(), personId: people[0].id, program: 'LIVELO' as const, currentPoints: 58800, estimatedValueBRL: 2401, pendingPoints: 0, isOrganic: false, updatedAt: now },
    { id: generateId(), personId: people[0].id, program: 'SMILES' as const, currentPoints: 54000, estimatedValueBRL: 1188, pendingPoints: 0, isOrganic: true, updatedAt: now },
    
    // VANILDO
    { id: generateId(), personId: people[1].id, program: 'SMILES' as const, currentPoints: 223600, estimatedValueBRL: 4884, pendingPoints: 60000, isOrganic: false, updatedAt: now },
    { id: generateId(), personId: people[1].id, program: 'SMILES' as const, currentPoints: 77000, estimatedValueBRL: 1694, pendingPoints: 0, isOrganic: true, updatedAt: now },
    
    // AMANDA
    { id: generateId(), personId: people[2].id, program: 'LATAM' as const, currentPoints: 49000, estimatedValueBRL: 1176, pendingPoints: 0, isOrganic: false, updatedAt: now },
    { id: generateId(), personId: people[2].id, program: 'SMILES' as const, currentPoints: 200000, estimatedValueBRL: 4400, pendingPoints: 0, isOrganic: false, updatedAt: now },
    
    // ROBERTO
    { id: generateId(), personId: people[3].id, program: 'AZUL' as const, currentPoints: 15850, estimatedValueBRL: 375, pendingPoints: 12000, isOrganic: false, updatedAt: now },
    { id: generateId(), personId: people[3].id, program: 'SMILES' as const, currentPoints: 200000, estimatedValueBRL: 4400, pendingPoints: 0, isOrganic: false, updatedAt: now },
    
    // ANA CAROLINE
    { id: generateId(), personId: people[4].id, program: 'SMILES' as const, currentPoints: 200000, estimatedValueBRL: 4400, pendingPoints: 0, isOrganic: false, updatedAt: now },
    
    // FABIANE
    { id: generateId(), personId: people[5].id, program: 'SMILES' as const, currentPoints: 200000, estimatedValueBRL: 4400, pendingPoints: 0, isOrganic: false, updatedAt: now },
  ];

  // Beneficiaries based on PDF data
  const beneficiaries = [
    // VINICIUS
    { id: generateId(), personId: people[0].id, company: 'AZUL' as const, usedSlots: 3, remainingSlots: 2, totalSlots: 5, status: 'INATIVO' as const, updatedAt: now },
    { id: generateId(), personId: people[0].id, company: 'LATAM' as const, usedSlots: 21, remainingSlots: 4, totalSlots: 25, status: 'INATIVO' as const, updatedAt: now },
    { id: generateId(), personId: people[0].id, company: 'SMILES' as const, usedSlots: 18, remainingSlots: 7, totalSlots: 25, status: 'ATIVO' as const, updatedAt: now },
    
    // VANILDO
    { id: generateId(), personId: people[1].id, company: 'AZUL' as const, usedSlots: 1, remainingSlots: 4, totalSlots: 5, status: 'INATIVO' as const, updatedAt: now },
    { id: generateId(), personId: people[1].id, company: 'LATAM' as const, usedSlots: 11, remainingSlots: 14, totalSlots: 25, status: 'ATIVO' as const, updatedAt: now },
    { id: generateId(), personId: people[1].id, company: 'SMILES' as const, usedSlots: 0, remainingSlots: 25, totalSlots: 25, status: 'ATIVO' as const, updatedAt: now },
    
    // AMANDA
    { id: generateId(), personId: people[2].id, company: 'AZUL' as const, usedSlots: 0, remainingSlots: 5, totalSlots: 5, status: 'INATIVO' as const, updatedAt: now },
    { id: generateId(), personId: people[2].id, company: 'LATAM' as const, usedSlots: 21, remainingSlots: 4, totalSlots: 25, status: 'INATIVO' as const, updatedAt: now },
    
    // ROBERTO
    { id: generateId(), personId: people[3].id, company: 'LATAM' as const, usedSlots: 0, remainingSlots: 25, totalSlots: 25, status: 'ATIVO' as const, updatedAt: now },
    
    // ANA CAROLINE
    { id: generateId(), personId: people[4].id, company: 'AZUL' as const, usedSlots: 4, remainingSlots: 1, totalSlots: 5, status: 'INATIVO' as const, updatedAt: now },
    { id: generateId(), personId: people[4].id, company: 'LATAM' as const, usedSlots: 22, remainingSlots: 3, totalSlots: 25, status: 'INATIVO' as const, updatedAt: now },
    
    // FABIANE
    { id: generateId(), personId: people[5].id, company: 'AZUL' as const, usedSlots: 1, remainingSlots: 4, totalSlots: 5, status: 'INATIVO' as const, updatedAt: now },
    { id: generateId(), personId: people[5].id, company: 'LATAM' as const, usedSlots: 8, remainingSlots: 17, totalSlots: 25, status: 'ATIVO' as const, updatedAt: now },
  ];

  // Sales based on PDF data
  const sales = [
    { id: generateId(), personId: people[0].id, program: 'SMILES' as const, saleDate: '2021-04-02', receiveDate: '2021-04-02', quantity: 16560, usedQuantity: 16560, pricePerThousand: 22, totalValue: 364.32, status: 'COMPLETED' as const, createdAt: now },
    { id: generateId(), personId: people[0].id, program: 'SMILES' as const, saleDate: '2021-04-02', receiveDate: '2021-05-03', quantity: 16560, usedQuantity: 16560, pricePerThousand: 22, totalValue: 364.32, status: 'COMPLETED' as const, createdAt: now },
    { id: generateId(), personId: people[0].id, program: 'LATAM' as const, saleDate: '2021-04-02', receiveDate: '2021-03-22', quantity: 200000, usedQuantity: 199600, pricePerThousand: 24, totalValue: 4800, status: 'PARTIAL' as const, createdAt: now },
    { id: generateId(), personId: people[4].id, program: 'SMILES' as const, saleDate: '2021-04-02', receiveDate: '2021-03-22', quantity: 215900, usedQuantity: 215900, pricePerThousand: 22, totalValue: 4749.8, status: 'COMPLETED' as const, createdAt: now },
    { id: generateId(), personId: people[5].id, program: 'SMILES' as const, saleDate: '2021-04-02', receiveDate: '2021-03-22', quantity: 200000, usedQuantity: 199800, pricePerThousand: 22, totalValue: 4400, status: 'PARTIAL' as const, createdAt: now },
    { id: generateId(), personId: people[1].id, program: 'LATAM' as const, saleDate: '2021-04-02', receiveDate: '2021-03-22', quantity: 161000, usedQuantity: 161000, pricePerThousand: 24, totalValue: 3864, status: 'COMPLETED' as const, createdAt: now },
    { id: generateId(), personId: people[2].id, program: 'LATAM' as const, saleDate: '2021-04-02', receiveDate: '2021-03-22', quantity: 57000, usedQuantity: 56570, pricePerThousand: 24, totalValue: 1368, status: 'PARTIAL' as const, createdAt: now },
    { id: generateId(), personId: people[2].id, program: 'SMILES' as const, saleDate: '2021-03-09', receiveDate: '2021-04-11', quantity: 10000, usedQuantity: 9300, pricePerThousand: 22, totalValue: 220, status: 'PARTIAL' as const, createdAt: now },
    { id: generateId(), personId: people[3].id, program: 'AZUL' as const, saleDate: '2021-03-01', receiveDate: '2021-04-15', quantity: 10000, usedQuantity: 10000, pricePerThousand: 25, totalValue: 250, status: 'COMPLETED' as const, createdAt: now },
  ];

  return {
    people,
    milesBalances,
    beneficiaries,
    sales,
    creditCards: [],
  };
};




