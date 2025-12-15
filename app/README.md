# MilhasApp - Sistema de Gerenciamento de Milhas

Um sistema web moderno para gerenciamento de milhas aéreas, desenvolvido em React + TypeScript.

## 🚀 Funcionalidades

- **Dashboard**: Visão geral com estatísticas e resumo financeiro
- **Pessoas**: Cadastro de pessoas com CPF, data de nascimento e credenciais de programas
- **Milhas**: Controle de saldos por programa (AZUL, LATAM, SMILES, LIVELO)
- **Beneficiários**: Gestão de slots de beneficiários por companhia
- **Vendas**: Registro e acompanhamento de vendas de milhas

## 🛠️ Tecnologias

- React 18 + TypeScript
- Vite
- Tailwind CSS
- localStorage para persistência de dados

## 📦 Instalação

```bash
cd app
npm install
```

## 🏃 Execução

```bash
npm run dev
```

O app estará disponível em `http://localhost:5173`

## 📊 Estrutura de Dados

O sistema armazena os dados no localStorage do navegador, incluindo:

- **Pessoas**: Nome, CPF, data de nascimento, credenciais dos programas
- **Saldos de Milhas**: Pontos por programa, valor estimado, acúmulo orgânico
- **Beneficiários**: Slots usados/restantes por companhia aérea
- **Vendas**: Histórico de vendas com datas, quantidades e valores

## 🎨 Interface

- Design moderno com tema escuro
- Interface responsiva para desktop e mobile
- Badges coloridas para cada programa de fidelidade
- Tabelas interativas com filtros

## 💡 Dicas de Uso

1. Comece cadastrando as pessoas na seção "Pessoas"
2. Adicione as credenciais dos programas de fidelidade de cada pessoa
3. Cadastre os saldos de milhas na seção "Milhas"
4. Configure os beneficiários na seção "Beneficiários"
5. Registre as vendas na seção "Vendas"

Você também pode carregar dados de exemplo clicando no botão na tela inicial.

## 📄 Licença

Projeto privado para gerenciamento pessoal de milhas.
