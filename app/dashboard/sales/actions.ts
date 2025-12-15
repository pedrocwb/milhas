'use server'

import { revalidatePath } from 'next/cache'
import { salesService, CreateSaleDto, UpdateSaleDto } from '@/lib/services/sales.service'
import { authService } from '@/lib/services'

export async function createSale(data: CreateSaleDto) {
  try {
    const userId = await authService.getUserId()
    await salesService.createSale(userId, data)
    
    revalidatePath('/dashboard/sales')
    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error('Error creating sale:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create sale' 
    }
  }
}

export async function updateSale(saleId: string, data: UpdateSaleDto) {
  try {
    const userId = await authService.getUserId()
    await salesService.updateSale(userId, saleId, data)
    
    revalidatePath('/dashboard/sales')
    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error('Error updating sale:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update sale' 
    }
  }
}

export async function deleteSale(saleId: string) {
  try {
    const userId = await authService.getUserId()
    await salesService.deleteSale(userId, saleId)
    
    revalidatePath('/dashboard/sales')
    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting sale:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete sale' 
    }
  }
}

