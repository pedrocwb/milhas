'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { AdjustBalanceDialog } from './adjust-balance-dialog'
import { DeleteConfirmDialog } from './delete-confirm-dialog'
import { deleteLoyaltyProgram } from '../actions'

interface Program {
  id: string
  program_type: string
  current_balance: number
  account_number: string | null
  avgCPM: number
  totalInvested: number
  managed_accounts: {
    name: string
    cpf: string
  } | null
}

interface InventoryTableProps {
  inventory: Program[]
}

const programColors: Record<string, string> = {
  LATAM: 'bg-red-100 text-red-800',
  AZUL: 'bg-blue-100 text-blue-800',
  SMILES: 'bg-orange-100 text-orange-800',
  LIVELO: 'bg-purple-100 text-purple-800',
  KM_PARCEIROS: 'bg-green-100 text-green-800',
  OTHER: 'bg-gray-100 text-gray-800',
}

const programLabels: Record<string, string> = {
  LATAM: 'LATAM Pass',
  AZUL: 'TudoAzul',
  SMILES: 'Smiles',
  LIVELO: 'Livelo',
  KM_PARCEIROS: 'Km Vantagens',
  OTHER: 'Outro',
}

export function InventoryTable({ inventory }: InventoryTableProps) {
  if (inventory.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
          <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-1">Nenhum programa cadastrado</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Comece cadastrando uma conta e depois adicione os programas de fidelidade.
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Programa</TableHead>
          <TableHead>Titular</TableHead>
          <TableHead>Nº Conta</TableHead>
          <TableHead className="text-right">Saldo</TableHead>
          <TableHead className="text-right">CPM Médio</TableHead>
          <TableHead className="text-right">Investido</TableHead>
          <TableHead className="text-right">Valor Esperado</TableHead>
          <TableHead className="text-center">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {inventory.map((program) => {
          const expectedValue = program.current_balance > 0 && program.avgCPM > 0
            ? (program.avgCPM / 1000) * program.current_balance * 1.3
            : program.current_balance * 0.022 // Default R$22/1000 if no CPM

          return (
            <TableRow key={program.id}>
              <TableCell>
                <Badge className={programColors[program.program_type] || programColors.OTHER}>
                  {programLabels[program.program_type] || program.program_type}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  {program.managed_accounts?.name || 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {program.managed_accounts?.cpf}
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {program.account_number || '-'}
              </TableCell>
              <TableCell className="text-right">
                <span className="font-mono font-semibold">
                  {formatNumber(program.current_balance || 0)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                {program.avgCPM > 0 ? formatCurrency(program.avgCPM) : '-'}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(program.totalInvested)}
              </TableCell>
              <TableCell className="text-right text-green-600 font-medium">
                {formatCurrency(expectedValue)}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-1">
                  <AdjustBalanceDialog
                    programId={program.id}
                    programName={`${programLabels[program.program_type]} - ${program.managed_accounts?.name}`}
                    currentBalance={program.current_balance || 0}
                  />
                  <DeleteConfirmDialog
                    title="Excluir Programa"
                    description={`Tem certeza que deseja excluir o programa ${programLabels[program.program_type]} de ${program.managed_accounts?.name}? Esta ação não pode ser desfeita.`}
                    onConfirm={() => deleteLoyaltyProgram(program.id)}
                  />
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

