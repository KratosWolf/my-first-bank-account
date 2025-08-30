'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to system overview page for testing
    router.replace('/system-overview');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl animate-spin">
          🏦
        </div>
        <p className="text-gray-600 font-medium">Redirecionando para o Sistema Completo...</p>
        <p className="text-sm text-gray-500 mt-2">
          Use /system-overview para acessar todos os sistemas
        </p>
      </div>
    </div>
  );
}