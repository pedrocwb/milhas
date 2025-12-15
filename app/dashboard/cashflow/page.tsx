import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { redirect } from 'next/navigation'
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import { addMonths, startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, isAfter, isBefore } from 'date-fns'
import { ptBR } from 'date-fns/locale'

async function getCashFlowData(organizationId: string) {
  const supabase = await createClient()

  // Get purchases (expenses)
  const { data: purchases } = await supabase
    .from('purchases')
    .select('*')
    .eq('organization_id', organizationId)
    .not('first_due_date', 'is', null)

  // Get sales (income)
  const { data: sales } = await supabase
    .from('sales')
    .select('*')
    .eq('organization_id', organizationId)

  // Create cash flow items
  const cashFlowItems: Array<{
    date: Date
    type: 'INCOME' | 'EXPENSE'
    amount: number
    description: string
    status: 'PAID' | 'PENDING' | 'OVERDUE'
    category: string
  }> = []

  // Add purchase installments
  purchases?.forEach((purchase) => {
    if (purchase.first_due_date && purchase.installments > 0) {
      for (let i = 0; i < purchase.installments; i++) {
        const dueDate = addMonths(new Date(purchase.first_due_date), i)
        const isPast = isBefore(dueDate, new Date())
        
        cashFlowItems.push({
          date: dueDate,
          type: 'EXPENSE',
          amount: Number(purchase.installment_amount || purchase.total_cost_brl),
          description: `Parcela ${i + 1}/${purchase.installments} - Compra ${purchase.amount_miles} milhas`,
          status: isPast ? 'PAID' : 'PENDING',
          category: 'Compra de Milhas',
        })
      }
    }
  })

  // Add sales (income)
  sales?.forEach((sale) => {
    const paymentDate = sale.actual_payment_date || sale.expected_payment_date
    if (paymentDate) {
      const isPaid = !!sale.actual_payment_date
      const isOverdue = !isPaid && isBefore(new Date(paymentDate), new Date())

      cashFlowItems.push({
        date: new Date(paymentDate),
        type: 'INCOME',
        amount: Number(sale.amount_paid || sale.total_price_brl),
        description: `Venda ${sale.amount_miles} milhas - ${sale.sale_channel}`,
        status: isPaid ? 'PAID' : (isOverdue ? 'OVERDUE' : 'PENDING'),
        category: 'Venda de Milhas',
      })
    }
  })

  // Sort by date
  cashFlowItems.sort((a, b) => a.date.getTime() - b.date.getTime())

  return cashFlowItems
}

function calculateBalance(items: Array<{type: string, amount: number, status: string}>, upToDate: Date) {
  return items
    .filter(item => item.status === 'PAID' && isBefore(new Date(item.date), upToDate))
    .reduce((sum, item) => {
      return sum + (item.type === 'INCOME' ? item.amount : -item.amount)
    }, 0)
}

export default async function CashFlowPage() {
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

  const cashFlowItems = await getCashFlowData(org.id)

  // Calculate summary
  const today = new Date()
  const thisMonth = startOfMonth(today)
  const nextMonth = addMonths(thisMonth, 1)

  const thisMonthIncome = cashFlowItems
    .filter(item => item.type === 'INCOME' && 
      isAfter(item.date, startOfMonth(today)) && 
      isBefore(item.date, endOfMonth(today)))
    .reduce((sum, item) => sum + item.amount, 0)

  const thisMonthExpenses = cashFlowItems
    .filter(item => item.type === 'EXPENSE' && 
      isAfter(item.date, startOfMonth(today)) && 
      isBefore(item.date, endOfMonth(today)))
    .reduce((sum, item) => sum + item.amount, 0)

  const nextMonthIncome = cashFlowItems
    .filter(item => item.type === 'INCOME' && 
      isAfter(item.date, startOfMonth(nextMonth)) && 
      isBefore(item.date, endOfMonth(nextMonth)))
    .reduce((sum, item) => sum + item.amount, 0)

  const nextMonthExpenses = cashFlowItems
    .filter(item => item.type === 'EXPENSE' && 
      isAfter(item.date, startOfMonth(nextMonth)) && 
      isBefore(item.date, endOfMonth(nextMonth)))
    .reduce((sum, item) => sum + item.amount, 0)

  const currentBalance = calculateBalance(cashFlowItems, today)
  const projectedBalance = currentBalance + (thisMonthIncome - thisMonthExpenses) + (nextMonthIncome - nextMonthExpenses)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Fluxo de Caixa</h1>
        <p className="text-muted-foreground">
          Projeção financeira e controle de entrada e saída
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(currentBalance)}
            </div>
            <p className="text-xs text-muted-foreground">já realizado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">{formatCurrency(thisMonthIncome)}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-600">{formatCurrency(thisMonthExpenses)}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Líquido: {formatCurrency(thisMonthIncome - thisMonthExpenses)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Próximo Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">{formatCurrency(nextMonthIncome)}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-600">{formatCurrency(nextMonthExpenses)}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Líquido: {formatCurrency(nextMonthIncome - nextMonthExpenses)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Projeção 60 dias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${projectedBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(projectedBalance)}
            </div>
            <p className="text-xs text-muted-foreground">saldo projetado</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movimentações Futuras</CardTitle>
          <CardDescription>
            Próximas entradas e saídas programadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cashFlowItems
                .filter(item => item.status !== 'PAID' || isAfter(item.date, addMonths(today, -1)))
                .slice(0, 30)
                .map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(item.date, 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.type === 'INCOME' ? (
                        <Badge variant="success" className="flex items-center gap-1 w-fit">
                          <TrendingUp className="h-3 w-3" />
                          Entrada
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                          <TrendingDown className="h-3 w-3" />
                          Saída
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.category}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.description}
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${
                      item.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.type === 'INCOME' ? '+' : '-'}{formatCurrency(item.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          item.status === 'PAID' ? 'success' : 
                          item.status === 'OVERDUE' ? 'destructive' : 
                          'warning'
                        }
                      >
                        {item.status === 'PAID' ? 'Pago' :
                         item.status === 'OVERDUE' ? 'Atrasado' :
                         'Pendente'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              {cashFlowItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nenhuma movimentação programada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-indigo-50 border-indigo-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="bg-indigo-500 rounded-full p-2 mt-0.5">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-indigo-900 mb-1">
                Gestão Financeira Estratégica
              </h3>
              <p className="text-sm text-indigo-800">
                Um fluxo de caixa saudável é essencial para o negócio de milhas. Mantenha sempre 
                uma reserva para cobrir os parcelamentos e evite comprometer todo o capital em estoque. 
                O ideal é ter liquidez para pelo menos 3 meses de operação.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

