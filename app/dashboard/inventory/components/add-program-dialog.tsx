'use client'

import { useState, useEffect } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Plane } from 'lucide-react'
import { createLoyaltyProgram, getManagedAccounts } from '../actions'

type ManagedAccount = {
  id: string
  name: string
  cpf: string
}

const PROGRAMS = [
  { value: 'LATAM', label: 'LATAM Pass', color: 'text-red-600' },
  { value: 'AZUL', label: 'TudoAzul', color: 'text-blue-600' },
  { value: 'SMILES', label: 'Smiles (GOL)', color: 'text-orange-500' },
  { value: 'LIVELO', label: 'Livelo', color: 'text-purple-600' },
  { value: 'KM_PARCEIROS', label: 'Km de Vantagens', color: 'text-green-600' },
  { value: 'OTHER', label: 'Outro', color: 'text-gray-600' },
]

export function AddProgramDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accounts, setAccounts] = useState<ManagedAccount[]>([])
  const [selectedAccount, setSelectedAccount] = useState('')
  const [selectedProgram, setSelectedProgram] = useState('')

  useEffect(() => {
    if (open) {
      getManagedAccounts().then(setAccounts)
    }
  }, [open])

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    // Add select values to formData
    formData.set('managed_account_id', selectedAccount)
    formData.set('program_type', selectedProgram)

    const result = await createLoyaltyProgram(formData)
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setOpen(false)
    setLoading(false)
    setSelectedAccount('')
    setSelectedProgram('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plane className="h-4 w-4 mr-2" />
          Novo Programa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Adicionar Programa de Fidelidade</DialogTitle>
            <DialogDescription>
              Vincule um programa de milhas a uma conta gerenciada.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Conta (Titular) *</Label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma conta" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      Nenhuma conta cadastrada
                    </div>
                  ) : (
                    accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} ({account.cpf})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {accounts.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Cadastre uma conta primeiro clicando em "Nova Conta"
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Programa *</Label>
              <Select value={selectedProgram} onValueChange={setSelectedProgram} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o programa" />
                </SelectTrigger>
                <SelectContent>
                  {PROGRAMS.map((program) => (
                    <SelectItem key={program.value} value={program.value}>
                      <span className={program.color}>{program.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="account_number">Número da Conta/Fidelidade</Label>
              <Input
                id="account_number"
                name="account_number"
                placeholder="Ex: 123456789"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="current_balance">Saldo Inicial (milhas)</Label>
              <Input
                id="current_balance"
                name="current_balance"
                type="number"
                min="0"
                placeholder="0"
                defaultValue="0"
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
            <Button 
              type="submit" 
              disabled={loading || !selectedAccount || !selectedProgram}
            >
              {loading ? 'Salvando...' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

