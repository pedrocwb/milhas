import { createClient } from '@/lib/supabase/server'

export class AuthService {
  private async getSupabaseClient() {
    return await createClient()
  }

  async getCurrentUser() {
    const supabase = await this.getSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      throw new Error('Not authenticated')
    }

    return user
  }

  async getUserId(): Promise<string> {
    const user = await this.getCurrentUser()
    return user.id
  }

  async ensureOrganization(userId: string) {
    const supabase = await this.getSupabaseClient()

    // Try to get existing organization
    let { data: org } = await supabase
      .from('organizations')
      .select('*')
      .eq('owner_id', userId)
      .single()

    // Create if doesn't exist
    if (!org) {
      const { data: newOrg, error } = await supabase
        .from('organizations')
        .insert({
          name: 'Minha Organização',
          owner_id: userId,
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create organization: ${error.message}`)
      }

      org = newOrg
    }

    return org
  }

  async getOrganization(userId: string) {
    const supabase = await this.getSupabaseClient()

    const { data: org, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('owner_id', userId)
      .single()

    if (error) {
      throw new Error('Organization not found')
    }

    return org
  }

  async getOrganizationId(userId: string): Promise<string | null> {
    const supabase = await this.getSupabaseClient()

    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('owner_id', userId)
      .single()

    return org?.id || null
  }
}

export const authService = new AuthService()

