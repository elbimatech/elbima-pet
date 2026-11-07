# Prompt 3 — Dashboard principal

Agora vamos criar o dashboard principal do sistema. Essa é a primeira tela que o profissional vê após fazer login na clínica estética pet.

## Layout
- Menu lateral fixo com as opções: Dashboard, Pets
- Área principal com os cards de informação

## Cards de informação
O dashboard deve exibir 3 cards principais:

### Card 1 — Total de pets ativos
- Exibe o número total de pets (cães e gatos) cadastrados pelo profissional logado

### Card 2 — Banho e Tosa da semana
- Exibe o número de atendimentos (banhos e tosas) registrados na semana atual

### Card 3 — Pets sem retorno
- Exibe uma lista com o nome do pet (e nome do tutor) cujo último atendimento de banho/tosa foi há mais de 30 dias e que não possuem próximo retorno agendado
- Cada item da lista deve ser clicável e redirecionar para o perfil do pet

## Regras importantes
- Todos os dados devem ser carregados do Neon em tempo real
- Exibir apenas dados do profissional logado
- Se não houver pets sem retorno, exibir a mensagem "Nenhum pet sem retorno no momento"

## Design
- Seguir o mesmo padrão visual da tela de autenticação
- Cards com visual limpo, moderno e profissional
- Menu lateral fixo com logotipo "Elbima Pet" no topo
