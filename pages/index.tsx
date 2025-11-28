export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl">
            🏦
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Banco da Família
          </h1>
          <p className="text-gray-600">Sistema de Educação Financeira</p>
        </div>

        {/* Menu Principal - SIMPLIFICADO */}
        <div className="space-y-4">
          <button
            onClick={() => (window.location.href = '/dashboard')}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-3"
          >
            <span className="text-2xl">👨‍👩‍👧‍👦</span>
            <div className="text-left">
              <div className="text-lg">Dashboard Parental</div>
              <div className="text-sm opacity-90">Crianças • Aprovações • Analytics</div>
            </div>
          </button>

          <button
            onClick={() => (window.location.href = '/child-login')}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-3"
          >
            <span className="text-2xl">👶</span>
            <div className="text-left">
              <div className="text-lg">Acesso das Crianças</div>
              <div className="text-sm opacity-90">Escolha seu perfil e digite sua senha</div>
            </div>
          </button>
        </div>

        {/* Status */}
        <div className="mt-8 p-4 bg-green-50 rounded-lg">
          <p className="text-green-800 text-sm text-center font-semibold">
            ✅ Sistema 100% Funcional
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-6">
          <p>Sistema educativo • Transações simuladas</p>
        </div>
      </div>
    </div>
  );
}