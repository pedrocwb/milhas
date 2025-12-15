import { createClient } from '@/lib/supabase/server'

export interface CreateSaleDto {
  loyalty_program_id: string
  beneficiary_id?: string | null
  amount_miles: number
  price_per_thousand: number
  total_price_brl: number
  sale_channel: 'HOTMILHAS' | 'MAXMILHAS' | 'DIRECT' | 'OTHER'
  sale_date: string
  expected_payment_date?: string | null
  actual_payment_date?: string | null
  amount_paid?: number | null
  customer_name?: string | null
  notes?: string | null
}

export interface UpdateSaleDto {
  amount_miles?: number
  price_per_thousand?: number
  total_price_brl?: number
  sale_channel?: 'HOTMILHAS' | 'MAXMILHAS' | 'DIRECT' | 'OTHER'
  sale_date?: string
  expected_payment_date?: string | null
  actual_payment_date?: string | null
  amount_paid?: number | null
  customer_name?: string | null
  notes?: string | null
}

export class SalesService {
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

  async createSale(userId: string, data: CreateSaleDto) {
    const supabase = await this.getSupabaseClient()
    const organizationId = await this.getOrganizationId(userId)

    if (!organizationId) {
      throw new Error('Organization not found')
    }

    // Create sale
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({
        organization_id: organizationId,
        loyalty_program_id: data.loyalty_program_id,
        beneficiary_id: data.beneficiary_id || null,
        amount_miles: data.amount_miles,
        price_per_thousand: data.price_per_thousand,
        total_price_brl: data.total_price_brl,
        sale_channel: data.sale_channel,
        sale_date: data.sale_date,
        expected_payment_date: data.expected_payment_date || null,
        actual_payment_date: data.actual_payment_date || null,
        amount_paid: data.amount_paid || null,
        customer_name: data.customer_name || null,
        notes: data.notes || null,
      })
      .select()
      .single()

    if (saleError) {
      throw new Error(`Failed to create sale: ${saleError.message}`)
    }

    // Create miles transaction (will trigger balance update - negative amount)
    const { error: transactionError } = await supabase
      .from('miles_transactions')
      .insert({
        organization_id: organizationId,
        loyalty_program_id: data.loyalty_program_id,
        transaction_type: 'SALE',
        amount: -data.amount_miles, // Negative because it's leaving inventory
        price_brl: data.total_price_brl,
        transaction_date: data.sale_date,
        sale_id: sale.id,
        notes: data.notes || 'Venda de milhas',
      })

    if (transactionError) {
      // Rollback sale if transaction fails
      await supabase.from('sales').delete().eq('id', sale.id)
      throw new Error(`Failed to create transaction: ${transactionError.message}`)
    }

    return sale
  }

  async updateSale(userId: string, saleId: string, data: UpdateSaleDto) {
    const supabase = await this.getSupabaseClient()
    const organizationId = await this.getOrganizationId(userId)

    if (!organizationId) {
      throw new Error('Organization not found')
    }

    const { data: sale, error } = await supabase
      .from('sales')
      .update({
        amount_miles: data.amount_miles,
        price_per_thousand: data.price_per_thousand,
        total_price_brl: data.total_price_brl,
        sale_channel: data.sale_channel,
        sale_date: data.sale_date,
        expected_payment_date: data.expected_payment_date,
        actual_payment_date: data.actual_payment_date,
        amount_paid: data.amount_paid,
        customer_name: data.customer_name,
        notes: data.notes,
      })
      .eq('id', saleId)
      .eq('organization_id', organizationId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update sale: ${error.message}`)
    }

    // Update the transaction amount if changed
    if (data.amount_miles !== undefined) {
      await supabase
        .from('miles_transactions')
        .update({
          amount: -data.amount_miles, // Negative
          price_brl: data.total_price_brl,
          transaction_date: data.sale_date,
        })
        .eq('sale_id', saleId)
    }

    return sale
  }

  async deleteSale(userId: string, saleId: string) {
    const supabase = await this.getSupabaseClient()
    const organizationId = await this.getOrganizationId(userId)

    if (!organizationId) {
      throw new Error('Organization not found')
    }

    // Delete transaction first (will trigger balance update)
    await supabase
      .from('miles_transactions')
      .delete()
      .eq('sale_id', saleId)

    // Delete sale
    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', saleId)
      .eq('organization_id', organizationId)

    if (error) {
      throw new Error(`Failed to delete sale: ${error.message}`)
    }

    return { success: true }
  }

  async getSales(userId: string) {
    const supabase = await this.getSupabaseClient()
    const organizationId = await this.getOrganizationId(userId)

    if (!organizationId) {
      return []
    }

    const { data: sales } = await supabase
      .from('sales')
      .select(`
        *,
        loyalty_programs (
          program_type,
          managed_accounts (
            name
          )
        )
      `)
      .eq('organization_id', organizationId)
      .order('sale_date', { ascending: false })

    return sales || []
  }

  async getSaleById(userId: string, saleId: string) {
    const supabase = await this.getSupabaseClient()
    const organizationId = await this.getOrganizationId(userId)

    if (!organizationId) {
      throw new Error('Organization not found')
    }

    const { data: sale, error } = await supabase
      .from('sales')
      .select(`
        *,
        loyalty_programs (
          program_type,
          managed_accounts (
            name
          )
        )
      `)
      .eq('id', saleId)
      .eq('organization_id', organizationId)
      .single()

    if (error) {
      throw new Error(`Sale not found: ${error.message}`)
    }

    return sale
  }
}

export const salesService = new SalesService()

