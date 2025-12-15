import { createClient } from '@/lib/supabase/server'

export interface CreateCardDto {
  name: string
  last_four_digits?: string | null
  bank_name?: string | null
  is_active: boolean
}

export class CardsService {
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

  async createCard(userId: string, data: CreateCardDto) {
    const supabase = await this.getSupabaseClient()
    const organizationId = await this.getOrganizationId(userId)

    if (!organizationId) {
      throw new Error('Organization not found')
    }

    const { data: card, error } = await supabase
      .from('credit_cards')
      .insert({
        organization_id: organizationId,
        name: data.name,
        last_four_digits: data.last_four_digits || null,
        bank_name: data.bank_name || null,
        is_active: data.is_active,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create card: ${error.message}`)
    }

    return card
  }

  async getCards(userId: string) {
    const supabase = await this.getSupabaseClient()
    const organizationId = await this.getOrganizationId(userId)

    if (!organizationId) {
      return []
    }

    const { data: cards } = await supabase
      .from('credit_cards')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('name')

    return cards || []
  }
}

export const cardsService = new CardsService()

