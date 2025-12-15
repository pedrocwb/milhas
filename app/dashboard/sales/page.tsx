import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { redirect } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { authService, programsService, salesService } from '@/lib/services'
import { createClient } from '@/lib/supabase/server'
import { AddSaleDialog } from './components/add-sale-dialog'
import { SalesTable } from './components/sales-table'

export default async function SalesPage() {
  const userId = await authService.getUserId()
  
  if (!userId) {
    redirect('/login')
  }

  const organizationId = await authService.getOrganizationId(userId)
  
  if (!organizationId) {
    redirect('/dashboard')
  }

  // Fetch data for form
  const programs = await programsService.getLoyaltyPrograms(userId)
  const sales = await salesService.getSales(userId)
  
  // Fetch beneficiaries for the dialog
  const supabase = await createClient()
  const { data: beneficiaries } = await supabase
    .from('beneficiaries')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('status', 'AVAILABLE')

  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.amount_paid || 0), 0)
  const totalMilesSold = sales.reduce((sum, s) => sum + s.amount_miles, 0)
  const pendingPayments = sales.reduce((sum, s) => {
    const total = Number(s.total_price_brl)
    const paid = Number(s.amount_paid || 0)
    return sum + (total - paid)
  }, 0)

  const paidSales = sales.filter(s => s.actual_payment_date)
  const pendingSales = sales.filter(s => !s.actual_payment_date && s.expected_payment_date)
  const overdueSales = sales.filter(s => {
    if (s.actual_payment_date) return false
    if (!s.expected_payment_date) return false
    return new Date(s.expected_payment_date) < new Date()
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Histórico de Vendas</h1>
          <p className="text-muted-foreground">
            Acompanhe todas as suas vendas e recebimentos
          </p>
        </div>
        <AddSaleDialog 
          programs={programs}
          beneficiaries={beneficiaries || []}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">já recebido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Milhas Vendidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalMilesSold)}</div>
            <p className="text-xs text-muted-foreground">em {sales.length} vendas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">A Receber</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(pendingPayments)}
            </div>
            <p className="text-xs text-muted-foreground">{pendingSales.length} pendentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Atrasados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {overdueSales.length}
            </div>
            <p className="text-xs text-muted-foreground">necessitam atenção</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimas Vendas</CardTitle>
          <CardDescription>
            Histórico completo das suas transações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SalesTable sales={sales} />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="bg-purple-500 rounded-full p-2 mt-0.5">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-purple-900 mb-1">
                  Precificação Inteligente
                </h3>
                <p className="text-sm text-purple-800">
                  Vendas diretas geralmente permitem margem maior (30-40%) vs. marketplaces (20-25%). 
                  Considere o prazo de pagamento ao definir preços: D+1 pode ter margem menor que D+30.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900 mb-1">
                  Acompanhe os Recebimentos
                </h3>
                <p className="text-sm text-orange-800">
                  Marketplaces como Hotmilhas e MaxMilhas têm prazos de pagamento diferentes. 
                  Mantenha um controle rigoroso para garantir seu fluxo de caixa.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DollarSign({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
        clipRule="evenodd"
      />
    </svg>
  )
}
