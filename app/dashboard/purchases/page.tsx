import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatNumber, formatDate, calculateCPM } from '@/lib/utils'
import { redirect } from 'next/navigation'

async function getPurchasesData(organizationId: string) {
  const supabase = await createClient()

  const { data: purchases } = await supabase
    .from('purchases')
    .select(`
      *,
      managed_accounts (
        name
      ),
      loyalty_programs (
        program_type
      ),
      credit_cards (
        name
      )
    `)
    .eq('organization_id', organizationId)
    .order('purchase_date', { ascending: false })
    .limit(50)

  return purchases || []
}

const programColors: Record<string, string> = {
  LATAM: 'bg-red-100 text-red-800',
  AZUL: 'bg-blue-100 text-blue-800',
  SMILES: 'bg-yellow-100 text-yellow-800',
  LIVELO: 'bg-purple-100 text-purple-800',
}

export default async function PurchasesPage() {
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

  const purchases = await getPurchasesData(org.id)

  const totalSpent = purchases.reduce((sum, p) => sum + Number(p.total_cost_brl), 0)
  const totalMiles = purchases.reduce((sum, p) => sum + p.amount_miles, 0)
  const avgCPM = totalMiles > 0 ? calculateCPM(totalSpent, totalMiles) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Histórico de Compras</h1>
        <p className="text-muted-foreground">
          Acompanhe todas as suas aquisições de milhas e pontos
        </p>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Programa</TableHead>
                <TableHead>Titular</TableHead>
                <TableHead className="text-right">Milhas</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead className="text-right">CPM</TableHead>
                <TableHead>Parcelas</TableHead>
                <TableHead>Cartão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Nenhuma compra registrada ainda
                  </TableCell>
                </TableRow>
              ) : (
                purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">
                      {formatDate(purchase.purchase_date)}
                    </TableCell>
                    <TableCell>
                      <Badge className={programColors[purchase.loyalty_programs?.program_type || ''] || 'bg-gray-100 text-gray-800'}>
                        {purchase.loyalty_programs?.program_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {purchase.managed_accounts?.name}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(purchase.amount_miles)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(purchase.total_cost_brl))}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(purchase.cost_per_thousand))}
                    </TableCell>
                    <TableCell className="text-center">
                      {purchase.installments > 1 ? (
                        <Badge variant="outline">
                          {purchase.installments}x {formatCurrency(Number(purchase.installment_amount))}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">À vista</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {purchase.credit_cards?.name || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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

