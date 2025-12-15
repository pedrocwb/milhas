import { createClient } from '@/lib/supabase/server'

export interface CreateAccountDto {
  name: string
  cpf: string
  birth_date?: string | null
  notes?: string | null
}

export interface UpdateAccountDto {
  name: string
  cpf: string
  birth_date?: string | null
  notes?: string | null
}

export class AccountsService {
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

  async createAccount(userId: string, data: CreateAccountDto) {
    const supabase = await this.getSupabaseClient()
    const organizationId = await this.getOrganizationId(userId)

    if (!organizationId) {
      throw new Error('Organization not found')
    }

    const { data: account, error } = await supabase
      .from('managed_accounts')
      .insert({
        organization_id: organizationId,
        name: data.name,
        cpf: data.cpf,
        birth_date: data.birth_date || null,
        notes: data.notes || null,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        throw new Error('Este CPF já está cadastrado')
      }
      throw new Error(`Failed to create account: ${error.message}`)
    }

    return account
  }

  async updateAccount(userId: string, accountId: string, data: UpdateAccountDto) {
    const supabase = await this.getSupabaseClient()
    const organizationId = await this.getOrganizationId(userId)

    if (!organizationId) {
      throw new Error('Organization not found')
    }

    const { data: account, error } = await supabase
      .from('managed_accounts')
      .update({
        name: data.name,
        cpf: data.cpf,
        birth_date: data.birth_date || null,
        notes: data.notes || null,
      })
      .eq('id', accountId)
      .eq('organization_id', organizationId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update account: ${error.message}`)
    }

    return account
  }

  async deleteAccount(userId: string, accountId: string) {
    const supabase = await this.getSupabaseClient()
    const organizationId = await this.getOrganizationId(userId)

    if (!organizationId) {
      throw new Error('Organization not found')
    }

    const { error } = await supabase
      .from('managed_accounts')
      .delete()
      .eq('id', accountId)
      .eq('organization_id', organizationId)

    if (error) {
      throw new Error(`Failed to delete account: ${error.message}`)
    }

    return { success: true }
  }

  async getAccounts(userId: string) {
    const supabase = await this.getSupabaseClient()
    const organizationId = await this.getOrganizationId(userId)

    if (!organizationId) {
      return []
    }

    const { data: accounts } = await supabase
      .from('managed_accounts')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name')

    return accounts || []
  }

  // Alias for consistency
  async getManagedAccounts(userId: string) {
    return this.getAccounts(userId)
  }

  async getAccountById(userId: string, accountId: string) {
    const supabase = await this.getSupabaseClient()
    const organizationId = await this.getOrganizationId(userId)

    if (!organizationId) {
      throw new Error('Organization not found')
    }

    const { data: account, error } = await supabase
      .from('managed_accounts')
      .select('*')
      .eq('id', accountId)
      .eq('organization_id', organizationId)
      .single()

    if (error) {
      throw new Error(`Account not found: ${error.message}`)
    }

    return account
  }
}

export const accountsService = new AccountsService()

