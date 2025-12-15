// Loyalty Programs
export type Program = 'AZUL' | 'LATAM' | 'SMILES' | 'LIVELO';

// Beneficiary status
export type BeneficiaryStatus = 'ATIVO' | 'INATIVO';

// Person - Someone who has miles accounts
export interface Person {
  id: string;
  name: string;
  cpf: string;
  birthDate: string;
  credentials: ProgramCredentials[];
  createdAt: string;
  updatedAt: string;
}

// Credentials for each loyalty program
export interface ProgramCredentials {
  program: Program;
  login: string;
  password: string;
  rescueCode?: string; // For LATAM
}

// Miles/Points balance per program
export interface MilesBalance {
  id: string;
  personId: string;
  program: Program;
  currentPoints: number;
  estimatedValueBRL: number;
  pendingPoints: number;
  isOrganic: boolean; // From card spending vs purchased
  updatedAt: string;
}

// Beneficiary - Tracking usage limits per airline
export interface Beneficiary {
  id: string;
  personId: string;
  company: Program;
  usedSlots: number;
  remainingSlots: number;
  totalSlots: number;
  status: BeneficiaryStatus;
  updatedAt: string;
}

// Sale - Miles sold to third parties
export interface Sale {
  id: string;
  personId: string;
  program: Program;
  saleDate: string;
  receiveDate: string;
  quantity: number;
  usedQuantity: number;
  pricePerThousand: number;
  totalValue: number;
  status: 'PENDING' | 'COMPLETED' | 'PARTIAL';
  notes?: string;
  createdAt: string;
}

// Credit Card for organic accumulation
export interface CreditCard {
  id: string;
  personId: string;
  bank: string;
  lastDigits: string;
  program: Program;
  pointsPerReal: number;
  isActive: boolean;
}

// Dashboard summary data
export interface DashboardSummary {
  totalPointsValue: number;
  totalOrganicValue: number;
  totalProfit: number;
  pointsByProgram: {
    program: Program;
    points: number;
    value: number;
  }[];
  activeBeneficiaries: number;
  pendingSales: number;
  recentSales: Sale[];
}

// App state
export interface AppState {
  people: Person[];
  milesBalances: MilesBalance[];
  beneficiaries: Beneficiary[];
  sales: Sale[];
  creditCards: CreditCard[];
}




