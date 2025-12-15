import { createClient } from '@/lib/supabase/server'

export interface CreatePurchaseDto {
  managed_account_id: string
  loyalty_program_id: string
  credit_card_id?: string | null
  amount_miles: number
  total_cost_brl: number
  cost_per_thousand: number
  installments: number
  installment_amount?: number | null
  purchase_date: string
  first_due_date?: string | null
  notes?: string | null
}

export interface UpdatePurchaseDto {
  amount_miles?: number
  total_cost_brl?: number
  cost_per_thousand?: number
  installments?: number
  installment_amount?: number | null
  purchase_date?: string
  first_due_date?: string | null
  notes?: string | null
}

export class PurchasesService {
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

  async createPurchase(userId: string, data: CreatePurchaseDto) {
    const supabase = await this.getSupabaseClient()
    const organizationId = await this.getOrganizationId(userId)

    if (!organizationId) {
      throw new Error('Organization not found')
    }

    // Create purchase
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        organization_id: organizationId,
        managed_account_id: data.managed_account_id,
        loyalty_program_id: data.loyalty_program_id,
        credit_card_id: data.credit_card_id || null,
        amount_miles: data.amount_miles,
        total_cost_brl: data.total_cost_brl,
        cost_per_thousand: data.cost_per_thousand,
        installments: data.installments,
        installment_amount: data.installment_amount || null,
        purchase_date: data.purchase_date,
        first_due_date: data.first_due_date || null,
        notes: data.notes || null,
      })
      .select()
      .single()

    if (purchaseError) {
      throw new Error(`Failed to create purchase: ${purchaseError.message}`)
    }

    // Create miles transaction (will trigger balance update)
    const { error: transactionError } = await supabase
      .from('miles_transactions')
      .insert({
        organization_id: organizationId,
        loyalty_program_id: data.loyalty_program_id,
        transaction_type: 'PURCHASE',
        amount: data.amount_miles,
        cost_brl: data.total_cost_brl,
        transaction_date: data.purchase_date,
        purchase_id: purchase.id,
        notes: data.notes || 'Compra de milhas',
      })

    if (transactionError) {
      // Rollback purchase if transaction fails
      await supabase.from('purchases').delete().eq('id', purchase.id)
      throw new Error(`Failed to create transaction: ${transactionError.message}`)
    }

    return purchase
  }

  async updatePurchase(userId: string, purchaseId: string, data: UpdatePurchaseDto) {
    const supabase = await this.getSupabaseClient()
    const organizationId = await this.getOrganizationId(userId)

    if (!organizationId) {
      throw new Error('Organization not found')
    }

    const { data: purchase, error } = await supabase
      .from('purchases')
      .update({
        amount_miles: data.amount_miles,
        total_cost_brl: data.total_cost_brl,
        cost_per_thousand: data.cost_per_thousand,
        installments: data.installments,
        installment_amount: data.installment_amount,
        purchase_date: data.purchase_date,
        first_due_date: data.first_due_date,
        notes: data.notes,
      })
      .eq('id', purchaseId)
      .eq('organization_id', organizationId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update purchase: ${error.message}`)
    }

    // Update the transaction amount if changed
    if (data.amount_miles !== undefined) {
      await supabase
        .from('miles_transactions')
        .update({
          amount: data.amount_miles,
          cost_brl: data.total_cost_brl,
          transaction_date: data.purchase_date,
        })
        .eq('purchase_id', purchaseId)
    }

    return purchase
  }

  async deletePurchase(userId: string, purchaseId: string) {
    const supabase = await this.getSupabaseClient()
    const organizationId = await this.getOrganizationId(userId)

    if (!organizationId) {
      throw new Error('Organization not found')
    }

    // Delete transaction first (will trigger balance update)
    await supabase
      .from('miles_transactions')
      .delete()
      .eq('purchase_id', purchaseId)

    // Delete purchase
    const { error } = await supabase
      .from('purchases')
      .delete()
      .eq('id', purchaseId)
      .eq('organization_id', organizationId)

    if (error) {
      throw new Error(`Failed to delete purchase: ${error.message}`)
    }

    return { success: true }
  }

  async getPurchases(userId: string) {
    const supabase = await this.getSupabaseClient()
    const organizationId = await this.getOrganizationId(userId)

    if (!organizationId) {
      return []
    }

    const { data: purchases } = await supabase
      .from('purchases')
      .select(`
        *,
        managed_accounts (
          name
        ),
        loyalty_programs (
          program_type
        ),
        credit_cards (
          name
        )
      `)
      .eq('organization_id', organizationId)
      .order('purchase_date', { ascending: false })

    return purchases || []
  }

  async getPurchaseById(userId: string, purchaseId: string) {
    const supabase = await this.getSupabaseClient()
    const organizationId = await this.getOrganizationId(userId)

    if (!organizationId) {
      throw new Error('Organization not found')
    }

    const { data: purchase, error } = await supabase
      .from('purchases')
      .select(`
        *,
        managed_accounts (
          name
        ),
        loyalty_programs (
          program_type
        ),
        credit_cards (
          name
        )
      `)
      .eq('id', purchaseId)
      .eq('organization_id', organizationId)
      .single()

    if (error) {
      throw new Error(`Purchase not found: ${error.message}`)
    }

    return purchase
  }
}

export const purchasesService = new PurchasesService()

