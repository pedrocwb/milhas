import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatNumber, calculateCPM } from '@/lib/utils'
import { redirect } from 'next/navigation'
import { authService, accountsService, programsService, purchasesService, cardsService } from '@/lib/services'
import { AddPurchaseDialog } from './components/add-purchase-dialog'
import { PurchasesTable } from './components/purchases-table'

export default async function PurchasesPage() {
  const userId = await authService.getUserId()
  
  if (!userId) {
    redirect('/login')
  }

  const organizationId = await authService.getOrganizationId(userId)
  
  if (!organizationId) {
    redirect('/dashboard')
  }

  // Fetch data for form
  const accounts = await accountsService.getManagedAccounts(userId)
  const programs = await programsService.getLoyaltyPrograms(userId)
  const cards = await cardsService.getCards(userId)
  const purchases = await purchasesService.getPurchases(userId)

  const totalSpent = purchases.reduce((sum, p) => sum + Number(p.total_cost_brl), 0)
  const totalMiles = purchases.reduce((sum, p) => sum + p.amount_miles, 0)
  const avgCPM = totalMiles > 0 ? calculateCPM(totalSpent, totalMiles) : 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Histórico de Compras</h1>
          <p className="text-muted-foreground">
            Acompanhe todas as suas aquisições de milhas e pontos
          </p>
        </div>
        <AddPurchaseDialog 
          accounts={accounts}
          programs={programs}
          cards={cards}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Investido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
            <p className="text-xs text-muted-foreground">em {purchases.length} compras</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Milhas Compradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalMiles)}</div>
            <p className="text-xs text-muted-foreground">pontos adquiridos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">CPM Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgCPM)}</div>
            <p className="text-xs text-muted-foreground">custo por milheiro</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimas Compras</CardTitle>
          <CardDescription>
            Histórico completo das suas aquisições
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PurchasesTable purchases={purchases} />
        </CardContent>
      </Card>

      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="bg-green-500 rounded-full p-2 mt-0.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 mb-1">
                Dica: Otimize suas Compras
              </h3>
              <p className="text-sm text-green-800">
                Fique atento às promoções dos programas de fidelidade! Compras em datas especiais 
                (Black Friday, aniversários dos programas) podem ter CPM até 40% menor. 
                Considere parcelar sem juros para melhor fluxo de caixa.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
