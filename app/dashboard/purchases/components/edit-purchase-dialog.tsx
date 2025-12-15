'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updatePurchase } from '../actions'
import { useToast } from '@/hooks/use-toast'

interface Purchase {
  id: string
  amount_miles: number
  total_cost_brl: number
  cost_per_thousand: number
  installments: number
  installment_amount: number | null
  purchase_date: string
  first_due_date: string | null
  notes: string | null
}

interface EditPurchaseDialogProps {
  purchase: Purchase
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditPurchaseDialog({ purchase, open, onOpenChange }: EditPurchaseDialogProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const amountMiles = parseInt(formData.get('amount_miles') as string)
    const totalCost = parseFloat(formData.get('total_cost_brl') as string)
    const installments = parseInt(formData.get('installments') as string)

    const data = {
      amount_miles: amountMiles,
      total_cost_brl: totalCost,
      cost_per_thousand: (totalCost / amountMiles) * 1000,
      installments: installments,
      installment_amount: installments > 1 ? totalCost / installments : null,
      purchase_date: formData.get('purchase_date') as string,
      first_due_date: formData.get('first_due_date') as string || null,
      notes: formData.get('notes') as string || null,
    }

    const result = await updatePurchase(purchase.id, data)

    if (result.success) {
      toast({
        title: 'Compra atualizada',
        description: 'As informações foram atualizadas com sucesso.',
      })
      onOpenChange(false)
    } else {
      toast({
        title: 'Erro ao atualizar compra',
        description: result.error,
        variant: 'destructive',
      })
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Compra de Milhas</DialogTitle>
          <DialogDescription>
            Atualize as informações da compra. O estoque será recalculado automaticamente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            {/* Purchase Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount_miles">Quantidade de Milhas *</Label>
                <Input
                  id="amount_miles"
                  name="amount_miles"
                  type="number"
                  placeholder="Ex: 50000"
                  required
                  min="1"
                  defaultValue={purchase.amount_miles}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="total_cost_brl">Valor Total (R$) *</Label>
                <Input
                  id="total_cost_brl"
                  name="total_cost_brl"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 750.00"
                  required
                  min="0"
                  defaultValue={purchase.total_cost_brl}
                />
              </div>
            </div>

            {/* Installments */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="installments">Número de Parcelas *</Label>
                <Input
                  id="installments"
                  name="installments"
                  type="number"
                  placeholder="Ex: 3"
                  required
                  min="1"
                  defaultValue={purchase.installments}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="purchase_date">Data da Compra *</Label>
                <Input
                  id="purchase_date"
                  name="purchase_date"
                  type="date"
                  required
                  defaultValue={purchase.purchase_date}
                />
              </div>
            </div>

            {/* Due Date */}
            <div className="grid gap-2">
              <Label htmlFor="first_due_date">Data do Primeiro Vencimento (opcional)</Label>
              <Input
                id="first_due_date"
                name="first_due_date"
                type="date"
                defaultValue={purchase.first_due_date || ''}
              />
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Ex: Compra promocional, cashback 5%"
                rows={3}
                defaultValue={purchase.notes || ''}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

