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
  DialogTrigger,
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
import { Plus } from 'lucide-react'
import { createSale } from '../actions'
import { useToast } from '@/hooks/use-toast'

interface Program {
  id: string
  program_type: string
  current_balance: number
  managed_accounts: {
    name: string
  }
}

interface Beneficiary {
  id: string
  name: string
  loyalty_program_id: string
}

interface AddSaleDialogProps {
  programs: Program[]
  beneficiaries: Beneficiary[]
}

export function AddSaleDialog({ programs, beneficiaries }: AddSaleDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState<string>('')
  const { toast } = useToast()

  // Filter beneficiaries by selected program
  const filteredBeneficiaries = selectedProgram
    ? beneficiaries.filter(b => b.loyalty_program_id === selectedProgram)
    : []

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const amountMiles = parseInt(formData.get('amount_miles') as string)
    const totalPrice = parseFloat(formData.get('total_price_brl') as string)

    const data = {
      loyalty_program_id: selectedProgram,
      beneficiary_id: formData.get('beneficiary_id') as string || null,
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

    const result = await createSale(data)

    if (result.success) {
      toast({
        title: 'Venda registrada',
        description: 'A venda foi registrada com sucesso.',
      })
      setOpen(false)
      setSelectedProgram('')
      event.currentTarget.reset()
    } else {
      toast({
        title: 'Erro ao registrar venda',
        description: result.error,
        variant: 'destructive',
      })
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Venda
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Venda de Milhas</DialogTitle>
          <DialogDescription>
            Registre uma nova venda de milhas. O estoque será atualizado automaticamente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            {/* Program Selection */}
            <div className="grid gap-2">
              <Label htmlFor="loyalty_program_id">Programa de Fidelidade *</Label>
              <Select
                value={selectedProgram}
                onValueChange={setSelectedProgram}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o programa" />
                </SelectTrigger>
                <SelectContent>
                  {programs.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      Nenhum programa cadastrado
                    </div>
                  ) : (
                    programs.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.program_type} - {program.managed_accounts.name} ({program.current_balance.toLocaleString('pt-BR')} milhas)
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Beneficiary Selection (optional) */}
            <div className="grid gap-2">
              <Label htmlFor="beneficiary_id">Beneficiário Usado (opcional)</Label>
              <Select
                name="beneficiary_id"
                disabled={!selectedProgram}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !selectedProgram 
                      ? "Selecione primeiro um programa" 
                      : "Nenhum (opcional)"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {!selectedProgram ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      Selecione um programa primeiro
                    </div>
                  ) : filteredBeneficiaries.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      Nenhum beneficiário cadastrado
                    </div>
                  ) : (
                    filteredBeneficiaries.map((beneficiary) => (
                      <SelectItem key={beneficiary.id} value={beneficiary.id}>
                        {beneficiary.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Deixe em branco se não usar beneficiário
              </p>
            </div>

            {/* Sale Channel */}
            <div className="grid gap-2">
              <Label htmlFor="sale_channel">Canal de Venda *</Label>
              <Select name="sale_channel" required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o canal" />
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
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="expected_payment_date">Recebimento Previsto</Label>
                <Input
                  id="expected_payment_date"
                  name="expected_payment_date"
                  type="date"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="actual_payment_date">Recebimento Real</Label>
                <Input
                  id="actual_payment_date"
                  name="actual_payment_date"
                  type="date"
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
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar Venda'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

