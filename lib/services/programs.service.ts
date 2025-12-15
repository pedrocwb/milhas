import { createClient } from '@/lib/supabase/server'

export interface CreateProgramDto {
  managed_account_id: string
  program_type: 'LATAM' | 'AZUL' | 'SMILES' | 'LIVELO' | 'KM_PARCEIROS' | 'OTHER'
  account_number?: string | null
  current_balance: number
}

export interface UpdateProgramDto {
  account_number?: string | null
  current_balance?: number
}

export interface AdjustBalanceDto {
  adjustment: number
  notes?: string
}

export class ProgramsService {
  private async getSupabaseClient() {
    return await createClient()
  }

  private async getOrganizationId(userId: string): Promise<string | null> {
    const supabase = await this.getSupabaseClient()
    
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('owner_id', userId)
      .single()

    return org?.id || null
  }

  async createProgram(userId: string, data: CreateProgramDto) {
    const supabase = await this.getSupabaseClient()
    const organizationId = await this.getOrganizationId(userId)

    if (!organizationId) {
      throw new Error('Organization not found')
    }

    const { data: program, error } = await supabase
      .from('loyalty_programs')
      .insert({
        organization_id: organizationId,
        managed_account_id: data.managed_account_id,
        program_type: data.program_type,
        account_number: data.account_number || null,
        current_balance: data.current_balance,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        throw new Error('Esta conta já possui este programa cadastrado')
      }
      throw new Error(`Failed to create program: ${error.message}`)
    }

    return program
  }

  async updateProgram(userId: string, programId: string, data: UpdateProgramDto) {
    const supabase = await this.getSupabaseClient()
    const organizationId = await this.getOrganizationId(userId)

    if (!organizationId) {
      throw new Error('Organization not found')
    }

    const { data: program, error } = await supabase
      .from('loyalty_programs')
      .update({
        account_number: data.account_number || null,
        current_balance: data.current_balance,
      })
      .eq('id', programId)
      .eq('organization_id', organizationId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update program: ${error.message}`)
    }

    return program
  }

  async deleteProgram(userId: string, programId: string) {
    const supabase = await this.getSupabaseClient()
    const organizationId = await this.getOrganizationId(userId)

    if (!organizationId) {
      throw new Error('Organization not found')
    }

    const { error } = await supabase
      .from('loyalty_programs')
      .delete()
      .eq('id', programId)
      .eq('organization_id', organizationId)

    if (error) {
      throw new Error(`Failed to delete program: ${error.message}`)
    }

    return { success: true }
  }

  async adjustBalance(userId: string, programId: string, data: AdjustBalanceDto) {
    const supabase = await this.getSupabaseClient()
    const organizationId = await this.getOrganizationId(userId)

    if (!organizationId) {
      throw new Error('Organization not found')
    }

    if (data.adjustment === 0) {
      throw new Error('Adjustment cannot be zero')
    }

    // Create a transaction record - the trigger will update the balance automatically
    const { error: transactionError } = await supabase
      .from('miles_transactions')
      .insert({
        organization_id: organizationId,
        loyalty_program_id: programId,
        transaction_type: 'ADJUSTMENT',
        amount: data.adjustment,
        notes: data.notes || 'Ajuste manual de saldo',
      })

    if (transactionError) {
      throw new Error(`Failed to adjust balance: ${transactionError.message}`)
    }

    return { success: true }
  }

  async getPrograms(userId: string) {
    const supabase = await this.getSupabaseClient()
    const organizationId = await this.getOrganizationId(userId)

    if (!organizationId) {
      return []
    }

    const { data: programs } = await supabase
      .from('loyalty_programs')
      .select(`
        *,
        managed_accounts (
          name,
          cpf
        )
      `)
      .eq('organization_id', organizationId)
      .order('program_type')

    return programs || []
  }

  // Alias for consistency
  async getLoyaltyPrograms(userId: string) {
    return this.getPrograms(userId)
  }

  async getProgramById(userId: string, programId: string) {
    const supabase = await this.getSupabaseClient()
    const organizationId = await this.getOrganizationId(userId)

    if (!organizationId) {
      throw new Error('Organization not found')
    }

    const { data: program, error } = await supabase
      .from('loyalty_programs')
      .select(`
        *,
        managed_accounts (
          name,
          cpf
        )
      `)
      .eq('id', programId)
      .eq('organization_id', organizationId)
      .single()

    if (error) {
      throw new Error(`Program not found: ${error.message}`)
    }

    return program
  }

  async getProgramTransactions(userId: string, programId: string, transactionType?: string) {
    const supabase = await this.getSupabaseClient()
    const organizationId = await this.getOrganizationId(userId)

    if (!organizationId) {
      return []
    }

    let query = supabase
      .from('miles_transactions')
      .select('*')
      .eq('loyalty_program_id', programId)
      .eq('organization_id', organizationId)

    if (transactionType) {
      query = query.eq('transaction_type', transactionType)
    }

    const { data: transactions } = await query.order('transaction_date', { ascending: false })

    return transactions || []
  }
}

export const programsService = new ProgramsService()

