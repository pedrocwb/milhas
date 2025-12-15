# MilesManager - Sistema de Gestão de Milhas e Pontos

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-green" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-06B6D4" alt="Tailwind" />
</div>

## 📋 Visão Geral

MilesManager é um sistema SaaS profissional para gestores de milhas (milheiros) que administram múltiplas contas, centralizando o controle de:

- 🎯 **Estoque de Pontos e Milhas** - Controle completo por programa e titular
- 💰 **Gestão Financeira** - Compras, vendas e fluxo de caixa
- 👥 **Beneficiários** - Controle de slots para evitar bloqueios
- 📊 **Análises e Relatórios** - CPM, margem de lucro e projeções

## 🚀 Stack Tecnológica

- **Frontend:** Next.js 14 (App Router) + TypeScript
- **UI:** Tailwind CSS + Shadcn/UI
- **Backend:** Supabase (PostgreSQL + Auth + Row Level Security)
- **Hospedagem:** Vercel
- **Bibliotecas:** date-fns, recharts, lucide-react

## ⚡ Quick Start

### Pré-requisitos

- Node.js 18+ instalado
- Conta no [Supabase](https://supabase.com)
- Conta no [Vercel](https://vercel.com) (opcional, para deploy)

### 1. Instalação

```bash
# Clone o repositório (se ainda não tiver)
cd milhas

# Instale as dependências
npm install
```

### 2. Configuração do Supabase

#### 2.1. Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Preencha os dados do projeto:
   - **Name:** milesmanager (ou nome de sua preferência)
   - **Database Password:** Escolha uma senha forte
   - **Region:** Escolha a região mais próxima (ex: South America)
4. Aguarde a criação do projeto (~2 minutos)

#### 2.2. Executar Migration do Banco de Dados

1. No dashboard do Supabase, vá em **SQL Editor**
2. Clique em **New Query**
3. Copie todo o conteúdo do arquivo `supabase/migrations/001_initial_schema.sql`
4. Cole no editor e clique em **Run**
5. Aguarde a execução (deve retornar "Success")

#### 2.3. Configurar Variáveis de Ambiente

1. No Supabase, vá em **Settings** → **API**
2. Copie:
   - **Project URL** (ex: https://xxxxx.supabase.co)
   - **anon/public key**

3. Crie o arquivo `.env.local` na raiz do projeto:

```bash
cp .env.local.example .env.local
```

4. Edite `.env.local` e adicione suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui

# Encryption key (gere com: openssl rand -base64 32)
ENCRYPTION_KEY=sua-chave-de-criptografia-aqui
```

### 3. Executar Localmente

```bash
# Modo desenvolvimento
npm run dev

# Abra http://localhost:3000
```

### 4. Primeiro Acesso

1. Acesse http://localhost:3000
2. Clique em "Não tem conta? Cadastre-se"
3. Crie sua conta com email e senha
4. Confirme o email (verifique sua caixa de entrada)
5. Faça login e comece a usar!

## 📚 Estrutura do Projeto

```
milhas/
├── app/
│   ├── dashboard/          # Páginas do dashboard
│   │   ├── inventory/      # Estoque de milhas
│   │   ├── beneficiaries/  # Gestão de beneficiários
│   │   ├── purchases/      # Histórico de compras
│   │   ├── sales/          # Histórico de vendas
│   │   └── cashflow/       # Fluxo de caixa
│   ├── login/              # Autenticação
│   └── auth/               # Callback OAuth
├── components/
│   ├── ui/                 # Componentes Shadcn/UI
│   └── navigation.tsx      # Menu de navegação
├── lib/
│   ├── supabase/           # Configuração Supabase
│   └── utils.ts            # Funções auxiliares
└── supabase/
    └── migrations/         # SQL migrations
```

## 🗄️ Modelo de Dados

### Principais Tabelas

- **organizations** - Organizações (multi-tenancy)
- **managed_accounts** - CPFs gerenciados (titulares)
- **loyalty_programs** - Programas de fidelidade por titular
- **miles_transactions** - Transações de milhas
- **beneficiaries** - Controle de slots de beneficiários
- **purchases** - Compras de milhas
- **sales** - Vendas de milhas
- **cash_flow_items** - Fluxo de caixa

### Programas Suportados

- ✈️ **LATAM Pass**
- ✈️ **TudoAzul (Azul)**
- ✈️ **Smiles (Gol)**
- 🎁 **Livelo**
- 🚗 **KM de Vantagens**
- 📦 **Outros**

## 🔐 Segurança

### Row Level Security (RLS)

O sistema implementa RLS no Supabase, garantindo que:
- Usuários só acessam dados de suas próprias organizações
- Todas as queries são filtradas automaticamente
- Zero trust: validação no banco de dados

### Criptografia de Credenciais

Senhas de programas de fidelidade são armazenadas criptografadas usando `pgcrypto`. Configure a chave `ENCRYPTION_KEY` no `.env.local`.

## 📊 Funcionalidades Principais

### 1. Dashboard

- Visão geral do negócio
- Métricas principais: estoque, investido, vendas, margem
- Ações rápidas

### 2. Estoque de Milhas

- Saldo por programa e titular
- CPM (Custo Por Milheiro) calculado automaticamente
- Valor esperado de venda

### 3. Gestão de Beneficiários (Killer Feature! 🔥)

- Controle de slots por companhia aérea
- Status: Ativo, Inativo, Quarentena
- Alertas de disponibilidade
- Regras específicas por cia aérea

### 4. Compras

- Registro de aquisições
- Suporte a parcelamento
- Cálculo automático de CPM
- Histórico completo

### 5. Vendas

- Múltiplos canais (Hotmilhas, MaxMilhas, Direto)
- Controle de recebimentos
- Status: Pago, Pendente, Atrasado
- Vínculo com beneficiários utilizados

### 6. Fluxo de Caixa

- Projeção de entradas e saídas
- Visão por período (mês atual, próximo mês)
- Parcelas de compras
- Recebimentos de vendas
- Saldo atual e projetado

## 🎨 Customização

### Cores e Tema

Edite `tailwind.config.ts` e `app/globals.css` para customizar:
- Paleta de cores
- Tipografia
- Espaçamentos

### Adicionar Novos Programas

1. Adicione o novo tipo em `supabase/migrations/001_initial_schema.sql`:
```sql
CREATE TYPE program_type AS ENUM ('LATAM', 'AZUL', 'SMILES', 'LIVELO', 'SEU_PROGRAMA');
```

2. Adicione as cores em cada página que use `programColors`

## 🚀 Deploy

### Vercel (Recomendado)

1. Instale a CLI da Vercel:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Configure as variáveis de ambiente no dashboard da Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ENCRYPTION_KEY`

4. Pronto! Seu app estará no ar em segundos.

### Outras Plataformas

O projeto é compatível com qualquer plataforma que suporte Next.js:
- Netlify
- Railway
- AWS Amplify
- Cloudflare Pages

## 📈 Roadmap

- [ ] Dashboard com gráficos interativos (recharts)
- [ ] Exportação de relatórios (PDF, Excel)
- [ ] Notificações de milhas a vencer
- [ ] API para integração com marketplaces
- [ ] App mobile (React Native)
- [ ] Importação de extratos automatizada
- [ ] Calculadora de lucro em tempo real
- [ ] Modo escuro (dark mode)

## 🐛 Troubleshooting

### Erro: "Invalid API key"

Verifique se copiou corretamente a `anon key` do Supabase no `.env.local`.

### Erro: "Row Level Security"

Execute novamente a migration SQL no Supabase. Certifique-se de que todas as policies foram criadas.

### Erro: "Module not found"

Execute `npm install` novamente para garantir que todas as dependências estão instaladas.

### Tabelas não aparecem no dashboard

1. Verifique se a migration foi executada com sucesso
2. Faça logout e login novamente
3. Verifique o console do navegador para erros

## 📝 Licença

Este projeto é privado e proprietário. Todos os direitos reservados.

## 🤝 Contribuindo

Este é um projeto privado. Para sugestões ou melhorias, entre em contato com o desenvolvedor.

## 📧 Suporte

Para dúvidas ou problemas:
1. Verifique a seção de Troubleshooting
2. Revise a documentação do [Supabase](https://supabase.com/docs)
3. Revise a documentação do [Next.js](https://nextjs.org/docs)

---

**Desenvolvido com ❤️ para profissionais do mercado de milhas**

