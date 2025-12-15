'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCPF } from '@/lib/utils'
import { DeleteConfirmDialog } from './delete-confirm-dialog'
import { deleteManagedAccount } from '../actions'
import { User, Calendar, FileText } from 'lucide-react'

interface Account {
  id: string
  name: string
  cpf: string
  birth_date: string | null
  notes: string | null
  programs_count: number
  total_miles: number
}

interface AccountsListProps {
  accounts: Account[]
}

export function AccountsList({ accounts }: AccountsListProps) {
  if (accounts.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contas Gerenciadas</CardTitle>
        <CardDescription>
          CPFs cadastrados no sistema ({accounts.length} {accounts.length === 1 ? 'conta' : 'contas'})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{account.name}</h4>
                    <p className="text-sm text-muted-foreground">{account.cpf}</p>
                  </div>
                </div>
                <DeleteConfirmDialog
                  title="Excluir Conta"
                  description={`Tem certeza que deseja excluir a conta de ${account.name}? Todos os programas vinculados também serão excluídos.`}
                  onConfirm={() => deleteManagedAccount(account.id)}
                />
              </div>
              
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {account.programs_count} {account.programs_count === 1 ? 'programa' : 'programas'}
                </Badge>
                <Badge variant="outline">
                  {account.total_miles.toLocaleString('pt-BR')} milhas
                </Badge>
              </div>

              {(account.birth_date || account.notes) && (
                <div className="mt-3 pt-3 border-t text-xs text-muted-foreground space-y-1">
                  {account.birth_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(account.birth_date).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                  {account.notes && (
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {account.notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

