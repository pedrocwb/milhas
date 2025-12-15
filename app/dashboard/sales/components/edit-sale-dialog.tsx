'use client'

import { useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { updateSale } from '../actions'
import { useToast } from '@/hooks/use-toast'

interface Sale {
  id: string
  amount_miles: number
  price_per_thousand: number
  total_price_brl: number
  sale_channel: 'HOTMILHAS' | 'MAXMILHAS' | 'DIRECT' | 'OTHER'
  sale_date: string
  expected_payment_date: string | null
  actual_payment_date: string | null
  amount_paid: number | null
  customer_name: string | null
  notes: string | null
}

interface EditSaleDialogProps {
  sale: Sale
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditSaleDialog({ sale, open, onOpenChange }: EditSaleDialogProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const amountMiles = parseInt(formData.get('amount_miles') as string)
    const totalPrice = parseFloat(formData.get('total_price_brl') as string)

    const data = {
      amount_miles: amountMiles,
      price_per_thousand: (totalPrice / amountMiles) * 1000,
      total_price_brl: totalPrice,
      sale_channel: formData.get('sale_channel') as 'HOTMILHAS' | 'MAXMILHAS' | 'DIRECT' | 'OTHER',
      sale_date: formData.get('sale_date') as string,
      expected_payment_date: formData.get('expected_payment_date') as string || null,
      actual_payment_date: formData.get('actual_payment_date') as string || null,
      amount_paid: formData.get('amount_paid') ? parseFloat(formData.get('amount_paid') as string) : null,
      customer_name: formData.get('customer_name') as string || null,
      notes: formData.get('notes') as string || null,
    }

    const result = await updateSale(sale.id, data)

    if (result.success) {
      toast({
        title: 'Venda atualizada',
        description: 'As informações foram atualizadas com sucesso.',
      })
      onOpenChange(false)
    } else {
      toast({
        title: 'Erro ao atualizar venda',
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
          <DialogTitle>Editar Venda de Milhas</DialogTitle>
          <DialogDescription>
            Atualize as informações da venda. O estoque será recalculado automaticamente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            {/* Sale Channel */}
            <div className="grid gap-2">
              <Label htmlFor="sale_channel">Canal de Venda *</Label>
              <Select name="sale_channel" required defaultValue={sale.sale_channel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOTMILHAS">HotMilhas</SelectItem>
                  <SelectItem value="MAXMILHAS">MaxMilhas</SelectItem>
                  <SelectItem value="DIRECT">Venda Direta</SelectItem>
                  <SelectItem value="OTHER">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sale Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount_miles">Quantidade de Milhas *</Label>
                <Input
                  id="amount_miles"
                  name="amount_miles"
                  type="number"
                  placeholder="Ex: 30000"
                  required
                  min="1"
                  defaultValue={sale.amount_miles}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="total_price_brl">Valor Total (R$) *</Label>
                <Input
                  id="total_price_brl"
                  name="total_price_brl"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 450.00"
                  required
                  min="0"
                  defaultValue={sale.total_price_brl}
                />
              </div>
            </div>

            {/* Customer */}
            <div className="grid gap-2">
              <Label htmlFor="customer_name">Nome do Cliente (opcional)</Label>
              <Input
                id="customer_name"
                name="customer_name"
                placeholder="Ex: João da Silva"
                defaultValue={sale.customer_name || ''}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="sale_date">Data da Venda *</Label>
                <Input
                  id="sale_date"
                  name="sale_date"
                  type="date"
                  required
                  defaultValue={sale.sale_date}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="expected_payment_date">Recebimento Previsto</Label>
                <Input
                  id="expected_payment_date"
                  name="expected_payment_date"
                  type="date"
                  defaultValue={sale.expected_payment_date || ''}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="actual_payment_date">Recebimento Real</Label>
                <Input
                  id="actual_payment_date"
                  name="actual_payment_date"
                  type="date"
                  defaultValue={sale.actual_payment_date || ''}
                />
              </div>
            </div>

            {/* Payment */}
            <div className="grid gap-2">
              <Label htmlFor="amount_paid">Valor Recebido (R$) (opcional)</Label>
              <Input
                id="amount_paid"
                name="amount_paid"
                type="number"
                step="0.01"
                placeholder="Deixe em branco se ainda não recebeu"
                defaultValue={sale.amount_paid || ''}
              />
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Ex: Cliente preferencial, emissão em 48h"
                rows={3}
                defaultValue={sale.notes || ''}
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

