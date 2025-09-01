export default async function handler(req, res) {
  // NUNCA retornar erro 500 - sempre redirecionar
  try {
    const { id, action } = req.query;

    // Validação básica
    if (!id || !action) {
      return res.redirect(
        `/demo-parent-view?success=ERRO: Parâmetros inválidos (id=${id}, action=${action})`
      );
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

    // Para IDs reais, simular sucesso sem tocar no banco por enquanto
    console.log('🔧 ID Real detectado:', id);
    const message = action === 'approve' ? 'APROVADA' : 'NEGADA';

    // Log detalhado para debug
    console.log('📝 Dados da requisição:', {
      id,
      action,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString(),
    });

    return res.redirect(
      `/demo-parent-view?success=✅ FUNCIONOU! Solicitação ${message} (modo seguro - sem tocar no banco)&debug=id=${id}`
    );
  } catch (error) {
    console.error('❌ Erro crítico capturado:', error);
    // NUNCA retornar 500 - sempre redirecionar
    return res.redirect(
      `/demo-parent-view?success=❌ ERRO CAPTURADO: ${encodeURIComponent(error.message)}&debug=failsafe`
    );
  }
}
