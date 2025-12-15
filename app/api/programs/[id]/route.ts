import { NextRequest, NextResponse } from 'next/server'
import { authService, programsService } from '@/lib/services'
import { z } from 'zod'

const updateProgramSchema = z.object({
  account_number: z.string().optional(),
  current_balance: z.number().min(0).optional(),
})

const adjustBalanceSchema = z.object({
  adjustment: z.number().refine((val) => val !== 0, 'Adjustment cannot be zero'),
  notes: z.string().optional(),
})

// GET /api/programs/[id] - Get single program
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await authService.getUserId()
    const { id } = await params
    const program = await programsService.getProgramById(userId, id)

    return NextResponse.json({ data: program })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch program' },
      { status: error.message === 'Not authenticated' ? 401 : 404 }
    )
  }
}

// PATCH /api/programs/[id] - Update program
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await authService.getUserId()
    const { id } = await params
    const body = await request.json()

    const validation = updateProgramSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const program = await programsService.updateProgram(userId, id, body)

    return NextResponse.json({ data: program })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update program' },
      { status: error.message === 'Not authenticated' ? 401 : 500 }
    )
  }
}

// DELETE /api/programs/[id] - Delete program
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await authService.getUserId()
    const { id } = await params
    await programsService.deleteProgram(userId, id)

    return NextResponse.json({ success: true }, { status: 204 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete program' },
      { status: error.message === 'Not authenticated' ? 401 : 500 }
    )
  }
}

// POST /api/programs/[id]/adjust - Adjust balance
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await authService.getUserId()
    const { id } = await params
    const body = await request.json()

    const validation = adjustBalanceSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    await programsService.adjustBalance(userId, id, validation.data)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to adjust balance' },
      { status: error.message === 'Not authenticated' ? 401 : 500 }
    )
  }
}

