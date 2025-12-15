import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { redirect } from 'next/navigation'
import { AlertCircle, CheckCircle, Clock } from 'lucide-react'

async function getBeneficiariesData(organizationId: string) {
  const supabase = await createClient()

  const { data: beneficiaries } = await supabase
    .from('beneficiaries')
    .select(`
      *,
      managed_accounts (
        name,
        cpf
      )
    `)
    .eq('organization_id', organizationId)
    .order('program_type')

  return beneficiaries || []
}

const statusConfig = {
  ACTIVE: {
    label: 'Ativo',
    variant: 'success' as const,
    icon: CheckCircle,
  },
  INACTIVE: {
    label: 'Inativo',
    variant: 'secondary' as const,
    icon: AlertCircle,
  },
  QUARANTINE: {
    label: 'Quarentena',
    variant: 'warning' as const,
    icon: Clock,
  },
}

const programColors: Record<string, string> = {
  LATAM: 'bg-red-100 text-red-800',
  AZUL: 'bg-blue-100 text-blue-800',
  SMILES: 'bg-yellow-100 text-yellow-800',
  LIVELO: 'bg-purple-100 text-purple-800',
}

export default async function BeneficiariesPage() {
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

  const beneficiaries = await getBeneficiariesData(org.id)

  const totalSlots = beneficiaries.reduce((sum, b) => sum + b.total_slots, 0)
  const usedSlots = beneficiaries.reduce((sum, b) => sum + b.used_slots, 0)
  const availableSlots = totalSlots - usedSlots

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gerenciamento de Beneficiários</h1>
        <p className="text-muted-foreground">
          Controle seus slots para evitar bloqueios nas companhias aéreas
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Slots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSlots}</div>
            <p className="text-xs text-muted-foreground">slots configurados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Slots Utilizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usedSlots}</div>
            <Progress value={(usedSlots / totalSlots) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Slots Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{availableSlots}</div>
            <p className="text-xs text-muted-foreground">prontos para uso</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Beneficiários por Programa</CardTitle>
          <CardDescription>
            Gerencie os limites de beneficiários de cada companhia aérea
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Programa</TableHead>
                <TableHead>Titular</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Slots Usados</TableHead>
                <TableHead className="text-center">Total Slots</TableHead>
                <TableHead className="text-center">Disponível</TableHead>
                <TableHead>Ocupação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {beneficiaries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Nenhum beneficiário cadastrado ainda
                  </TableCell>
                </TableRow>
              ) : (
                beneficiaries.map((beneficiary) => {
                  const config = statusConfig[beneficiary.status]
                  const Icon = config.icon
                  const usage = (beneficiary.used_slots / beneficiary.total_slots) * 100
                  const available = beneficiary.total_slots - beneficiary.used_slots

                  return (
                    <TableRow key={beneficiary.id}>
                      <TableCell>
                        <Badge className={programColors[beneficiary.program_type] || 'bg-gray-100 text-gray-800'}>
                          {beneficiary.program_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {beneficiary.managed_accounts?.name || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
                          <Icon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {beneficiary.used_slots}
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {beneficiary.total_slots}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-semibold ${available > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {available}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={usage} className="w-24" />
                          <span className="text-sm text-muted-foreground">
                            {usage.toFixed(0)}%
                          </span>
                        </div>
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
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 mb-1">
                  Atenção: Regras das Companhias
                </h3>
                <p className="text-sm text-yellow-800">
                  <strong>LATAM:</strong> 25 beneficiários por ano (renovável anualmente)<br />
                  <strong>Azul:</strong> 5 beneficiários com quarentena de 6 meses<br />
                  <strong>Smiles/Gol:</strong> 25 beneficiários com maior flexibilidade
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">
                  Dica: Maximize seus Slots
                </h3>
                <p className="text-sm text-blue-800">
                  Diversifique suas contas entre diferentes programas para ter mais 
                  flexibilidade. Acompanhe os períodos de quarentena da Azul e renove 
                  seus beneficiários LATAM no início do ano.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

