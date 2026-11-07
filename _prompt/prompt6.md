# Prompt 6 — Módulo Financeiro da Clínica de Estética Pet

Você é um desenvolvedor full-stack sênior especializado em React e Neon (PostgreSQL). Sua tarefa é implementar a **Aba Financeira completa** da clínica estética pet dentro do sistema **"Elbima Pet"** (sem uso de inteligência artificial / Gemini).

## STACK
- React (Vite + TypeScript + Tailwind CSS)
- Neon (PostgreSQL Serverless)

## OBJETIVO
Permitir que o profissional / gestor da clínica estética pet acompanhe em tempo real todo o fluxo financeiro do negócio (receitas de banhos, tosas, hidratações, pacotes mensais e despesas operacionais com cosméticos, insumos e manutenção), tanto em uma **Aba Financeira geral no menu lateral** quanto no **Histórico Financeiro individual dentro do perfil de cada pet**.

---

## 1. Estrutura no Banco de Dados (Neon)

Crie (caso ainda não exista) a tabela `transacoes_financeiras` no banco Neon com Row Level Security (RLS) ativo para que cada profissional acesse apenas seus próprios lançamentos:

### Tabela `transacoes_financeiras`
- `id` (uuid, primary key, gerado automaticamente)
- `profissional_id` (uuid, foreign key → `profissionais.id`, not null)
- `pet_id` (uuid, foreign key → `pets.id`, opcional / nullable)
- `atendimento_id` (uuid, foreign key → `atendimentos.id`, opcional / nullable)
- `tipo` (text, not null) — `'receita'` ou `'despesa'`
- `categoria` (text, not null) — ex: `'Banho e Tosa'`, `'Pacote Mensal'`, `'Hidratação e Tratamentos'`, `'Cosméticos e Insumos'`, `'Manutenção de Equipamentos'`, `'Contas Fixas'`, `'Outros'`
- `descricao` (text, not null)
- `valor` (numeric, not null)
- `forma_pagamento` (text) — ex: `'PIX'`, `'Cartão de Crédito'`, `'Cartão de Débito'`, `'Dinheiro'`
- `status` (text, not null, default `'Pago'`) — `'Pago'` ou `'Pendente'`
- `data_transacao` (date, not null)
- `observacoes` (text)
- `created_at` (timestamp, gerado automaticamente)

> **Integração automática com Atendimentos:** Todos os atendimentos registrados na tabela `atendimentos` que possuam `valor_cobrado > 0` devem compor automaticamente as receitas de serviços na visão financeira (além dos lançamentos manuais de receitas e despesas na tabela `transacoes_financeiras`).

---

## 2. Navegação e Layout da Aba Financeira Geral

- Adicionar o item **"Financeiro"** no menu lateral fixo (`Sidebar`).
- Na tela **Financeiro**, exibir no topo um filtro de período (Mês/Ano atual selecionado por padrão, com opção de navegar entre meses ou ver todos).

### Cards de Resumo em Destaque (4 Indicadores):
1. **Receita Total no Período (R$):** Soma dos valores cobrados nos atendimentos de banho/tosa + receitas avulsas/pacotes lançados no período.
2. **Despesas da Clínica (R$):** Soma das saídas registradas no período (shampoos, laços, energia, manutenção de secadores/máquinas, etc.).
3. **Saldo / Lucro Líquido (R$):** Diferença entre Receita Total e Despesas (`Receitas - Despesas`), destacando visualmente se positivo ou negativo.
4. **Ticket Médio por Atendimento (R$):** Valor médio por banho/tosa realizado no período e quantidade de atendimentos faturados.

### Painel de Faturamento por Serviço e Categorias:
- Exibir o detalhamento visual (barras de progresso) de quanto cada tipo de serviço estética (ex: *Banho + Tosa Higiênica*, *Tosa na Tesoura*, *Hidratação Profunda*, *Pacotes*) representa no faturamento da clínica, além do resumo de despesas por categoria.

### Lista de Movimentações Financeiras:
- Exibir todas as movimentações do período em ordem cronológica decrescente (mais recente primeiro), unificando:
  - Atendimentos de banho e tosa com valor cobrado (identificando o nome do pet, tutor e serviço realizado)
  - Lançamentos financeiros manuais (receitas extras, pacotes e despesas da clínica)
- Filtros rápidos por tipo (`Todos`, `Receitas`, `Despesas`), por status (`Todos`, `Pago`, `Pendente`) e campo de busca por descrição ou nome do pet.
- Permitir alternar o status de um lançamento (`Pago` ↔ `Pendente`) e excluir lançamentos manuais.

---

## 3. Modal "Novo Lançamento Financeiro"

Botão em destaque **"+ Novo Lançamento"** que abre um modal com:
- **Tipo de movimentação:** `Receita (Entrada)` ou `Despesa (Saída)`
- **Descrição:** texto (ex: *Pacote 4 Banhos - Thor*, *Compra de Shampoos Neutros e Hidratantes*, *Afiação de Lâminas de Tosa*)
- **Categoria:** seleção dinâmica conforme o tipo:
  - Se Receita: `Banho e Tosa`, `Pacote Mensal / Quinzenal`, `Hidratação e Spa`, `Venda de Acessórios / Enfeites`, `Outros`
  - Se Despesa: `Cosméticos e Shampoos`, `Enfeites e Finalização`, `Manutenção e Afiação`, `Energia / Água / Internet`, `Aluguel e Taxas`, `Outros`
- **Valor em R$:** número (obrigatório, maior que zero)
- **Data da transação:** seletor de data (preenchido com hoje por padrão)
- **Forma de pagamento:** seleção (`PIX`, `Cartão de Crédito`, `Cartão de Débito`, `Dinheiro`)
- **Status:** seleção (`Pago`, `Pendente`)
- **Vincular a um Pet (opcional):** seletor com os pets cadastrados na clínica
- **Observações:** texto livre opcional
- **Botão "Salvar Lançamento":** salva no Neon e atualiza os indicadores e a lista imediatamente.

---

## 4. Aba Financeira dentro do Perfil do Pet (`PerfilPetView`)

Na página de perfil do pet, substituir a 3ª seção ("Planos Estéticos") por **"Financeiro do Pet"**:
- Exibir o resumo financeiro exclusivo daquele pet:
  - **Total Faturado com o Pet (R$)**
  - **Ticket Médio do Pet (R$)**
  - **Último Pagamento / Valor**
- Listar todos os valores cobrados nos atendimentos de banho/tosa daquele pet e eventuais pacotes/lançamentos financeiros vinculados a ele.
- Botão **"+ Lançar Pacote / Cobrança"** já pré-vinculado ao pet atual.

---

## Regras Importantes
- Nenhuma chamada para APIs de Inteligência Artificial (Gemini removido do projeto).
- Todos os dados devem ser lidos e persistidos em tempo real no Neon PostgreSQL.
- Manter o padrão visual azul e branco (`blue`, `sky`, `indigo`) e suporte a modo claro/escuro.
