import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  try {
    const { id, action } = req.query;

    if (!id || !action) {
      return res.status(400).json({ error: 'Missing id or action' });
    }

    console.log('🚀 EMERGÊNCIA: Processando via API', { id, action });

    // MODO TESTE: Se o ID for "test", só simular sucesso
    if (id === 'test') {
      console.log('✅ MODO TESTE: Simulando aprovação sem tocar no banco');
      const message = action === 'approve' ? 'APROVADA' : 'NEGADA';
      return res.redirect(
        `/demo-parent-view?success=TESTE ${message} com sucesso! JavaScript funcionando!`
      );
    }

    // Usar valores que o banco aceita
    const status = action === 'approve' ? 'completed' : 'pending';
    const approved = action === 'approve';

    console.log('🔧 Valores sendo enviados:', { status, approved, id });

    // Primeiro, vamos verificar se a transação existe
    const { data: existingTransaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('❌ Erro ao buscar transação:', fetchError);
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    console.log('📄 Transação encontrada:', existingTransaction);

    // Atualizar no Supabase (apenas para IDs reais)
    const { error } = await supabase
      .from('transactions')
      .update({
        status: status,
        approved_by_parent: approved,
        approved_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('❌ Erro na API:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('✅ Sucesso na API');

    // Redirecionar de volta para a página com mensagem de sucesso
    const message = action === 'approve' ? 'APROVADA' : 'NEGADA';
    return res.redirect(
      `/demo-parent-view?success=Solicitação ${message} com sucesso!`
    );
  } catch (error) {
    console.error('❌ Erro crítico na API:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
