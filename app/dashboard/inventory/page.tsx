import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatNumber, calculateCPM } from '@/lib/utils'
import { redirect } from 'next/navigation'
import { Package, TrendingUp, Calculator, AlertTriangle } from 'lucide-react'
import { authService, accountsService, programsService } from '@/lib/services'

import { AddAccountDialog } from './components/add-account-dialog'
import { AddProgramDialog } from './components/add-program-dialog'
import { InventoryTable } from './components/inventory-table'
import { AccountsList } from './components/accounts-list'

async function getInventoryData(userId: string) {
  const programs = await programsService.getPrograms(userId)

  // For each program, calculate average CPM
  const programsWithStats = await Promise.all(
    programs.map(async (program) => {
      const purchases = await programsService.getProgramTransactions(userId, program.id, 'PURCHASE')

      const totalCost = purchases.reduce((sum, p) => sum + Number(p.cost_brl || 0), 0)
      const totalMiles = purchases.reduce((sum, p) => sum + (p.amount || 0), 0)
      const avgCPM = totalMiles > 0 ? calculateCPM(totalCost, totalMiles) : 0

      return {
        ...program,
        avgCPM,
        totalInvested: totalCost,
      }
    })
  )

  return programsWithStats
}

async function getAccountsData(userId: string) {
  const accounts = await accountsService.getAccounts(userId)
  const programs = await programsService.getPrograms(userId)

  // Add stats to each account
  const accountsWithStats = accounts.map((account) => {
    const accountPrograms = programs.filter(p => p.managed_account_id === account.id)
    
    return {
      ...account,
      programs_count: accountPrograms.length,
      total_miles: accountPrograms.reduce((sum, p) => sum + (p.current_balance || 0), 0),
    }
  })

  return accountsWithStats
}

export default async function InventoryPage() {
  try {
    const user = await authService.getCurrentUser()
    await authService.ensureOrganization(user.id)

    const [inventory, accounts] = await Promise.all([
      getInventoryData(user.id),
      getAccountsData(user.id),
    ])

  const totalMiles = inventory.reduce((sum, p) => sum + (p.current_balance || 0), 0)
  const totalInvested = inventory.reduce((sum, p) => sum + p.totalInvested, 0)
  const overallCPM = totalMiles > 0 ? calculateCPM(totalInvested, totalMiles) : 0
  
  // Calculate expected value (assuming 30% margin or R$22/1000 default)
  const expectedValue = inventory.reduce((sum, p) => {
    if (p.current_balance > 0 && p.avgCPM > 0) {
      return sum + (p.avgCPM / 1000) * p.current_balance * 1.3
    }
    return sum + (p.current_balance || 0) * 0.022
  }, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Estoque de Milhas</h1>
          <p className="text-muted-foreground">
            Controle completo do seu inventário de pontos e milhas
          </p>
        </div>
        <div className="flex gap-2">
          <AddAccountDialog />
          <AddProgramDialog />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total em Estoque</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalMiles)}</div>
            <p className="text-xs text-muted-foreground">
              milhas em {inventory.length} {inventory.length === 1 ? 'programa' : 'programas'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Investido</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInvested)}</div>
            <p className="text-xs text-muted-foreground">custo total de aquisição</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPM Médio</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(overallCPM)}</div>
            <p className="text-xs text-muted-foreground">custo por milheiro</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Valor Esperado</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{formatCurrency(expectedValue)}</div>
            <p className="text-xs text-green-600">
              lucro potencial: {formatCurrency(expectedValue - totalInvested)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Managed Accounts */}
      {accounts.length > 0 && <AccountsList accounts={accounts} />}

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Programas de Fidelidade</CardTitle>
          <CardDescription>
            Saldo detalhado por programa e titular
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InventoryTable inventory={inventory} />
        </CardContent>
      </Card>

      {/* Getting Started Guide */}
      {accounts.length === 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="bg-blue-500 rounded-full p-2 mt-0.5">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">
                  Primeiros Passos
                </h3>
                <p className="text-sm text-blue-800 mb-3">
                  Para começar a usar o sistema, siga estes passos:
                </p>
                <ol className="text-sm text-blue-800 list-decimal list-inside space-y-1">
                  <li>Clique em <strong>"Nova Conta"</strong> para cadastrar um CPF (titular)</li>
                  <li>Depois clique em <strong>"Novo Programa"</strong> para vincular um programa de milhas</li>
                  <li>Registre suas compras e vendas para acompanhar o CPM e lucro</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips Card */}
      {accounts.length > 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="bg-amber-500 rounded-full p-2 mt-0.5">
                <Calculator className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 mb-1">
                  Dica: Monitore seu CPM
                </h3>
                <p className="text-sm text-amber-800">
                  O CPM (Custo Por Milheiro) é crucial para calcular sua margem de lucro. 
                  Mantenha-o baixo comprando em promoções e use o valor esperado para 
                  precificar suas vendas adequadamente. Um bom CPM para LATAM/Smiles é entre R$18-25.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
  } catch (error: any) {
    if (error.message === 'Not authenticated') {
      redirect('/login')
    }
    redirect('/dashboard')
  }
}
