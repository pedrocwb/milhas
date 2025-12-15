'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { authService, accountsService, programsService } from '@/lib/services'

// ============================================
// MANAGED ACCOUNTS ACTIONS
// ============================================

const managedAccountSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF deve estar no formato 000.000.000-00'),
  birth_date: z.string().optional(),
  notes: z.string().optional(),
})

export async function createManagedAccount(formData: FormData) {
  try {
    const userId = await authService.getUserId()

    const rawData = {
      name: formData.get('name') as string,
      cpf: formData.get('cpf') as string,
      birth_date: formData.get('birth_date') as string || undefined,
      notes: formData.get('notes') as string || undefined,
    }

    const validation = managedAccountSchema.safeParse(rawData)
    if (!validation.success) {
      return { error: validation.error.errors[0].message }
    }

    await accountsService.createAccount(userId, {
      name: rawData.name,
      cpf: rawData.cpf,
      birth_date: rawData.birth_date || null,
      notes: rawData.notes || null,
    })

    revalidatePath('/dashboard/inventory')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Erro ao criar conta' }
  }
}

export async function updateManagedAccount(id: string, formData: FormData) {
  try {
    const userId = await authService.getUserId()

    const rawData = {
      name: formData.get('name') as string,
      cpf: formData.get('cpf') as string,
      birth_date: formData.get('birth_date') as string || undefined,
      notes: formData.get('notes') as string || undefined,
    }

    const validation = managedAccountSchema.safeParse(rawData)
    if (!validation.success) {
      return { error: validation.error.errors[0].message }
    }

    await accountsService.updateAccount(userId, id, {
      name: rawData.name,
      cpf: rawData.cpf,
      birth_date: rawData.birth_date || null,
      notes: rawData.notes || null,
    })

    revalidatePath('/dashboard/inventory')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Erro ao atualizar conta' }
  }
}

export async function deleteManagedAccount(id: string) {
  try {
    const userId = await authService.getUserId()
    await accountsService.deleteAccount(userId, id)

    revalidatePath('/dashboard/inventory')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Erro ao excluir conta' }
  }
}

// ============================================
// LOYALTY PROGRAMS ACTIONS
// ============================================

const loyaltyProgramSchema = z.object({
  managed_account_id: z.string().uuid('Selecione uma conta'),
  program_type: z.enum(['LATAM', 'AZUL', 'SMILES', 'LIVELO', 'KM_PARCEIROS', 'OTHER']),
  account_number: z.string().optional(),
  current_balance: z.number().min(0, 'Saldo não pode ser negativo'),
})

export async function createLoyaltyProgram(formData: FormData) {
  try {
    const userId = await authService.getUserId()

    const rawData = {
      managed_account_id: formData.get('managed_account_id') as string,
      program_type: formData.get('program_type') as string,
      account_number: formData.get('account_number') as string || undefined,
      current_balance: parseInt(formData.get('current_balance') as string) || 0,
    }

    const validation = loyaltyProgramSchema.safeParse(rawData)
    if (!validation.success) {
      return { error: validation.error.errors[0].message }
    }

    await programsService.createProgram(userId, {
      managed_account_id: rawData.managed_account_id,
      program_type: rawData.program_type as any,
      account_number: rawData.account_number || null,
      current_balance: rawData.current_balance,
    })

    revalidatePath('/dashboard/inventory')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Erro ao criar programa' }
  }
}

export async function updateLoyaltyProgram(id: string, formData: FormData) {
  try {
    const userId = await authService.getUserId()

    const rawData = {
      account_number: formData.get('account_number') as string || undefined,
      current_balance: parseInt(formData.get('current_balance') as string) || 0,
    }

    await programsService.updateProgram(userId, id, {
      account_number: rawData.account_number || null,
      current_balance: rawData.current_balance,
    })

    revalidatePath('/dashboard/inventory')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Erro ao atualizar programa' }
  }
}

export async function deleteLoyaltyProgram(id: string) {
  try {
    const userId = await authService.getUserId()
    await programsService.deleteProgram(userId, id)

    revalidatePath('/dashboard/inventory')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Erro ao excluir programa' }
  }
}

export async function adjustBalance(programId: string, formData: FormData) {
  try {
    const userId = await authService.getUserId()

    const adjustment = parseInt(formData.get('adjustment') as string)
    const notes = formData.get('notes') as string

    if (isNaN(adjustment) || adjustment === 0) {
      return { error: 'Informe um valor de ajuste válido' }
    }

    await programsService.adjustBalance(userId, programId, {
      adjustment,
      notes: notes || undefined,
    })

    revalidatePath('/dashboard/inventory')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Erro ao ajustar saldo' }
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export async function getManagedAccounts() {
  try {
    const userId = await authService.getUserId()
    const accounts = await accountsService.getAccounts(userId)
    return accounts
  } catch (error) {
    return []
  }
}
