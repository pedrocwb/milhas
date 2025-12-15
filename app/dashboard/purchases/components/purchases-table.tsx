'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'
import { EditPurchaseDialog } from './edit-purchase-dialog'
import { DeleteConfirmDialog } from './delete-confirm-dialog'
import { deletePurchase } from '../actions'
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
  managed_accounts: {
    name: string
  }
  loyalty_programs: {
    program_type: string
  }
  credit_cards?: {
    name: string
  } | null
}

interface PurchasesTableProps {
  purchases: Purchase[]
}

export function PurchasesTable({ purchases }: PurchasesTableProps) {
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()

  async function handleDelete(id: string) {
    const result = await deletePurchase(id)
    
    if (result.success) {
      toast({
        title: 'Compra excluída',
        description: 'A compra foi excluída com sucesso.',
      })
    } else {
      toast({
        title: 'Erro ao excluir compra',
        description: result.error,
        variant: 'destructive',
      })
    }
    
    setDeletingId(null)
  }

  if (purchases.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">Nenhuma compra registrada ainda.</p>
        <p className="text-sm mt-2">Clique em "Nova Compra" para registrar sua primeira compra de milhas.</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Conta</TableHead>
              <TableHead>Programa</TableHead>
              <TableHead className="text-right">Milhas</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
              <TableHead className="text-right">CPM</TableHead>
              <TableHead className="text-center">Parcelas</TableHead>
              <TableHead>Cartão</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell>
                  {new Date(purchase.purchase_date).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>{purchase.managed_accounts.name}</TableCell>
                <TableCell>{purchase.loyalty_programs.program_type}</TableCell>
                <TableCell className="text-right font-medium">
                  {purchase.amount_miles.toLocaleString('pt-BR')}
                </TableCell>
                <TableCell className="text-right">
                  {purchase.total_cost_brl.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </TableCell>
                <TableCell className="text-right">
                  {purchase.cost_per_thousand.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </TableCell>
                <TableCell className="text-center">
                  {purchase.installments}x
                  {purchase.installment_amount && (
                    <div className="text-xs text-muted-foreground">
                      {purchase.installment_amount.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {purchase.credit_cards?.name || '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingPurchase(purchase)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingId(purchase.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingPurchase && (
        <EditPurchaseDialog
          purchase={editingPurchase}
          open={!!editingPurchase}
          onOpenChange={(open) => !open && setEditingPurchase(null)}
        />
      )}

      {deletingId && (
        <DeleteConfirmDialog
          title="Excluir compra"
          description="Tem certeza que deseja excluir esta compra? O estoque será atualizado automaticamente. Esta ação não pode ser desfeita."
          open={!!deletingId}
          onOpenChange={(open) => !open && setDeletingId(null)}
          onConfirm={() => handleDelete(deletingId)}
        />
      )}
    </>
  )
}

