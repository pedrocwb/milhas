import { NextRequest, NextResponse } from 'next/server'
import { authService, programsService } from '@/lib/services'
import { z } from 'zod'

const createProgramSchema = z.object({
  managed_account_id: z.string().uuid(),
  program_type: z.enum(['LATAM', 'AZUL', 'SMILES', 'LIVELO', 'KM_PARCEIROS', 'OTHER']),
  account_number: z.string().optional(),
  current_balance: z.number().min(0).default(0),
})

// GET /api/programs - List all programs
export async function GET(request: NextRequest) {
  try {
    const userId = await authService.getUserId()
    const programs = await programsService.getPrograms(userId)

    return NextResponse.json({ data: programs })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch programs' },
      { status: error.message === 'Not authenticated' ? 401 : 500 }
    )
  }
}

// POST /api/programs - Create new program
export async function POST(request: NextRequest) {
  try {
    const userId = await authService.getUserId()
    const body = await request.json()

    const validation = createProgramSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const program = await programsService.createProgram(userId, validation.data)

    return NextResponse.json({ data: program }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create program' },
      { status: error.message === 'Not authenticated' ? 401 : 500 }
    )
  }
}

