---
name: supabase-setup
description: Convenções de Supabase, criação de tabelas, RLS policies, migrations e configuração. Usar ao criar tabelas, alterar schema, configurar auth, escrever policies RLS, ou qualquer operação no banco de dados.
allowed-tools: Bash, Read, Write
---

# Supabase Setup — Convenções e Padrões

## Quando Usar

- Ao criar novas tabelas
- Ao alterar schema existente
- Ao configurar RLS policies
- Ao escrever migrations
- Ao configurar Supabase Auth
- Ao configurar Storage buckets

## Convenções de Tabelas

### Nomenclatura

- Tabelas: `snake_case` no plural (ex: `user_profiles`, `transactions`)
- Colunas: `snake_case` (ex: `created_at`, `user_id`)
- Foreign keys: `nome_da_tabela_referenciada_id` (ex: `user_id`, `category_id`)

### Colunas Padrão (toda tabela deve ter)

```sql
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
```

### Trigger de updated_at (criar UMA vez no banco)

```sql
-- Função reutilizável
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar em cada tabela:
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON nome_da_tabela
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Soft Delete (quando apropriado)

```sql
deleted_at TIMESTAMPTZ DEFAULT NULL
```

- Usar em tabelas com dados do usuário (perfil, posts, transações)
- NÃO usar em tabelas auxiliares (categorias, configs)

## RLS (Row Level Security)

### Regra: SEMPRE ativar RLS em TODAS as tabelas

```sql
ALTER TABLE nome_da_tabela ENABLE ROW LEVEL SECURITY;
```

### Padrões Comuns de Policies

**Usuário vê apenas seus dados:**

```sql
CREATE POLICY "Users read own data"
  ON nome_da_tabela FOR SELECT
  USING (auth.uid() = user_id);
```

**Usuário edita apenas seus dados:**

```sql
CREATE POLICY "Users update own data"
  ON nome_da_tabela FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**Usuário insere dados vinculados a si:**

```sql
CREATE POLICY "Users insert own data"
  ON nome_da_tabela FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

**Admin vê tudo (baseado em role na tabela de perfis):**

```sql
CREATE POLICY "Admins read all"
  ON nome_da_tabela FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );
```

### ⚠️ Testar RLS

Após criar policies, SEMPRE testar:

1. Como usuário normal (deve ver apenas seus dados)
2. Como outro usuário (NÃO deve ver dados do primeiro)
3. Como admin (deve ver tudo, se aplicável)
4. Sem auth (deve ser bloqueado)

## Migrations

### Arquivo de migrations

Manter `supabase/migrations.sql` atualizado com TODO o SQL do banco:

```sql
-- ============================================
-- MIGRATION: [nome-do-projeto]
-- Data: [data]
-- Versão: [versão]
-- ============================================

-- 1. EXTENSÕES
-- 2. FUNÇÕES AUXILIARES (updated_at trigger, etc.)
-- 3. TABELAS (ordem de dependência — tabelas sem FK primeiro)
-- 4. TRIGGERS
-- 5. RLS POLICIES
-- 6. ÍNDICES
-- 7. SEED DATA (dados iniciais, se houver)
```

### Regra: MCP vs SQL Manual

| Situação                      | Usar                                         |
| ----------------------------- | -------------------------------------------- |
| Dev rápido, exploração        | MCP do Supabase                              |
| Schema definitivo, produção   | migrations.sql (copiar/colar no SQL Editor)  |
| Alteração em tabela existente | Ambos (MCP para testar, SQL para documentar) |

## Auth — Configurações Comuns

### Google OAuth

1. Criar credenciais em console.cloud.google.com
2. No dashboard Supabase → Auth → Providers → Google
3. Inserir Client ID e Client Secret
4. Redirect URL: copiar do Supabase e colar no Google Console

### Tabela de Perfis (vinculada ao Auth)

```sql
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'child')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger para criar perfil automaticamente ao cadastrar
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## Storage — Convenções

### Buckets

```sql
-- Bucket público (avatares, logos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Bucket privado (documentos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false);
```

### RLS no Storage

```sql
-- Upload: só autenticado
CREATE POLICY "Auth users upload"
  ON storage.objects FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Download: só dono (bucket privado)
CREATE POLICY "Users read own files"
  ON storage.objects FOR SELECT
  USING (auth.uid()::text = (storage.foldername(name))[1]);
```

## Checklist de Setup Completo

- [ ] Projeto criado em supabase.com
- [ ] Project ID anotado
- [ ] MCP configurado no Claude Code
- [ ] Tabelas criadas
- [ ] RLS ativado em TODAS as tabelas
- [ ] Policies criadas e testadas
- [ ] Triggers (updated_at, new_user) criados
- [ ] migrations.sql atualizado
- [ ] Auth provider configurado (Google, etc.)
- [ ] .env.local com SUPABASE_URL e SUPABASE_ANON_KEY
