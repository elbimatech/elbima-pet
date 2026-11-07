# Prompt 5 — Perfil do pet + Atendimentos (Banho e Tosa)

Agora vamos criar a página de perfil do pet. Essa tela é acessada ao clicar em um pet na listagem ou nos cards do dashboard.

## Layout geral
A página deve ser organizada em 3 seções: Dados do Pet, Atendimentos (Banho e Tosa) e Financeiro do Pet.

---

## Seção 1 — Dados do pet

- Exibir todos os dados cadastrados do pet organizados nas mesmas 3 abas do cadastro: Dados do Pet e Tutor, Pelagem e Saúde, e Comportamento e Rotina
- Os campos devem ser editáveis diretamente na página
- Botão "Salvar alterações" para confirmar as edições
- Exibir mensagem de sucesso ao salvar

---

## Seção 2 — Atendimentos (Banho e Tosa)

- Painel de acompanhamento estético e histórico da pelagem sempre visível no topo da seção, exibindo o resumo dos serviços realizados, condição da pelagem (nível de nós) e frequência de retornos ao longo do tempo
- Se não houver atendimentos ainda, o painel deve aparecer vazio com a mensagem "Nenhum atendimento registrado ainda"
- Lista de todos os atendimentos em ordem cronológica decrescente (mais recente primeiro) com: data, serviço realizado, condição/nível de nós na pelagem, valor cobrado, observações e próximo retorno
- Botão "Novo Atendimento" que abre um modal com o seguinte formulário:
  - Data do atendimento (seletor de data, preenchida automaticamente com hoje, editável)
  - Serviço realizado (texto ou seleção: ex: Banho, Banho + Tosa Higiênica, Tosa Completa, Hidratação)
  - Nível de nós na pelagem (seleção: Sem nós, Poucos nós, Muitos nós)
  - Valor cobrado em R$ (número, opcional)
  - Observações do banho/tosa (texto livre — ex: comportamento, estado da pele/pelagem/ouvidos, produtos utilizados)
  - Próximo retorno (seletor de data)
  - Botão "Salvar atendimento"
- Ao salvar o atendimento, fechar o modal e atualizar o painel e a lista automaticamente

---

## Seção 3 — Financeiro do Pet

- Resumo do faturamento gerado pelos atendimentos e pacotes do pet
- Histórico de valores cobrados nos banhos, tosas e pacotes em ordem cronológica decrescente (mais recente primeiro)
- Botão para registrar novo lançamento ou pacote financeiro para o pet (implementado de forma completa no Prompt 6)

## Regras importantes
- Todos os dados devem ser carregados do Neon em tempo real
- Todas as alterações devem ser salvas no Neon
- A gestão financeira completa da clínica e do pet será expandida no próximo prompt (Prompt 6)

## Design
- Seguir o mesmo padrão visual do sistema
- Menu lateral fixo mantido
- Painel de acompanhamento estético e histórico de serviços em destaque na seção de atendimentos
