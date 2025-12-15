import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatNumber, calculateCPM } from '@/lib/utils'
import { redirect } from 'next/navigation'

async function getInventoryData(organizationId: string) {
  const supabase = await createClient()

  const { data: programs } = await supabase
    .from('loyalty_programs')
    .select(`
      *,
      managed_accounts (
        name,
        cpf
      )
    `)
    .eq('organization_id', organizationId)
    .order('program_type')

  // For each program, calculate average CPM
  const programsWithStats = await Promise.all(
    (programs || []).map(async (program) => {
      const { data: purchases } = await supabase
        .from('miles_transactions')
        .select('amount, cost_brl')
        .eq('loyalty_program_id', program.id)
        .eq('transaction_type', 'PURCHASE')

      const totalCost = purchases?.reduce((sum, p) => sum + Number(p.cost_brl || 0), 0) || 0
      const totalMiles = purchases?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
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

const programColors: Record<string, string> = {
  LATAM: 'bg-red-100 text-red-800',
  AZUL: 'bg-blue-100 text-blue-800',
  SMILES: 'bg-yellow-100 text-yellow-800',
  LIVELO: 'bg-purple-100 text-purple-800',
  KM_PARCEIROS: 'bg-green-100 text-green-800',
  OTHER: 'bg-gray-100 text-gray-800',
}

export default async function InventoryPage() {
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

  const inventory = await getInventoryData(org.id)

  const totalMiles = inventory.reduce((sum, p) => sum + (p.current_balance || 0), 0)
  const totalInvested = inventory.reduce((sum, p) => sum + p.totalInvested, 0)
  const overallCPM = totalMiles > 0 ? calculateCPM(totalInvested, totalMiles) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Estoque de Milhas</h1>
        <p className="text-muted-foreground">
          Controle completo do seu inventário de pontos e milhas
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total em Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalMiles)}</div>
            <p className="text-xs text-muted-foreground">milhas disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Valor Investido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInvested)}</div>
            <p className="text-xs text-muted-foreground">custo total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">CPM Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(overallCPM)}</div>
            <p className="text-xs text-muted-foreground">custo por milheiro</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Programas de Fidelidade</CardTitle>
          <CardDescription>
            Saldo detalhado por programa e titular
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Programa</TableHead>
                <TableHead>Titular</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
                <TableHead className="text-right">CPM Médio</TableHead>
                <TableHead className="text-right">Investido</TableHead>
                <TableHead className="text-right">Valor Esperado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nenhum programa cadastrado ainda
                  </TableCell>
                </TableRow>
              ) : (
                inventory.map((program) => {
                  const expectedValue = program.current_balance > 0 
                    ? (program.avgCPM / 1000) * program.current_balance * 1.3 // Assuming 30% markup
                    : 0

                  return (
                    <TableRow key={program.id}>
                      <TableCell>
                        <Badge className={programColors[program.program_type] || programColors.OTHER}>
                          {program.program_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {program.managed_accounts?.name || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber(program.current_balance || 0)}
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
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="bg-blue-500 rounded-full p-2 mt-0.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">
                Dica: Monitore seu CPM
              </h3>
              <p className="text-sm text-blue-800">
                O CPM (Custo Por Milheiro) é crucial para calcular sua margem de lucro. 
                Mantenha-o baixo comprando em promoções e use o valor esperado para 
                precificar suas vendas adequadamente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

