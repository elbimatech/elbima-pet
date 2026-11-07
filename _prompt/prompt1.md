# Prompt 1 — Base do projeto + Neon completo

Você vai criar o banco de dados para um sistema de gestão para uma clínica estética de pets (banho e tosa de cães e gatos de todos os portes). Você tem acesso ao Neon via MCP e o projeto já foi criado com o nome de "Elbima Pet". Então pode e deve criar toda a estrutura diretamente via MCP, sem necessidade de copiar SQL manualmente.

Crie as seguintes tabelas com todos os campos abaixo:

## Tabela `profissionais`
- id (uuid, primary key, gerado automaticamente)
- nome (text, not null)
- email (text, not null, unique)
- created_at (timestamp, gerado automaticamente)

## Tabela `pets`
- id (uuid, primary key, gerado automaticamente)
- profissional_id (uuid, foreign key → profissionais.id)
- nome_pet (text, not null)
- especie (text, not null) — ex: Cão, Gato
- raca (text)
- data_nascimento (date)
- sexo (text) — ex: Macho, Fêmea
- porte (text) — ex: Mini, Pequeno, Médio, Grande, Gigante
- peso_inicial (numeric)
- nome_tutor (text, not null)
- whatsapp_tutor (text)
- email_tutor (text)
- tipo_pelagem (text) — ex: Curta, Média, Longa, Dupla, Encaracolada
- servicos_preferidos (text array) — ex: Banho, Tosa Higiênica, Tosa na Tesoura, Tosa na Máquina, Hidratação, Desembolamento, Corte de Unhas, Limpeza de Ouvidos
- objetivo_estetico (text)
- temperamento (text) — ex: Dócil, Agitado, Medroso, Agressivo, Ansioso
- condicoes_saude (text array) — ex: Dermatite, Otite recorrente, Pele sensível, Idoso, Problemas articulares, Cardiopata
- restricoes_produtos (text array) — ex: Perfume forte, Shampoo comum, Secador muito quente, Soprador
- alergias (text array) — ex: Picada de pulga, Clorexidina, Fragrâncias, Corantes
- medicamentos_uso (text)
- antipulgas_atual (text)
- frequencia_banho_dias (integer)
- horario_preferencial (text)
- usa_enfeites (boolean) — se aceita laços, gravatas, bandanas e perfume
- cuidados_especiais_descricao (text)
- observacoes (text)
- created_at (timestamp, gerado automaticamente)

## Tabela `atendimentos`
- id (uuid, primary key, gerado automaticamente)
- pet_id (uuid, foreign key → pets.id)
- data_atendimento (date, not null)
- servico_realizado (text) — ex: Banho + Tosa Higiênica, Banho + Hidratação, Tosa Completa
- nivel_nos_pelagem (text) — ex: Sem nós, Poucos nós, Muitos nós
- valor_cobrado (numeric)
- observacoes (text)
- proximo_retorno (date)
- created_at (timestamp, gerado automaticamente)

## Tabela `transacoes_financeiras`
- id (uuid, primary key, gerado automaticamente)
- profissional_id (uuid, foreign key → profissionais.id)
- pet_id (uuid, foreign key → pets.id, opcional)
- atendimento_id (uuid, foreign key → atendimentos.id, opcional)
- tipo (text, not null) — 'receita' ou 'despesa'
- categoria (text, not null)
- descricao (text, not null)
- valor (numeric, not null)
- forma_pagamento (text) — ex: PIX, Cartão de Crédito, Cartão de Débito, Dinheiro
- status (text, not null) — 'Pago' ou 'Pendente'
- data_transacao (date, not null)
- observacoes (text)
- created_at (timestamp, gerado automaticamente)

Após criar todas as tabelas e relacionamentos, ative o Row Level Security (RLS) em todas as tabelas para garantir que cada profissional acesse apenas os seus próprios dados. Configure as policies necessárias para isso.

Por fim, confirme que tudo foi criado corretamente listando as tabelas e seus campos.
