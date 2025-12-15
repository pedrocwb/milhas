export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ProgramType = 'LATAM' | 'AZUL' | 'SMILES' | 'LIVELO' | 'KM_PARCEIROS' | 'OTHER'
export type TransactionType = 'PURCHASE' | 'SALE' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'EXPIRATION' | 'ADJUSTMENT'
export type BeneficiaryStatus = 'ACTIVE' | 'INACTIVE' | 'QUARANTINE'
export type SaleChannel = 'HOTMILHAS' | 'MAXMILHAS' | 'DIRECT' | 'OTHER'

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      managed_accounts: {
        Row: {
          id: string
          organization_id: string
          name: string
          cpf: string
          birth_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          cpf: string
          birth_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          cpf?: string
          birth_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      loyalty_programs: {
        Row: {
          id: string
          organization_id: string
          managed_account_id: string
          program_type: ProgramType
          account_number: string | null
          current_balance: number
          encrypted_credentials: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          managed_account_id: string
          program_type: ProgramType
          account_number?: string | null
          current_balance?: number
          encrypted_credentials?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          managed_account_id?: string
          program_type?: ProgramType
          account_number?: string | null
          current_balance?: number
          encrypted_credentials?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      miles_transactions: {
        Row: {
          id: string
          organization_id: string
          loyalty_program_id: string
          transaction_type: TransactionType
          amount: number
          cost_brl: number | null
          price_brl: number | null
          transaction_date: string
          due_date: string | null
          notes: string | null
          purchase_id: string | null
          sale_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          loyalty_program_id: string
          transaction_type: TransactionType
          amount: number
          cost_brl?: number | null
          price_brl?: number | null
          transaction_date?: string
          due_date?: string | null
          notes?: string | null
          purchase_id?: string | null
          sale_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          loyalty_program_id?: string
          transaction_type?: TransactionType
          amount?: number
          cost_brl?: number | null
          price_brl?: number | null
          transaction_date?: string
          due_date?: string | null
          notes?: string | null
          purchase_id?: string | null
          sale_id?: string | null
          created_at?: string
        }
      }
      beneficiaries: {
        Row: {
          id: string
          organization_id: string
          managed_account_id: string
          program_type: ProgramType
          name: string
          cpf: string | null
          total_slots: number
          used_slots: number
          status: BeneficiaryStatus
          quarantine_until: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          managed_account_id: string
          program_type: ProgramType
          name: string
          cpf?: string | null
          total_slots: number
          used_slots?: number
          status?: BeneficiaryStatus
          quarantine_until?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          managed_account_id?: string
          program_type?: ProgramType
          name?: string
          cpf?: string | null
          total_slots?: number
          used_slots?: number
          status?: BeneficiaryStatus
          quarantine_until?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      credit_cards: {
        Row: {
          id: string
          organization_id: string
          name: string
          last_four_digits: string | null
          bank_name: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          last_four_digits?: string | null
          bank_name?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          last_four_digits?: string | null
          bank_name?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      purchases: {
        Row: {
          id: string
          organization_id: string
          managed_account_id: string
          loyalty_program_id: string
          credit_card_id: string | null
          amount_miles: number
          total_cost_brl: number
          cost_per_thousand: number
          installments: number
          installment_amount: number | null
          purchase_date: string
          first_due_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          managed_account_id: string
          loyalty_program_id: string
          credit_card_id?: string | null
          amount_miles: number
          total_cost_brl: number
          cost_per_thousand: number
          installments?: number
          installment_amount?: number | null
          purchase_date?: string
          first_due_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          managed_account_id?: string
          loyalty_program_id?: string
          credit_card_id?: string | null
          amount_miles?: number
          total_cost_brl?: number
          cost_per_thousand?: number
          installments?: number
          installment_amount?: number | null
          purchase_date?: string
          first_due_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          organization_id: string
          loyalty_program_id: string
          beneficiary_id: string | null
          amount_miles: number
          price_per_thousand: number
          total_price_brl: number
          sale_channel: SaleChannel
          sale_date: string
          expected_payment_date: string | null
          actual_payment_date: string | null
          amount_paid: number | null
          customer_name: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          loyalty_program_id: string
          beneficiary_id?: string | null
          amount_miles: number
          price_per_thousand: number
          total_price_brl: number
          sale_channel: SaleChannel
          sale_date?: string
          expected_payment_date?: string | null
          actual_payment_date?: string | null
          amount_paid?: number | null
          customer_name?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          loyalty_program_id?: string
          beneficiary_id?: string | null
          amount_miles?: number
          price_per_thousand?: number
          total_price_brl?: number
          sale_channel?: SaleChannel
          sale_date?: string
          expected_payment_date?: string | null
          actual_payment_date?: string | null
          amount_paid?: number | null
          customer_name?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cash_flow_items: {
        Row: {
          id: string
          organization_id: string
          item_type: string
          category: string | null
          amount_brl: number
          due_date: string
          paid_date: string | null
          status: string
          related_purchase_id: string | null
          related_sale_id: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          item_type: string
          category?: string | null
          amount_brl: number
          due_date: string
          paid_date?: string | null
          status?: string
          related_purchase_id?: string | null
          related_sale_id?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          item_type?: string
          category?: string | null
          amount_brl?: number
          due_date?: string
          paid_date?: string | null
          status?: string
          related_purchase_id?: string | null
          related_sale_id?: string | null
          description?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      program_type: ProgramType
      transaction_type: TransactionType
      beneficiary_status: BeneficiaryStatus
      sale_channel: SaleChannel
    }
  }
}

