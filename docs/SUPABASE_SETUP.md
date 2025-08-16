# 🚀 Configuração do Supabase para MyFirstBA

Este guia mostra como configurar o Supabase (banco de dados na nuvem) para o projeto MyFirstBA.

## 📋 Pré-requisitos

- Conta no GitHub (para login no Supabase)
- Projeto Next.js configurado localmente

## 🎯 Passo 1: Criar Conta no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em **"Start your project"**
3. Faça login com sua conta do GitHub
4. Autorize o Supabase a acessar sua conta

## 🆕 Passo 2: Criar Novo Projeto

1. No dashboard, clique em **"New Project"**
2. Preencha os dados:
   - **Organization**: Selecione sua organização (ou crie uma nova)
   - **Name**: `MyFirstBA` ou `myfirstba-production`
   - **Database Password**: Crie uma senha forte (anote ela!)
   - **Region**: Escolha `South America (São Paulo)` para melhor performance no Brasil
   - **Pricing Plan**: Selecione **"Free"** (até 500MB)

3. Clique em **"Create new project"**
4. ⏳ Aguarde 1-2 minutos para o projeto ser criado

## 🔧 Passo 3: Configurar o Banco de Dados

### 3.1 Executar Schema SQL

1. No dashboard do projeto, vá para **"SQL Editor"** (ícone 📊)
2. Clique em **"+ New query"**
3. Cole todo o conteúdo do arquivo `lib/supabase/schema.sql`
4. Clique em **"Run"** (ou Ctrl+Enter)
5. ✅ Verifique se não há erros - deve aparecer "Success. No rows returned"

### 3.2 Verificar Tabelas Criadas

1. Vá para **"Table Editor"** (ícone 📋)
2. Você deve ver as tabelas:
   - `families`
   - `users` 
   - `spending_categories`
   - `transactions`
   - `goals`
   - `purchase_requests`
   - `monthly_balances`

## 🔑 Passo 4: Obter Credenciais da API

1. Vá para **"Settings"** → **"API"**
2. Copie as seguintes informações:

### URL do Projeto
```
https://[SEU-PROJECT-ID].supabase.co
```

### Chaves da API
- **anon/public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **service_role**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

⚠️ **IMPORTANTE**: A chave `service_role` é secreta! Nunca a coloque no frontend.

## 🔧 Passo 5: Configurar Variáveis de Ambiente

1. No seu projeto local, copie `.env.example` para `.env.local`:
```bash
cp .env.example .env.local
```

2. Edite `.env.local` e adicione suas credenciais:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[SEU-PROJECT-ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui
```

## 🔒 Passo 6: Configurar Row Level Security (RLS)

### 6.1 Configurar Políticas de Segurança

No SQL Editor, execute:

```sql
-- Política para famílias: usuários só podem ver sua própria família
CREATE POLICY "Users can view own family" ON families
  FOR SELECT USING (
    id IN (
      SELECT family_id FROM users WHERE id = auth.uid()
    )
  );

-- Política para usuários: só podem ver membros da própria família  
CREATE POLICY "Users can view family members" ON users
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM users WHERE id = auth.uid()
    )
  );

-- Política para transações: só podem ver transações da própria família
CREATE POLICY "Users can view family transactions" ON transactions
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM users WHERE id = auth.uid()
    )
  );

-- Políticas similares para outras tabelas...
```

### 6.2 Habilitar RLS (já feito no schema)

As tabelas já têm RLS habilitado via `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`

## 🧪 Passo 7: Testar Conexão

1. Reinicie seu servidor de desenvolvimento:
```bash
npm run dev
```

2. Verifique o console - não deve haver erros de conexão

3. Teste criando uma família de teste no console do navegador:
```javascript
import { supabase } from '@/lib/supabase/client';

// Teste de conexão
const testConnection = async () => {
  const { data, error } = await supabase.from('families').select('count');
  console.log('Conexão:', data, error);
};

testConnection();
```

## 📊 Passo 8: Monitoramento e Logs

### 8.1 Logs em Tempo Real
- Vá para **"Logs"** para ver queries em tempo real
- Útil para debugging

### 8.2 Uso de Recursos  
- Vá para **"Settings"** → **"Usage"** para monitorar:
  - Tamanho do banco (máx. 500MB no free)
  - Requests por mês (máx. 50.000 no free)
  - Bandwidth (máx. 5GB no free)

## 🔄 Passo 9: Migração de Dados do localStorage

Com o Supabase configurado, você pode migrar dados existentes:

```javascript
import { DatabaseService } from '@/lib/services/database-service';

// Migrar dados de uma família
await DatabaseService.migrateLocalStorageData(familyId, userId);
```

## 🚀 Próximos Passos

1. ✅ **Configurar Supabase** (este guia)
2. 🔄 **Migrar componentes** para usar o DatabaseService
3. 🌐 **Deploy no Vercel** 
4. 🔗 **Configurar domínio personalizado**

## 🆘 Troubleshooting

### Erro: "Invalid API key"
- Verifique se as chaves no `.env.local` estão corretas
- Confirme que não há espaços extras

### Erro: "Row Level Security"  
- Certifique-se que as políticas RLS foram criadas
- Temporariamente desabilite RLS para testar: `ALTER TABLE tabela DISABLE ROW LEVEL SECURITY`

### Erro: "Connection timeout"
- Verifique sua conexão com internet
- Tente trocar a região do projeto

### Tabelas não aparecem
- Execute novamente o schema SQL
- Verifique se há erros na execução

## 📞 Suporte

- [Documentação Supabase](https://supabase.com/docs)
- [Discord da Comunidade](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

---

✨ **Dica**: Mantenha sempre um backup do seu schema SQL e credenciais em local seguro!