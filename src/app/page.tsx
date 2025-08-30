export default function HomePage() {
  // Redirect to dashboard
  if (typeof window !== 'undefined') {
    window.location.href = '/dashboard';
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🏠</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Banco da Família</h1>
        <p className="text-gray-600 mb-4">Redirecting to dashboard...</p>
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
      </div>
    </div>
  );
}
