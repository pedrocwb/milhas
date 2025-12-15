# MilesManager - Arquitetura

## 📐 Visão Geral

O MilesManager segue uma arquitetura em camadas bem definida, separando responsabilidades e facilitando manutenção e testes.

## 🏗️ Camadas da Aplicação

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (React Components + Server Actions)   │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│          Service Layer                  │
│   (Business Logic + Data Access)        │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         Data Layer                      │
│     (Supabase PostgreSQL)               │
└─────────────────────────────────────────┘
```

## 📁 Estrutura de Diretórios

```
app/
├── api/                      # REST API Routes (opcional)
│   ├── accounts/
│   │   ├── route.ts         # GET, POST /api/accounts
│   │   └── [id]/route.ts    # GET, PATCH, DELETE /api/accounts/:id
│   └── programs/
│       ├── route.ts         # GET, POST /api/programs
│       └── [id]/route.ts    # GET, PATCH, DELETE /api/programs/:id
├── dashboard/
│   ├── inventory/
│   │   ├── page.tsx         # UI Page
│   │   ├── actions.ts       # Server Actions (Controller)
│   │   └── components/      # UI Components
│   └── ...
└── ...

lib/
├── services/                # Service Layer (Backend)
│   ├── auth.service.ts      # Authentication logic
│   ├── accounts.service.ts  # Accounts business logic
│   ├── programs.service.ts  # Programs business logic
│   └── index.ts            # Barrel export
└── supabase/               # Database client
    ├── client.ts           # Browser client
    ├── server.ts           # Server client
    └── middleware.ts       # Auth middleware
```

## 🔄 Fluxo de Dados

### Opção 1: Server Actions (Recomendado)

```
User Interaction
       ↓
React Component
       ↓
Server Action (actions.ts)
       ↓
Service Layer (*.service.ts)
       ↓
Supabase Database
```

**Exemplo:**
```typescript
// 1. Component
<Button onClick={() => createAccount(formData)}>Save</Button>

// 2. Server Action
export async function createAccount(formData: FormData) {
  const userId = await authService.getUserId()
  return await accountsService.createAccount(userId, data)
}

// 3. Service
export class AccountsService {
  async createAccount(userId: string, data: CreateAccountDto) {
    const supabase = await createClient()
    // ... business logic
    return await supabase.from('managed_accounts').insert(data)
  }
}
```

### Opção 2: REST API Routes

```
User Interaction
       ↓
React Component
       ↓
fetch('/api/accounts')
       ↓
API Route Handler
       ↓
Service Layer (*.service.ts)
       ↓
Supabase Database
```

**Exemplo:**
```typescript
// 1. Component
const response = await fetch('/api/accounts', {
  method: 'POST',
  body: JSON.stringify(data)
})

// 2. API Route
export async function POST(request: NextRequest) {
  const userId = await authService.getUserId()
  return await accountsService.createAccount(userId, body)
}

// 3. Service (mesma camada)
```

## 🛡️ Camada de Serviços

### Responsabilidades

1. **Isolamento de Dados**: Única camada que conhece Supabase
2. **Lógica de Negócio**: Validações, cálculos, regras
3. **Reutilização**: Usada por Server Actions E API Routes
4. **Testabilidade**: Fácil de testar isoladamente
5. **Segurança**: Valida permissões e ownership

### Serviços Disponíveis

#### AuthService
```typescript
authService.getCurrentUser()           // Get current user
authService.getUserId()                // Get user ID
authService.ensureOrganization()       // Create org if needed
authService.getOrganization()          // Get user's org
```

#### AccountsService
```typescript
accountsService.createAccount(userId, data)
accountsService.updateAccount(userId, id, data)
accountsService.deleteAccount(userId, id)
accountsService.getAccounts(userId)
accountsService.getAccountById(userId, id)
```

#### ProgramsService
```typescript
programsService.createProgram(userId, data)
programsService.updateProgram(userId, id, data)
programsService.deleteProgram(userId, id)
programsService.adjustBalance(userId, id, data)
programsService.getPrograms(userId)
programsService.getProgramById(userId, id)
programsService.getProgramTransactions(userId, id, type?)
```

## 🔒 Segurança

### Row Level Security (RLS)

Todo acesso aos dados passa por RLS no Supabase:
- Usuários só acessam suas próprias organizações
- Policies SQL garantem isolamento
- Zero trust na camada de aplicação

### Validação em Camadas

1. **Client-side**: Validação de formulário (UX)
2. **Server Action**: Validação com Zod
3. **Service Layer**: Validação de permissões
4. **Database**: RLS + Constraints

## 📊 Padrões de Código

### DTOs (Data Transfer Objects)

```typescript
export interface CreateAccountDto {
  name: string
  cpf: string
  birth_date?: string | null
  notes?: string | null
}
```

### Error Handling

```typescript
try {
  const account = await accountsService.createAccount(userId, data)
  return { success: true, data: account }
} catch (error: any) {
  return { error: error.message }
}
```

### Dependency Injection

```typescript
export class AccountsService {
  private async getSupabaseClient() {
    return await createClient() // DI do client
  }
}
```

## 🚀 Adicionando Nova Funcionalidade

1. **Criar Service** (`lib/services/feature.service.ts`)
2. **Criar Server Actions** (`app/dashboard/feature/actions.ts`)
3. **Criar UI Components** (`app/dashboard/feature/components/`)
4. **Criar Page** (`app/dashboard/feature/page.tsx`)
5. *(Opcional)* **Criar API Routes** (`app/api/feature/route.ts`)

## 🧪 Testabilidade

### Services (Unit Tests)
```typescript
import { accountsService } from '@/lib/services'

test('should create account', async () => {
  const account = await accountsService.createAccount(userId, mockData)
  expect(account).toHaveProperty('id')
})
```

### API Routes (Integration Tests)
```typescript
const response = await fetch('/api/accounts', {
  method: 'POST',
  body: JSON.stringify(mockData)
})
expect(response.status).toBe(201)
```

## 📈 Performance

### Server Components
- Pages são Server Components (fetch no servidor)
- Sem overhead de hidratação
- SEO-friendly

### Data Fetching
- `Promise.all()` para queries paralelas
- Revalidation com `revalidatePath()`
- Cache automático do Next.js

### Database
- Indexes otimizados
- RLS com functions SECURITY DEFINER
- Triggers para updates automáticos

## 🔄 Migração e Evolução

### Adicionar Cache Layer
```typescript
export class AccountsService {
  private cache = new Map()
  
  async getAccounts(userId: string) {
    if (this.cache.has(userId)) return this.cache.get(userId)
    const data = await this.fetchFromDB(userId)
    this.cache.set(userId, data)
    return data
  }
}
```

### Adicionar Event Bus
```typescript
export class AccountsService {
  async createAccount(userId: string, data: CreateAccountDto) {
    const account = await this.db.insert(data)
    await eventBus.emit('account.created', { account, userId })
    return account
  }
}
```

### Adicionar Queue System
```typescript
export class AccountsService {
  async processLargeImport(userId: string, file: File) {
    await queue.add('import-accounts', { userId, file })
    return { status: 'queued' }
  }
}
```

## 📚 Referências

- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

