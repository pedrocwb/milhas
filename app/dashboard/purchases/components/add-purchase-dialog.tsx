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
import { createPurchase } from '../actions'
import { useToast } from '@/hooks/use-toast'

interface Account {
  id: string
  name: string
}

interface Program {
  id: string
  program_type: string
  managed_account_id: string
  managed_accounts: {
    name: string
  }
}

interface Card {
  id: string
  name: string
}

interface AddPurchaseDialogProps {
  accounts: Account[]
  programs: Program[]
  cards: Card[]
}

export function AddPurchaseDialog({ accounts, programs, cards }: AddPurchaseDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const { toast } = useToast()

  // Filter programs by selected account
  const filteredPrograms = selectedAccount
    ? programs.filter(p => p.managed_account_id === selectedAccount)
    : []

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const amountMiles = parseInt(formData.get('amount_miles') as string)
    const totalCost = parseFloat(formData.get('total_cost_brl') as string)
    const installments = parseInt(formData.get('installments') as string)

    const data = {
      managed_account_id: selectedAccount,
      loyalty_program_id: formData.get('loyalty_program_id') as string,
      credit_card_id: formData.get('credit_card_id') as string || null,
      amount_miles: amountMiles,
      total_cost_brl: totalCost,
      cost_per_thousand: (totalCost / amountMiles) * 1000,
      installments: installments,
      installment_amount: installments > 1 ? totalCost / installments : null,
      purchase_date: formData.get('purchase_date') as string,
      first_due_date: formData.get('first_due_date') as string || null,
      notes: formData.get('notes') as string || null,
    }

    const result = await createPurchase(data)

    if (result.success) {
      toast({
        title: 'Compra registrada',
        description: 'A compra foi registrada com sucesso.',
      })
      setOpen(false)
      setSelectedAccount('')
      event.currentTarget.reset()
    } else {
      toast({
        title: 'Erro ao registrar compra',
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
          Nova Compra
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Compra de Milhas</DialogTitle>
          <DialogDescription>
            Registre uma nova compra de milhas. O estoque será atualizado automaticamente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            {/* Account Selection */}
            <div className="grid gap-2">
              <Label htmlFor="account">Conta Gerenciada *</Label>
              <Select
                value={selectedAccount}
                onValueChange={setSelectedAccount}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a conta" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      Nenhuma conta cadastrada
                    </div>
                  ) : (
                    accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Program Selection */}
            <div className="grid gap-2">
              <Label htmlFor="loyalty_program_id">Programa de Fidelidade *</Label>
              <Select
                name="loyalty_program_id"
                required
                disabled={!selectedAccount}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !selectedAccount 
                      ? "Selecione primeiro uma conta" 
                      : "Selecione o programa"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {filteredPrograms.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      {selectedAccount 
                        ? "Nenhum programa cadastrado para esta conta" 
                        : "Selecione uma conta"}
                    </div>
                  ) : (
                    filteredPrograms.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.program_type}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Card Selection (optional) */}
            <div className="grid gap-2">
              <Label htmlFor="credit_card_id">Cartão de Crédito (opcional)</Label>
              <Select name="credit_card_id">
                <SelectTrigger>
                  <SelectValue placeholder="Nenhum (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {cards.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      Nenhum cartão cadastrado
                    </div>
                  ) : (
                    cards.map((card) => (
                      <SelectItem key={card.id} value={card.id}>
                        {card.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Deixe em branco se não usar cartão de crédito
              </p>
            </div>

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
                  defaultValue="1"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="purchase_date">Data da Compra *</Label>
                <Input
                  id="purchase_date"
                  name="purchase_date"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
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
              {loading ? 'Registrando...' : 'Registrar Compra'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

