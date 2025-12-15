import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatNumber, formatDate, calculateProfitMargin } from '@/lib/utils'
import { redirect } from 'next/navigation'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'

async function getSalesData(organizationId: string) {
  const supabase = await createClient()

  const { data: sales } = await supabase
    .from('sales')
    .select(`
      *,
      loyalty_programs (
        program_type,
        managed_accounts (
          name
        )
      )
    `)
    .eq('organization_id', organizationId)
    .order('sale_date', { ascending: false })
    .limit(50)

  return sales || []
}

const channelColors: Record<string, string> = {
  HOTMILHAS: 'bg-orange-100 text-orange-800',
  MAXMILHAS: 'bg-purple-100 text-purple-800',
  DIRECT: 'bg-green-100 text-green-800',
  OTHER: 'bg-gray-100 text-gray-800',
}

const programColors: Record<string, string> = {
  LATAM: 'bg-red-100 text-red-800',
  AZUL: 'bg-blue-100 text-blue-800',
  SMILES: 'bg-yellow-100 text-yellow-800',
  LIVELO: 'bg-purple-100 text-purple-800',
}

export default async function SalesPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!org) {
    redirect('/dashboard')
  }

  const sales = await getSalesData(org.id)

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
      <div>
        <h1 className="text-3xl font-bold">Histórico de Vendas</h1>
        <p className="text-muted-foreground">
          Acompanhe todas as suas vendas e recebimentos
        </p>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Programa</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead className="text-right">Milhas</TableHead>
                <TableHead className="text-right">Preço/1k</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead className="text-right">Recebido</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Nenhuma venda registrada ainda
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((sale) => {
                  const isPaid = !!sale.actual_payment_date
                  const isOverdue = !isPaid && sale.expected_payment_date && 
                    new Date(sale.expected_payment_date) < new Date()
                  
                  let statusBadge
                  if (isPaid) {
                    statusBadge = (
                      <Badge variant="success" className="flex items-center gap-1 w-fit">
                        <CheckCircle className="h-3 w-3" />
                        Pago
                      </Badge>
                    )
                  } else if (isOverdue) {
                    statusBadge = (
                      <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                        <AlertCircle className="h-3 w-3" />
                        Atrasado
                      </Badge>
                    )
                  } else {
                    statusBadge = (
                      <Badge variant="warning" className="flex items-center gap-1 w-fit">
                        <Clock className="h-3 w-3" />
                        Pendente
                      </Badge>
                    )
                  }

                  return (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">
                        {formatDate(sale.sale_date)}
                      </TableCell>
                      <TableCell>
                        <Badge className={programColors[sale.loyalty_programs?.program_type || ''] || 'bg-gray-100 text-gray-800'}>
                          {sale.loyalty_programs?.program_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={channelColors[sale.sale_channel] || channelColors.OTHER}>
                          {sale.sale_channel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber(sale.amount_miles)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(Number(sale.price_per_thousand))}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(Number(sale.total_price_brl))}
                      </TableCell>
                      <TableCell className="text-right">
                        {sale.amount_paid 
                          ? formatCurrency(Number(sale.amount_paid))
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {statusBadge}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
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

