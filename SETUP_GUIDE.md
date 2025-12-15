# 🚀 Guia de Configuração MilesManager

Este guia irá te ajudar a configurar o MilesManager do zero em menos de 10 minutos.

## 📋 Checklist de Pré-requisitos

Antes de começar, certifique-se de ter:

- [ ] Node.js 18 ou superior instalado
- [ ] Git instalado
- [ ] Conta criada no [Supabase](https://supabase.com) (grátis)
- [ ] Editor de código (VS Code recomendado)

## 🔧 Passo a Passo

### Passo 1: Preparar o Projeto

```bash
# Navegue até a pasta do projeto
cd /Users/pedro/Projects/milhas

# Instale as dependências
npm install
```

**Tempo estimado:** 2-3 minutos

### Passo 2: Configurar Supabase

#### 2.1. Criar Projeto

1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Clique em **"New Project"**
3. Preencha:
   - **Organization:** Crie uma ou selecione existente
   - **Name:** `milesmanager` (ou nome de sua preferência)
   - **Database Password:** Crie uma senha forte (anote!)
   - **Region:** `South America (São Paulo)` ou mais próxima
4. Clique em **"Create new project"**
5. ☕ Aguarde ~2 minutos enquanto o projeto é criado

#### 2.2. Executar Migration SQL

1. No dashboard do Supabase, no menu lateral, clique em **SQL Editor**
2. Clique no botão **"New query"**
3. Abra o arquivo `supabase/migrations/001_initial_schema.sql` do projeto
4. **Copie todo o conteúdo** (Cmd/Ctrl + A, Cmd/Ctrl + C)
5. **Cole no editor SQL** do Supabase
6. Clique em **"Run"** (ou pressione Cmd/Ctrl + Enter)
7. ✅ Aguarde até ver "Success. No rows returned" na parte inferior

**Dica:** Se houver erro, verifique se copiou todo o conteúdo do arquivo.

#### 2.3. Obter Credenciais

1. No menu lateral do Supabase, clique em ⚙️ **Settings**
2. Clique em **API**
3. Você verá uma seção chamada **"Project API keys"**
4. **Copie** os seguintes valores:
   - **Project URL** (ex: `https://abcdefgh.supabase.co`)
   - **anon / public key** (uma string longa começando com `eyJ...`)

**⚠️ Importante:** Nunca compartilhe estas chaves publicamente!

### Passo 3: Configurar Variáveis de Ambiente

#### 3.1. Criar arquivo .env.local

```bash
# Na raiz do projeto, crie o arquivo
touch .env.local
```

#### 3.2. Adicionar Credenciais

Abra o arquivo `.env.local` e adicione:

```env
# Cole o Project URL aqui
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto-id.supabase.co

# Cole a anon key aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Gere uma chave de criptografia (veja abaixo)
ENCRYPTION_KEY=sua-chave-aqui
```

#### 3.3. Gerar Chave de Criptografia

Execute no terminal:

```bash
# macOS/Linux
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).Guid))
```

Copie o resultado e cole no `.env.local` como valor de `ENCRYPTION_KEY`.

**Exemplo de .env.local completo:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://xkcdabcdef.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhrc2RhYmNkZWYiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYyMzg4MzU5OCwiZXhwIjoxOTM5NDU5NTk4fQ.abc123xyz789
ENCRYPTION_KEY=K8vH2pN9mQ5rT3wX6yZ1cF4gJ7lM0nP2sU5vX8yB1dE=
```

### Passo 4: Executar o Projeto

```bash
# Inicie o servidor de desenvolvimento
npm run dev
```

Você deve ver algo como:

```
▲ Next.js 14.1.0
- Local:        http://localhost:3000
- Ready in 2.3s
```

### Passo 5: Criar sua Conta

1. Abra o navegador em [http://localhost:3000](http://localhost:3000)
2. Você será redirecionado para a tela de login
3. Clique em **"Não tem conta? Cadastre-se"**
4. Preencha:
   - **Email:** seu@email.com
   - **Senha:** Crie uma senha forte (mínimo 6 caracteres)
5. Clique em **"Criar Conta"**

### Passo 6: Confirmar Email

1. Abra seu email
2. Procure por email do Supabase (verifique spam/promoções)
3. Clique no link de confirmação
4. Volte para [http://localhost:3000/login](http://localhost:3000/login)
5. Faça login com suas credenciais

## 🎉 Pronto!

Você agora tem acesso ao dashboard do MilesManager!

### Próximos Passos

1. **Configure suas contas gerenciadas:**
   - Vá em qualquer módulo e comece a adicionar dados
   - Ou acesse diretamente via Supabase Table Editor

2. **Explore as funcionalidades:**
   - 📊 Dashboard - Visão geral
   - 📦 Estoque - Controle de milhas
   - 👥 Beneficiários - Gestão de slots
   - 💰 Compras - Registrar aquisições
   - 💵 Vendas - Registrar transações
   - 📈 Fluxo de Caixa - Projeções financeiras

## 🐛 Problemas Comuns

### Erro: "Invalid API key"

**Solução:**
1. Verifique se copiou a **anon key** correta do Supabase
2. Certifique-se de que não há espaços extras no `.env.local`
3. Reinicie o servidor (`Ctrl+C` e `npm run dev` novamente)

### Erro: "No rows returned" ou tabelas vazias

**Solução:**
1. Verifique se executou a migration SQL completa
2. No Supabase, vá em **Database** → **Tables** e verifique se as tabelas existem
3. Se necessário, execute a migration novamente

### Erro: "Authentication error"

**Solução:**
1. Limpe os cookies do navegador
2. Tente fazer login em uma aba anônima
3. Verifique se confirmou o email de cadastro

### Email de confirmação não chegou

**Solução:**
1. Verifique spam/promoções
2. No Supabase, vá em **Authentication** → **Users**
3. Localize seu usuário e clique em **"Confirm email"** manualmente

## 🚀 Pronto para Produção?

Quando estiver pronto para colocar no ar:

1. **Deploy na Vercel** (recomendado):
```bash
vercel
```

2. **Configure as variáveis de ambiente** no dashboard da Vercel

3. **Configure domínio customizado** (opcional)

## 📞 Precisa de Ajuda?

- Revise este guia novamente
- Verifique o [README.md](./README.md) principal
- Consulte a [documentação do Supabase](https://supabase.com/docs)
- Consulte a [documentação do Next.js](https://nextjs.org/docs)

---

**Boa sorte com seu negócio de milhas! ✈️**

