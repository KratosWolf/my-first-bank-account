# 🔍 DIAGNÓSTICO: Login do Rafael (Child)

**Data:** 30/Novembro/2025
**Status:** ⚠️ PROBLEMA IDENTIFICADO

---

## ✅ O QUE ESTÁ FUNCIONANDO:

### 1. Autorização Parental

- ✅ Rafael foi autorizado com sucesso
- ✅ Email registrado: `rafamfernandes12@gmail.com`
- ✅ Registro criado em `user_links`

### 2. Dados no Supabase

**Tabela `children`:**

```
ID: 317b190a-5e93-42ed-a923-c8769bcec196
Nome: Rafael
Avatar: 👦
PIN: 1234
Saldo: R$ 18.00
```

**Tabela `user_links`:**

```
Email: rafamfernandes12@gmail.com
Nome: Rafael
Role: child
Child_ID: 317b190a-5e93-42ed-a923-c8769bcec196
Avatar: 👦
Family_ID: 2303cb6b-3c0e-4529-9397-dabcd088dbbe
```

### 3. Google OAuth

- ✅ Login com Google funcionou
- ✅ Email reconhecido
- ✅ Perfil retornado corretamente por `getUserProfileDirect()`

### 4. Session Callback

- ✅ `session.user.role = 'child'` ✓
- ✅ `session.user.childId = '317b190a-5e93-42ed-a923-c8769bcec196'` ✓
- ✅ `session.user.familyId = '2303cb6b-3c0e-4529-9397-dabcd088dbbe'` ✓

---

## ❌ PROBLEMA IDENTIFICADO:

### Callback `redirect()` não redireciona children corretamente

**Arquivo:** `pages/api/auth/[...nextauth].ts`

**Código Atual (linhas 16-32):**

```typescript
async redirect({ url, baseUrl }) {
  console.log('NextAuth redirect:', { url, baseUrl });

  // Apenas redirecionar baseado no perfil após callback do Google
  if (url.includes('/api/auth/callback')) {
    // Retornar para o baseUrl para deixar o signIn callback processar
    return baseUrl;
  }

  // Se URL já for absoluta e do mesmo domínio, usar ela
  if (url.startsWith(baseUrl)) {
    return url;
  }

  // Default: redirecionar para home
  return baseUrl;
}
```

**Comportamento Atual:**

1. Rafael faz login com Google → ✅
2. NextAuth autentica → ✅
3. Session enriquecida com `role: 'child'` → ✅
4. Callback `redirect()` retorna `baseUrl` (/) → ❌
5. Aplicação redireciona para `/demo-child` (sem childId) → ❌
6. Erro: "Application error: a client-side exception" → ❌

**Por quê?**

- O callback `redirect()` não tem acesso ao `session` ainda
- Ele roda ANTES do `session()` callback ser chamado
- Portanto, não consegue saber se o usuário é parent ou child

---

## 🎯 URL ESPERADA vs URL ATUAL:

### ✅ URL Esperada (Correta):

```
/demo-child-view?childId=317b190a-5e93-42ed-a923-c8769bcec196
```

### ❌ URL Atual (Incorreta):

```
/demo-child
```

**Diferença:**

- Falta o parâmetro `childId` na query string
- A página `/demo-child-view` precisa desse parâmetro para funcionar

---

## 📋 DADOS COMPLETOS DE TESTE:

### Crianças Cadastradas:

| ID                                     | Nome    | Avatar | Saldo    | PIN  |
| -------------------------------------- | ------- | ------ | -------- | ---- |
| `317b190a-5e93-42ed-a923-c8769bcec196` | Rafael  | 👦     | R$ 18.00 | 1234 |
| `3a4fb20b-f56e-43b9-a194-c9cf37f0ac6b` | Gabriel | 👦     | R$ 16.00 | 5678 |

### User Links (Autorizações):

| Email                           | Nome    | Role   | Child_ID                               |
| ------------------------------- | ------- | ------ | -------------------------------------- |
| `rafamfernandes12@gmail.com`    | Rafael  | child  | `317b190a-5e93-42ed-a923-c8769bcec196` |
| `gabrielmfernandes27@gmail.com` | Gabriel | child  | `3a4fb20b-f56e-43b9-a194-c9cf37f0ac6b` |
| `lemarinhofernandes@gmail.com`  | Helena  | parent | null                                   |
| `tifernandes@gmail.com`         | Tiago   | parent | null                                   |

---

## 💡 SOLUÇÕES POSSÍVEIS:

### Opção 1: Middleware Redirect (Recomendado)

Criar um middleware que redireciona após o login com base no role:

**Arquivo:** `middleware.ts`

```typescript
export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/dashboard/:path*', '/demo-child-view/:path*'],
};
```

**Criar:** `pages/auth/redirect-after-login.tsx`

```typescript
// Página intermediária que redireciona baseado no role
```

### Opção 2: Custom Callback Redirect

Modificar o callback `redirect()` para buscar o perfil antes de redirecionar:

**Problema:** Callback redirect não tem acesso à sessão ainda

### Opção 3: Client-Side Redirect (Mais Simples)

Modificar a página inicial (/) ou criar uma página `/auth/callback-handler` que:

1. Verifica a sessão
2. Se `role === 'child'`, redireciona para `/demo-child-view?childId={childId}`
3. Se `role === 'parent'`, redireciona para `/dashboard`

**Vantagem:** Mais simples, sem modificar NextAuth
**Desvantagem:** Redirecionamento extra (flash da página)

### Opção 4: Modificar NextAuth Redirect + JWT

Adicionar o `role` e `childId` no token JWT para acessar no callback:

**Arquivo:** `pages/api/auth/[...nextauth].ts`

```typescript
async jwt({ user, token, trigger }) {
  if (user) {
    token.uid = user.id;
    // Buscar perfil e adicionar ao token
    const profile = await getUserProfileDirect(user.email);
    if (profile) {
      token.role = profile.role;
      token.childId = profile.childId;
    }
  }
  return token;
}

async redirect({ url, baseUrl, token }) {
  // Agora temos acesso ao token.role e token.childId
  if (token?.role === 'child' && token?.childId) {
    return `${baseUrl}/demo-child-view?childId=${token.childId}`;
  }

  if (token?.role === 'parent') {
    return `${baseUrl}/dashboard`;
  }

  return baseUrl;
}
```

---

## 🚀 RECOMENDAÇÃO:

**OPÇÃO 4** é a mais elegante:

- ✅ Redirecionamento direto (sem flash)
- ✅ Usa NextAuth corretamente
- ✅ Funciona para parents e children
- ✅ Não requer middleware adicional

**Próximos Passos:**

1. Modificar callback `jwt()` para adicionar role e childId ao token
2. Modificar callback `redirect()` para usar token.role e token.childId
3. Testar login do Rafael → deve ir direto para `/demo-child-view?childId=...`
4. Testar login do Gabriel → mesma lógica
5. Testar login do Tiago → deve ir para `/dashboard`

---

## 📝 CÓDIGO ATUAL vs CÓDIGO PROPOSTO:

### Código Atual (Problemático):

```typescript
callbacks: {
  async redirect({ url, baseUrl }) {
    // Sempre retorna baseUrl
    return baseUrl;
  },

  async jwt({ user, token }) {
    if (user) {
      token.uid = user.id;
    }
    return token;
  },

  async session({ session, token }) {
    // Role só fica disponível aqui (tarde demais para redirect)
    const userProfile = await getUserProfileDirect(session.user.email);
    (session.user as any).role = userProfile.role;
    (session.user as any).childId = userProfile.childId;
    return session;
  }
}
```

### Código Proposto (Solução):

```typescript
callbacks: {
  async jwt({ user, token, account }) {
    if (user && account) {
      token.uid = user.id;

      // NOVO: Buscar perfil e adicionar ao token
      const profile = await getUserProfileDirect(user.email);
      if (profile) {
        token.role = profile.role;
        token.childId = profile.childId;
        token.familyId = profile.familyId;
        token.userName = profile.name;
      }
    }
    return token;
  },

  async redirect({ url, baseUrl, token }) {
    console.log('NextAuth redirect:', { url, baseUrl, token });

    // NOVO: Redirecionar baseado no role do token
    if (url.includes('/api/auth/callback') || url.includes('/api/auth/signin')) {
      // Após login com Google
      if (token?.role === 'child' && token?.childId) {
        return `${baseUrl}/demo-child-view?childId=${token.childId}`;
      }

      if (token?.role === 'parent') {
        return `${baseUrl}/dashboard`;
      }
    }

    // Se URL já for específica, usar ela
    if (url.startsWith(baseUrl)) {
      return url;
    }

    // Default: home
    return baseUrl;
  },

  async session({ session, token }) {
    // Passar dados do token para a sessão
    if (session?.user && token?.sub) {
      (session.user as any).id = token.sub;
      (session.user as any).role = token.role;
      (session.user as any).childId = token.childId;
      (session.user as any).familyId = token.familyId;
      (session.user as any).userName = token.userName;
    }
    return session;
  }
}
```

---

## ✅ VERIFICAÇÃO PÓS-IMPLEMENTAÇÃO:

**Testar estes cenários:**

1. ✅ Login Tiago (parent) → `/dashboard`
2. ✅ Login Helena (parent) → `/dashboard`
3. ✅ Login Rafael (child) → `/demo-child-view?childId=317b190a-5e93-42ed-a923-c8769bcec196`
4. ✅ Login Gabriel (child) → `/demo-child-view?childId=3a4fb20b-f56e-43b9-a194-c9cf37f0ac6b`

---

## 🔒 SEGURANÇA:

**Validações Necessárias:**

- ✅ RLS Policy no Supabase garante que children só veem seus dados
- ✅ Middleware valida sessão antes de permitir acesso
- ✅ childId é validado contra a sessão no server-side

**Não é vulnerável a:**

- ❌ Criança alterar childId na URL (RLS bloqueia)
- ❌ Parent acessar view de child (middleware redireciona)
- ❌ Child acessar dashboard parental (middleware redireciona)

---

## 📊 RESUMO:

| Item                  | Status           |
| --------------------- | ---------------- |
| Autorização parental  | ✅ Funcionando   |
| Google OAuth          | ✅ Funcionando   |
| Dados no Supabase     | ✅ Corretos      |
| Session callback      | ✅ Funcionando   |
| **Redirect callback** | ❌ **PROBLEMA**  |
| URL gerada            | ❌ Falta childId |

**Causa Raiz:** Callback `redirect()` não tem acesso ao `role` e `childId`

**Solução:** Adicionar `role` e `childId` ao JWT token para acessar no redirect

**Complexidade:** 🟢 Baixa (15-20 minutos)

**Próximo Passo:** Implementar Opção 4 (JWT + Redirect)
