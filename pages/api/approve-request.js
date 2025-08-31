import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  try {
    const { id, action } = req.query;

    if (!id || !action) {
      return res.status(400).json({ error: 'Missing id or action' });
    }

    console.log('🚀 EMERGÊNCIA: Processando via API', { id, action });

    const status = action === 'approve' ? 'approved' : 'rejected';
    const approved = action === 'approve';

    // Atualizar no Supabase
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
