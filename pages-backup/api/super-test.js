export default function handler(req, res) {
  try {
    // API mais simples possível - apenas retorna JSON
    return res.status(200).json({
      success: true,
      message: '✅ API FUNCIONANDO!',
      timestamp: Date.now(),
    });
  } catch (error) {
    return res.status(200).json({
      success: false,
      message: '❌ ERRO: ' + error.message,
      timestamp: Date.now(),
    });
  }
}
