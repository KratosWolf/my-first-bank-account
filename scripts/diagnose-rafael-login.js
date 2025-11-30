/**
 * Script de diagnóstico para verificar o login do Rafael
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRO: Variáveis de ambiente não configuradas!');
  console.error(
    'Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseRafaelLogin() {
  console.log('🔍 DIAGNÓSTICO: Login do Rafael\n');
  console.log('='.repeat(80));

  // 1. Buscar todas as crianças
  console.log('\n📋 1. CRIANÇAS CADASTRADAS:');
  const { data: children, error: childrenError } = await supabase
    .from('children')
    .select('*')
    .order('name');

  if (childrenError) {
    console.error('❌ Erro ao buscar crianças:', childrenError);
  } else {
    console.table(
      children.map(c => ({
        ID: c.id,
        Nome: c.name,
        Avatar: c.avatar,
        Saldo: `R$ ${(c.balance || 0).toFixed(2)}`,
        PIN: c.pin || 'Não definido',
      }))
    );
  }

  // 2. Buscar todos os user_links
  console.log('\n📋 2. USER_LINKS (LOGINS AUTORIZADOS):');
  const { data: userLinks, error: linksError } = await supabase
    .from('user_links')
    .select('*')
    .order('email');

  if (linksError) {
    console.error('❌ Erro ao buscar user_links:', linksError);
  } else {
    console.table(
      userLinks.map(u => ({
        Email: u.email,
        Nome: u.name,
        Role: u.role,
        Child_ID: u.child_id || 'N/A',
        Avatar: u.avatar || 'N/A',
      }))
    );
  }

  // 3. Verificar especificamente o Rafael
  console.log('\n🔍 3. VERIFICAÇÃO ESPECÍFICA DO RAFAEL:');

  const rafael = children?.find(c => c.name === 'Rafael');
  if (!rafael) {
    console.error('❌ Rafael não encontrado na tabela children!');
    return;
  }

  console.log('✅ Rafael encontrado na tabela children:');
  console.log('   ID:', rafael.id);
  console.log('   Nome:', rafael.name);
  console.log('   Avatar:', rafael.avatar);
  console.log('   PIN:', rafael.pin);

  const rafaelLink = userLinks?.find(u => u.child_id === rafael.id);
  if (!rafaelLink) {
    console.error('\n❌ PROBLEMA: Rafael NÃO tem registro em user_links!');
    console.error(
      '   Isso significa que nenhum email foi autorizado para ele.'
    );
    console.error('\n💡 SOLUÇÃO:');
    console.error(
      '   Execute o script de autorização parental ou crie manualmente:'
    );
    console.error(
      '   INSERT INTO user_links (email, name, role, child_id, family_id, avatar)'
    );
    console.error(
      `   VALUES ('email-do-rafael@gmail.com', 'Rafael', 'child', '${rafael.id}', 'family-id', '${rafael.avatar}');`
    );
  } else {
    console.log('\n✅ Rafael TEM registro em user_links:');
    console.log('   Email:', rafaelLink.email);
    console.log('   Nome:', rafaelLink.name);
    console.log('   Role:', rafaelLink.role);
    console.log('   Child_ID:', rafaelLink.child_id);
    console.log('   Avatar:', rafaelLink.avatar);

    // 4. Testar getUserProfile
    console.log('\n🧪 4. TESTE getUserProfileDirect():');
    const { data: profileTest } = await supabase
      .from('user_links')
      .select(
        `
        id,
        email,
        role,
        name,
        family_id,
        child_id,
        avatar,
        children (
          name,
          balance,
          pin
        ),
        families (
          parent_name
        )
      `
      )
      .eq('email', rafaelLink.email)
      .single();

    if (profileTest) {
      console.log('✅ Perfil retornado com sucesso:');
      console.log('   Email:', profileTest.email);
      console.log('   Role:', profileTest.role);
      console.log('   Name:', profileTest.name);
      console.log('   Child_ID:', profileTest.child_id);
      console.log('   Children data:', profileTest.children);
      console.log('   Family data:', profileTest.families);
    }
  }

  // 5. Verificar Gabriel também
  console.log('\n🔍 5. VERIFICAÇÃO DO GABRIEL:');

  const gabriel = children?.find(c => c.name === 'Gabriel');
  if (gabriel) {
    console.log('✅ Gabriel encontrado na tabela children:');
    console.log('   ID:', gabriel.id);
    console.log('   Nome:', gabriel.name);

    const gabrielLink = userLinks?.find(u => u.child_id === gabriel.id);
    if (!gabrielLink) {
      console.error('\n❌ Gabriel também NÃO tem registro em user_links!');
    } else {
      console.log('\n✅ Gabriel TEM registro em user_links:');
      console.log('   Email:', gabrielLink.email);
      console.log('   Child_ID:', gabrielLink.child_id);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n📝 RESUMO DO DIAGNÓSTICO:\n');

  if (!rafaelLink) {
    console.error('❌ PROBLEMA IDENTIFICADO:');
    console.error(
      '   Rafael não tem autorização de login (sem registro em user_links)'
    );
    console.error('\n💡 PRÓXIMO PASSO:');
    console.error('   1. Verificar se a autorização parental foi completada');
    console.error(
      '   2. Criar registro manualmente em user_links se necessário'
    );
  } else {
    console.log('✅ Rafael TEM autorização de login');
    console.log('   Email autorizado:', rafaelLink.email);
    console.log('   Child_ID:', rafaelLink.child_id);
    console.log('\n⚠️ PROBLEMA IDENTIFICADO:');
    console.log(
      '   O callback redirect() do NextAuth não está redirecionando children'
    );
    console.log('   para /demo-child-view?childId=' + rafaelLink.child_id);
    console.log('\n💡 SOLUÇÃO:');
    console.log('   Modificar pages/api/auth/[...nextauth].ts');
    console.log('   para adicionar lógica de redirecionamento baseada em role');
  }
}

diagnoseRafaelLogin()
  .then(() => {
    console.log('\n✅ Diagnóstico concluído!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Erro no diagnóstico:', error);
    process.exit(1);
  });
