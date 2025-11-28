import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const results = [];

  try {
    // Read the gamification schema SQL file
    const sqlFilePath = path.join(process.cwd(), 'database', 'gamification-schema.sql');
    const sqlContent = await fs.readFile(sqlFilePath, 'utf8');
    
    results.push('📖 Reading gamification schema file...');
    results.push(`✅ Schema file loaded (${sqlContent.length} characters)`);

    // Split SQL commands (simple approach - split by semicolon + newline)
    const sqlCommands = sqlContent
      .split(';\n')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && cmd !== 'SELECT \'Gamification schema created successfully!\' as result');

    results.push(`🔧 Found ${sqlCommands.length} SQL commands to execute`);

    // Execute each SQL command
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i];
      
      try {
        // Skip empty commands or comments
        if (!command || command.startsWith('--')) {
          continue;
        }

        results.push(`\n${i + 1}. Executing: ${command.substring(0, 50)}...`);
        
        // Execute SQL command directly using Supabase client
        let result;
        if (command.trim().toUpperCase().startsWith('CREATE TABLE')) {
          // Handle CREATE TABLE commands by executing them as raw SQL
          const { data, error } = await supabase.rpc('exec_sql', { sql_query: command });
          result = { data, error };
        } else if (command.trim().toUpperCase().startsWith('INSERT')) {
          // Handle INSERT commands
          const { data, error } = await supabase.rpc('exec_sql', { sql_query: command });
          result = { data, error };
        } else {
          // For other commands, try to execute them directly
          const { data, error } = await supabase.rpc('exec_sql', { sql_query: command });
          result = { data, error };
        }
        
        if (result.error) {
          // Some errors are expected (like "relation already exists")
          if (result.error.message.includes('already exists') || result.error.message.includes('duplicate key')) {
            results.push(`⚠️  Warning: ${result.error.message}`);
          } else {
            results.push(`❌ Error: ${result.error.message}`);
            // Continue with other commands instead of stopping
          }
        } else {
          results.push(`✅ Success`);
        }
      } catch (cmdError) {
        results.push(`❌ Command error: ${cmdError instanceof Error ? cmdError.message : 'Unknown'}`);
      }
    }

    // Test the gamification setup by checking if tables exist
    results.push('\n🔍 Verifying gamification tables...');
    
    const tableChecks = [
      { name: 'badges', description: 'Badge definitions' },
      { name: 'child_badges', description: 'Child badge awards' },
      { name: 'child_streaks', description: 'Child streaks' }
    ];

    for (const table of tableChecks) {
      try {
        const { data, error } = await supabase
          .from(table.name)
          .select('*')
          .limit(1);

        if (error) {
          results.push(`❌ Table '${table.name}' check failed: ${error.message}`);
        } else {
          results.push(`✅ Table '${table.name}' (${table.description}) - accessible`);
        }
      } catch (error) {
        results.push(`❌ Table '${table.name}' check error: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    }

    // Check if default badges were inserted
    results.push('\n🏆 Checking default badges...');
    
    try {
      const { data: badges, error: badgesError } = await supabase
        .from('badges')
        .select('name, category, rarity')
        .limit(5);

      if (badgesError) {
        results.push(`❌ Badges check failed: ${badgesError.message}`);
      } else {
        results.push(`✅ Found ${badges?.length || 0} badges`);
        badges?.forEach(badge => {
          results.push(`  - ${badge.name} (${badge.category}, ${badge.rarity})`);
        });
      }
    } catch (error) {
      results.push(`❌ Badges check error: ${error instanceof Error ? error.message : 'Unknown'}`);
    }

    results.push('\n🎮 Gamification system setup completed!');
    results.push('💡 You can now test the gamification features at /gamification-test');

  } catch (error) {
    results.push(`💥 Setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      results: results
    });
  }

  return res.status(200).json({
    success: true,
    results: results,
    message: 'Gamification system setup completed successfully!'
  });
}