import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Package, DollarSign, TrendingUp, Users } from 'lucide-react'

async function getDashboardStats(organizationId: string) {
  const supabase = await createClient()

  // Get total miles inventory
  const { data: programs } = await supabase
    .from('loyalty_programs')
    .select('current_balance, program_type')
    .eq('organization_id', organizationId)

  const totalMiles = programs?.reduce((sum, p) => sum + (p.current_balance || 0), 0) || 0

  // Get total expected value
  const { data: transactions } = await supabase
    .from('miles_transactions')
    .select('cost_brl')
    .eq('organization_id', organizationId)
    .eq('transaction_type', 'PURCHASE')

  const totalInvested = transactions?.reduce((sum, t) => sum + Number(t.cost_brl || 0), 0) || 0

  // Get sales stats
  const { data: sales } = await supabase
    .from('sales')
    .select('total_price_brl, amount_paid')
    .eq('organization_id', organizationId)

  const totalSales = sales?.reduce((sum, s) => sum + Number(s.amount_paid || 0), 0) || 0
  const pendingReceivables = sales?.reduce((sum, s) => {
    const paid = Number(s.amount_paid || 0)
    const total = Number(s.total_price_brl || 0)
    return sum + (total - paid)
  }, 0) || 0

  // Get beneficiaries stats
  const { count: beneficiariesCount } = await supabase
    .from('beneficiaries')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .eq('status', 'ACTIVE')

  return {
    totalMiles,
    totalInvested,
    totalSales,
    pendingReceivables,
    profitMargin: totalInvested > 0 ? ((totalSales - totalInvested) / totalInvested) * 100 : 0,
    activeBeneficiaries: beneficiariesCount || 0,
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  // Get or create organization
  let { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!org) {
    const { data: newOrg } = await supabase
      .from('organizations')
      .insert({
        name: 'Minha Organização',
        owner_id: user.id,
      })
      .select()
      .single()
    
    org = newOrg
  }

  const stats = org ? await getDashboardStats(org.id) : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do seu negócio de milhas
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Estoque Total
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(stats?.totalMiles || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              milhas em estoque
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor Investido
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.totalInvested || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              em compras de milhas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vendas Realizadas
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.totalSales || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats && stats.profitMargin > 0 
                ? `+${stats.profitMargin.toFixed(1)}% de lucro`
                : 'lucro total'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              A Receber
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.pendingReceivables || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              pendentes de pagamento
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/dashboard/purchases"
              className="flex items-center p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <Package className="h-5 w-5 mr-3 text-primary" />
              <div>
                <div className="font-medium">Registrar Compra</div>
                <div className="text-sm text-muted-foreground">
                  Adicionar novas milhas ao estoque
                </div>
              </div>
            </a>
            <a
              href="/dashboard/sales"
              className="flex items-center p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <DollarSign className="h-5 w-5 mr-3 text-primary" />
              <div>
                <div className="font-medium">Registrar Venda</div>
                <div className="text-sm text-muted-foreground">
                  Lançar uma nova venda de milhas
                </div>
              </div>
            </a>
            <a
              href="/dashboard/beneficiaries"
              className="flex items-center p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <Users className="h-5 w-5 mr-3 text-primary" />
              <div>
                <div className="font-medium">Gerenciar Beneficiários</div>
                <div className="text-sm text-muted-foreground">
                  Controlar slots disponíveis
                </div>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo de Beneficiários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Beneficiários Ativos
                </span>
                <span className="text-2xl font-bold">
                  {stats?.activeBeneficiaries || 0}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Gerencie seus slots de beneficiários para evitar bloqueios nas companhias aéreas.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

