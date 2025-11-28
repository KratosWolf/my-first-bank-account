export default function handler(req, res) {
  console.log('🚀 TEST APPROVAL API:', req.query);

  const { id, action } = req.query;
  const message = action === 'approve' ? 'APROVADA' : 'NEGADA';

  // SEMPRE redirecionar - NUNCA dar erro
  return res.redirect(
    `/demo-parent-view?success=🎉 NOVA API FUNCIONOU! Solicitação ${message} (ID: ${id}) - Timestamp: ${Date.now()}`
  );
}
