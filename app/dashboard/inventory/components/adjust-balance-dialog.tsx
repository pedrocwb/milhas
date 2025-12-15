'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Settings2 } from 'lucide-react'
import { adjustBalance } from '../actions'

interface AdjustBalanceDialogProps {
  programId: string
  programName: string
  currentBalance: number
}

export function AdjustBalanceDialog({ programId, programName, currentBalance }: AdjustBalanceDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('add')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const amount = parseInt(formData.get('amount') as string)
    const adjustment = adjustmentType === 'add' ? amount : -amount
    formData.set('adjustment', adjustment.toString())

    const result = await adjustBalance(programId, formData)
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setOpen(false)
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Settings2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Ajustar Saldo</DialogTitle>
            <DialogDescription>
              Ajuste manual do saldo de milhas para {programName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="bg-muted p-3 rounded-md text-center">
              <p className="text-sm text-muted-foreground">Saldo Atual</p>
              <p className="text-2xl font-bold">{currentBalance.toLocaleString('pt-BR')}</p>
            </div>
            
            <div className="grid gap-2">
              <Label>Tipo de Ajuste</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={adjustmentType === 'add' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setAdjustmentType('add')}
                >
                  + Adicionar
                </Button>
                <Button
                  type="button"
                  variant={adjustmentType === 'subtract' ? 'destructive' : 'outline'}
                  className="flex-1"
                  onClick={() => setAdjustmentType('subtract')}
                >
                  − Subtrair
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Quantidade de Milhas *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                min="1"
                placeholder="Ex: 10000"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Motivo do Ajuste</Label>
              <Input
                id="notes"
                name="notes"
                placeholder="Ex: Correção de saldo, bônus, etc."
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Confirmar Ajuste'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

