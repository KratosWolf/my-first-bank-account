'use client';

export default function DashboardTest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          🏦 Banco da Família - Teste
        </h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-lg text-center">
            ✅ Servidor funcionando!
            <br />O problema estava na importação dos módulos de transação.
          </p>
        </div>
      </div>
    </div>
  );
}
