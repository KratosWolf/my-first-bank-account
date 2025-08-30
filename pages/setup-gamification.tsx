import { useState } from 'react';

export default function SetupGamification() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (result: string) => {
    setResults(prev => [...prev, result]);
  };

  const setupGamification = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      addResult('🎮 Starting gamification setup...');
      
      const response = await fetch('/api/setup-gamification-simple', {
        method: 'POST',
      });
      
      const result = await response.json();
      
      if (result.results) {
        result.results.forEach((msg: string) => addResult(msg));
      }
      
      if (result.success) {
        addResult('✅ Setup completed successfully!');
      } else {
        addResult(`❌ Setup failed: ${result.error}`);
      }
      
    } catch (error) {
      addResult(`💥 Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            🎮 Gamification System Setup
          </h1>
          
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h2 className="font-semibold text-blue-900 mb-2">📋 Manual Setup Required</h2>
              <p className="text-blue-800 text-sm">
                Before running the setup, you need to create the gamification tables manually in Supabase:
              </p>
              <ol className="list-decimal list-inside text-sm text-blue-800 mt-2 space-y-1">
                <li>Go to your Supabase project dashboard</li>
                <li>Navigate to the SQL Editor</li>
                <li>Copy the contents of <code>database/gamification-schema.sql</code></li>
                <li>Paste and execute the SQL</li>
                <li>Then click the button below to insert default badges</li>
              </ol>
            </div>
            
            <button
              onClick={setupGamification}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              {loading ? '⏳ Setting up...' : '🚀 Setup Gamification'}
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Setup Results</h2>
            <div className="bg-gray-900 text-green-400 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
              {results.length === 0 ? (
                <div className="text-gray-500">Click the setup button to begin...</div>
              ) : (
                results.map((result, index) => (
                  <div key={index} className="mb-1">
                    {result}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <h2 className="font-semibold mb-3">SQL Schema to Execute in Supabase:</h2>
            <div className="bg-gray-100 rounded-lg p-4 text-sm font-mono overflow-x-auto">
              <pre>{`-- Gamification System Schema
-- Copy this entire code block to Supabase SQL Editor

-- Badges table - Define available badges
CREATE TABLE IF NOT EXISTS badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(10) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('saving', 'spending', 'earning', 'goal', 'streak', 'level', 'special')),
  criteria JSONB NOT NULL,
  rarity VARCHAR(20) NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  xp_reward INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Child Badges - Track which badges each child has earned
CREATE TABLE IF NOT EXISTS child_badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(child_id, badge_id)
);

-- Streaks table - Track child activity streaks
CREATE TABLE IF NOT EXISTS child_streaks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  streak_type VARCHAR(30) NOT NULL CHECK (streak_type IN ('daily_save', 'weekly_goal', 'transaction_log', 'lesson_complete')),
  current_count INTEGER DEFAULT 0,
  best_count INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(child_id, streak_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_child_badges_child_id ON child_badges(child_id);
CREATE INDEX IF NOT EXISTS idx_child_badges_badge_id ON child_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_child_streaks_child_id ON child_streaks(child_id);
CREATE INDEX IF NOT EXISTS idx_badges_category ON badges(category);
CREATE INDEX IF NOT EXISTS idx_badges_rarity ON badges(rarity);

SELECT 'Gamification tables created successfully!' as result;`}</pre>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <div className="flex space-x-4">
              <a
                href="/test-database"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors inline-block"
              >
                ← Back to Database Test
              </a>
              
              <a
                href="/gamification-test"
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-block"
              >
                Test Gamification Features →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}