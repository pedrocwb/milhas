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
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2 } from 'lucide-react'
import { EditSaleDialog } from './edit-sale-dialog'
import { DeleteConfirmDialog } from './delete-confirm-dialog'
import { deleteSale } from '../actions'
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
  loyalty_programs: {
    program_type: string
    managed_accounts: {
      name: string
    }
  }
}

interface SalesTableProps {
  sales: Sale[]
}

const channelLabels = {
  HOTMILHAS: 'HotMilhas',
  MAXMILHAS: 'MaxMilhas',
  DIRECT: 'Venda Direta',
  OTHER: 'Outro',
}

export function SalesTable({ sales }: SalesTableProps) {
  const [editingSale, setEditingSale] = useState<Sale | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()

  async function handleDelete(id: string) {
    const result = await deleteSale(id)
    
    if (result.success) {
      toast({
        title: 'Venda excluída',
        description: 'A venda foi excluída com sucesso.',
      })
    } else {
      toast({
        title: 'Erro ao excluir venda',
        description: result.error,
        variant: 'destructive',
      })
    }
    
    setDeletingId(null)
  }

  const getPaymentStatus = (sale: Sale) => {
    if (sale.amount_paid && sale.amount_paid >= sale.total_price_brl) {
      return <Badge variant="default" className="bg-green-600">Pago</Badge>
    }
    if (sale.amount_paid && sale.amount_paid > 0) {
      return <Badge variant="secondary">Parcial</Badge>
    }
    return <Badge variant="outline">Pendente</Badge>
  }

  if (sales.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">Nenhuma venda registrada ainda.</p>
        <p className="text-sm mt-2">Clique em "Nova Venda" para registrar sua primeira venda de milhas.</p>
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
              <TableHead>Canal</TableHead>
              <TableHead className="text-right">Milhas</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
              <TableHead className="text-right">PPM</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>
                  {new Date(sale.sale_date).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>{sale.loyalty_programs.managed_accounts.name}</TableCell>
                <TableCell>{sale.loyalty_programs.program_type}</TableCell>
                <TableCell className="text-sm">
                  {channelLabels[sale.sale_channel]}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {sale.amount_miles.toLocaleString('pt-BR')}
                </TableCell>
                <TableCell className="text-right">
                  {sale.total_price_brl.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </TableCell>
                <TableCell className="text-right">
                  {sale.price_per_thousand.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {sale.customer_name || '-'}
                </TableCell>
                <TableCell>{getPaymentStatus(sale)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingSale(sale)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingId(sale.id)}
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

      {editingSale && (
        <EditSaleDialog
          sale={editingSale}
          open={!!editingSale}
          onOpenChange={(open) => !open && setEditingSale(null)}
        />
      )}

      {deletingId && (
        <DeleteConfirmDialog
          title="Excluir venda"
          description="Tem certeza que deseja excluir esta venda? O estoque será atualizado automaticamente. Esta ação não pode ser desfeita."
          open={!!deletingId}
          onOpenChange={(open) => !open && setDeletingId(null)}
          onConfirm={() => handleDelete(deletingId)}
        />
      )}
    </>
  )
}

