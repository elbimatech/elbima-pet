# Prompt 4 — Cadastro e listagem de pets

Agora vamos criar a tela de pets do sistema. Ela é composta por duas partes: a listagem de pets e o formulário de cadastro.

## Tela de listagem de pets

- Exibir todos os pets cadastrados pelo profissional logado
- Cada pet exibe: nome do pet, espécie/porte (ex: Cão - Médio, Gato - Pequeno), nome do tutor, serviços preferidos e data do último atendimento
- Campo de busca por nome do pet ou nome do tutor no topo da listagem
- Botão "Novo Pet" que redireciona para o formulário de cadastro
- Cada pet da lista deve ser clicável e redirecionar para o perfil do pet
- Se não houver pets cadastrados, exibir a mensagem "Nenhum pet cadastrado ainda"

## Formulário de cadastro — página nova

O formulário deve ser organizado em 3 abas: Dados do Pet e Tutor, Pelagem e Saúde, e Comportamento e Rotina.

### Aba 1 — Dados do Pet e Tutor
- Nome do pet (texto, obrigatório)
- Espécie (seleção única: Cão, Gato)
- Raça (texto, ex: Shih Tzu, Golden Retriever, Persa, SRD)
- Data de nascimento aproximada (seletor de data — sistema calcula a idade automaticamente)
- Sexo (seleção única: Macho, Fêmea)
- Porte (seleção única: Mini, Pequeno, Médio, Grande, Gigante)
- Nome completo do tutor (texto, obrigatório)
- WhatsApp do tutor (número formatado)
- Email do tutor (texto, formato email)

### Aba 2 — Pelagem e Saúde
- Tipo de pelagem (seleção única: Curta, Média, Longa, Dupla, Encaracolada, Dura)
- Serviços preferidos / contratados (múltipla escolha: Banho, Tosa Higiênica, Tosa na Máquina, Tosa na Tesoura, Tosa da Raça, Hidratação Profunda, Desembolamento, Corte de Unhas, Limpeza de Ouvidos, Escovação de Dentes) + campo de texto livre adicional para objetivo estético
- Condições de saúde ou pele (múltipla escolha: Dermatite, Otite recorrente, Pele sensível, Alergia cutânea, Idoso, Problemas articulares/displasia, Cardiopata, Cego/Surdo) + opção "Nenhuma" + campo para adicionar livremente
- Restrições de produtos e equipamentos (múltipla escolha: Perfume forte, Shampoo comum, Secador quente, Soprador de alta potência, Lâmina baixa) + opção "Nenhuma" + campo para adicionar livremente
- Alergias conhecidas (múltipla escolha: Picada de pulga (DAPP), Clorexidina, Fragrâncias, Corantes, Látex) + opção "Nenhuma" + campo para adicionar livremente
- Medicamentos ou shampoos terapêuticos em uso (texto livre)
- Antipulgas / Vermífugo atual (texto livre)

### Aba 3 — Comportamento e Rotina
- Temperamento no banho e tosa (seleção única: Dócil, Agitado, Medroso, Ansioso, Agressivo, Requer focinheira)
- Frequência ideal de banho em dias (número, ex: 7, 15, 30)
- Horário preferencial de atendimento (número — sistema converte automaticamente para formato de hora, ex: 9 → "09:00", 1430 → "14:30")
- Aceita enfeites e finalização (sim/não — se sim, abre campo de texto: preferência por laços, gravatinhas, bandanas ou colônia suave)
- Observações gerais e manejo (texto livre)

## Regras importantes
- Os campos obrigatórios são o nome do pet, espécie e nome do tutor
- Ao salvar, vincular o pet ao profissional logado via `profissional_id`
- Após salvar, redirecionar para o perfil do pet recém cadastrado
- Exibir mensagem de sucesso ao salvar

## Design
- Seguir o mesmo padrão visual do sistema
- Menu lateral fixo mantido na tela de listagem e no formulário
