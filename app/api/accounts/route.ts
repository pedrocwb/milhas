import { NextRequest, NextResponse } from 'next/server'
import { authService, accountsService } from '@/lib/services'
import { z } from 'zod'

const createAccountSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido'),
  birth_date: z.string().optional(),
  notes: z.string().optional(),
})

// GET /api/accounts - List all accounts
export async function GET(request: NextRequest) {
  try {
    const userId = await authService.getUserId()
    const accounts = await accountsService.getAccounts(userId)

    return NextResponse.json({ data: accounts })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch accounts' },
      { status: error.message === 'Not authenticated' ? 401 : 500 }
    )
  }
}

// POST /api/accounts - Create new account
export async function POST(request: NextRequest) {
  try {
    const userId = await authService.getUserId()
    const body = await request.json()

    const validation = createAccountSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const account = await accountsService.createAccount(userId, validation.data)

    return NextResponse.json({ data: account }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create account' },
      { status: error.message === 'Not authenticated' ? 401 : 500 }
    )
  }
}

