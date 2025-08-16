# 🚀 Deploy Guide - My First Bank Account

## Pré-requisitos

1. **Conta no Vercel**: https://vercel.com
2. **Variáveis de ambiente do Supabase** (já configuradas no .env.local)

## Passos para Deploy

### 1. Login no Vercel
```bash
vercel login
```

### 2. Deploy da aplicação
```bash
vercel
```

### 3. Configurar variáveis de ambiente na Vercel
Após o primeiro deploy, adicionar as variáveis:

```bash
# Usar os valores do seu .env.local
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY  
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

### 4. Re-deploy com as variáveis
```bash
vercel --prod
```

## Variáveis de Ambiente Necessárias

As seguintes variáveis precisam ser configuradas no Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`: URL do seu projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave anônima do Supabase  
- `SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço do Supabase

## Status do Deploy

- ✅ Código commitado
- ✅ Vercel CLI instalado
- ⏳ Aguardando login e deploy

## URLs importantes

- **Dashboard Local**: http://localhost:3001/parent/dashboard
- **Produção**: (será gerada após deploy)