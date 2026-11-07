# Prompt 7 — Revisão de Produção e Deploy (GitHub + Vercel)

Você é um engenheiro responsável por revisar e preparar o **"Elbima Pet"** para produção.

## OBJETIVO

Garantir que o sistema de gestão da clínica estética pet (banho, tosa, cuidados estéticos de cães e gatos e gestão financeira) está íntegro, seguro e pronto para deploy no GitHub e na Vercel.

---

## VERIFICAÇÃO DO PROJETO

Revise todo o projeto e valide:

### 1. Estrutura geral
- Todos os arquivos essenciais existem (`package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/`)
- Não há imports quebrados ou arquivos obsoletos
- Não há erros de compilação TypeScript (`tsc -b && vite build`)
- Build de produção (`dist/`) gerando perfeitamente

### 2. Integração com Neon
- Conexão estabelecida corretamente via `@neondatabase/serverless` e `@neondatabase/neon-js/auth`
- Autenticação de profissionais funcionando (`Login` e `Cadastro`)
- Row Level Security (RLS) ativo e respeitado nas tabelas (`profissionais`, `pets`, `atendimentos`, `transacoes_financeiras`)
- Operações de leitura, criação, atualização e exclusão funcionando em tempo real

### 3. Variáveis de ambiente e segurança
Verificar que as credenciais do banco (`VITE_DATABASE_URL` e `VITE_NEON_AUTH_URL`):
- **NÃO** estão hardcoded no código-fonte (`src/`)
- **NÃO** estão versionadas no repositório Git
- Estão carregadas exclusivamente via `import.meta.env.VITE_NEON_AUTH_URL` e `import.meta.env.VITE_DATABASE_URL`

### 4. Arquivos `.env` / `.env.local` e `.env.example`
Verificar se existe para desenvolvimento local (não versionado):
```env
VITE_NEON_AUTH_URL=sua_neon_auth_url_aqui
VITE_DATABASE_URL=sua_neon_database_url_aqui
```

### 5. `.gitignore`
Verificar se contém:
```gitignore
node_modules
dist
dist-ssr
*.local
.env
.env.*
!.env.example
```

---

## PROBLEMAS COMUNS A IDENTIFICAR
- Credenciais do Neon hardcoded no código-fonte
- `.env` ou `.env.local` versionado no GitHub
- Falha de conexão com o Neon
- Dados de pets, atendimentos de banho/tosa ou lançamentos financeiros não persistindo corretamente
- Ausência de tratamento de erro nos formulários e serviços

---

## DEPLOY — PASSO A PASSO (GITHUB + VERCEL)

### 1. Configurar e Realizar Commit no GitHub

Comandos para configurar o perfil Git e realizar o commit:
```bash
git config --global user.name "elbimatech"
git config --global user.email "mjs06filho@gmail.com"
git init
git add .
git commit -m "feat: sistema completo Elbima Pet - clinica estetica e modulo financeiro"
```

Enviar para o repositório remoto no GitHub:
```bash
git branch -M main
git remote add origin https://github.com/elbimatech/elbima-pet.git
git push -u origin main --force
```

### 2. Deploy na Vercel
1. Acesse https://vercel.com e clique em **"Add New..." → "Project"**.
2. Importe o repositório **`elbima-pet`** do GitHub.
3. Em **Environment Variables**, adicione as duas variáveis do arquivo `.env.local`:
   - `VITE_NEON_AUTH_URL`
   - `VITE_DATABASE_URL`
4. Clique em **Deploy**.
5. Após gerar o domínio da Vercel (ex: `https://elbima-pet.vercel.app`), adicione esse domínio em **Neon Console → Auth → Trusted Domains** para liberar o login em produção.

---

## IMPORTANTE
- Nunca colocar credenciais do banco diretamente no código
- Nunca subir `.env` ou `.env.local` para o GitHub
- As variáveis de ambiente devem ficar apenas no `.env.local` (local) e no painel da Vercel (produção)

## RESULTADO ESPERADO
- Sistema **"Elbima Pet"** online e funcionando
- Dados de profissionais, pets, atendimentos e financeiro persistindo no Neon
- Nenhuma informação sensível exposta no repositório
