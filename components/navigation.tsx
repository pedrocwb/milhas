'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from './ui/button'
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  DollarSign, 
  CreditCard, 
  TrendingUp,
  LogOut,
  Plane
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Estoque',
    href: '/dashboard/inventory',
    icon: Package,
  },
  {
    title: 'Beneficiários',
    href: '/dashboard/beneficiaries',
    icon: Users,
  },
  {
    title: 'Compras',
    href: '/dashboard/purchases',
    icon: CreditCard,
  },
  {
    title: 'Vendas',
    href: '/dashboard/sales',
    icon: DollarSign,
  },
  {
    title: 'Fluxo de Caixa',
    href: '/dashboard/cashflow',
    icon: TrendingUp,
  },
]

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex h-screen w-64 flex-col bg-card border-r">
      <div className="flex items-center gap-2 p-6 border-b">
        <div className="bg-primary rounded-full p-2">
          <Plane className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold">MilesManager</span>
      </div>
      
      <nav className="flex-1 space-y-1 p-4">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.title}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sair
        </Button>
      </div>
    </div>
  )
}

