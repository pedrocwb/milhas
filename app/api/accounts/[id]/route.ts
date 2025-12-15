import { NextRequest, NextResponse } from 'next/server'
import { authService, accountsService } from '@/lib/services'
import { z } from 'zod'

const updateAccountSchema = z.object({
  name: z.string().min(2).optional(),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).optional(),
  birth_date: z.string().optional(),
  notes: z.string().optional(),
})

// GET /api/accounts/[id] - Get single account
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await authService.getUserId()
    const { id } = await params
    const account = await accountsService.getAccountById(userId, id)

    return NextResponse.json({ data: account })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch account' },
      { status: error.message === 'Not authenticated' ? 401 : 404 }
    )
  }
}

// PATCH /api/accounts/[id] - Update account
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await authService.getUserId()
    const { id } = await params
    const body = await request.json()

    const validation = updateAccountSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const account = await accountsService.updateAccount(userId, id, body)

    return NextResponse.json({ data: account })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update account' },
      { status: error.message === 'Not authenticated' ? 401 : 500 }
    )
  }
}

// DELETE /api/accounts/[id] - Delete account
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await authService.getUserId()
    const { id } = await params
    await accountsService.deleteAccount(userId, id)

    return NextResponse.json({ success: true }, { status: 204 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete account' },
      { status: error.message === 'Not authenticated' ? 401 : 500 }
    )
  }
}

