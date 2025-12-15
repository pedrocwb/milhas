'use server'

import { revalidatePath } from 'next/cache'
import { purchasesService, CreatePurchaseDto, UpdatePurchaseDto } from '@/lib/services/purchases.service'
import { authService } from '@/lib/services'

export async function createPurchase(data: CreatePurchaseDto) {
  try {
    const userId = await authService.getUserId()
    await purchasesService.createPurchase(userId, data)
    
    revalidatePath('/dashboard/purchases')
    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error('Error creating purchase:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create purchase' 
    }
  }
}

export async function updatePurchase(purchaseId: string, data: UpdatePurchaseDto) {
  try {
    const userId = await authService.getUserId()
    await purchasesService.updatePurchase(userId, purchaseId, data)
    
    revalidatePath('/dashboard/purchases')
    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error('Error updating purchase:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update purchase' 
    }
  }
}

export async function deletePurchase(purchaseId: string) {
  try {
    const userId = await authService.getUserId()
    await purchasesService.deletePurchase(userId, purchaseId)
    
    revalidatePath('/dashboard/purchases')
    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting purchase:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete purchase' 
    }
  }
}

