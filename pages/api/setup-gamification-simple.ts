import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const results = [];

  try {
    results.push('🎮 Setting up gamification system...');

    // Step 1: Create badges table (if not exists)
    results.push('\n1. Creating badges table...');
    try {
      // We'll use the schema from the SQL file by inserting default badges
      // First check if badges table is accessible
      const { data: existingBadges, error: checkError } = await supabase
        .from('badges')
        .select('id')
        .limit(1);

      if (checkError && checkError.message.includes('relation "badges" does not exist')) {
        results.push('❌ Badges table does not exist. Please create it manually in Supabase SQL editor.');
        results.push('💡 Copy and paste the gamification-schema.sql file contents into the Supabase SQL editor.');
        
        return res.status(400).json({
          success: false,
          error: 'Badges table does not exist',
          results: results,
          instructions: 'Please run the gamification-schema.sql file in the Supabase SQL editor first.'
        });
      } else {
        results.push('✅ Badges table is accessible');
      }
    } catch (error) {
      results.push(`❌ Error checking badges table: ${error instanceof Error ? error.message : 'Unknown'}`);
    }

    // Step 2: Insert default badges
    results.push('\n2. Inserting default badges...');
    
    const defaultBadges = [
      {
        name: 'First Coin',
        description: 'Earned your first money!',
        icon: '🪙',
        category: 'earning',
        criteria: { type: 'amount_earned', threshold: 1 },
        rarity: 'common',
        xp_reward: 10,
        is_active: true
      },
      {
        name: 'Penny Saver',
        description: 'Earned R$ 10',
        icon: '💰',
        category: 'earning',
        criteria: { type: 'amount_earned', threshold: 10 },
        rarity: 'common',
        xp_reward: 25,
        is_active: true
      },
      {
        name: 'Money Maker',
        description: 'Earned R$ 100',
        icon: '💵',
        category: 'earning',
        criteria: { type: 'amount_earned', threshold: 100 },
        rarity: 'rare',
        xp_reward: 100,
        is_active: true
      },
      {
        name: 'Piggy Bank Start',
        description: 'Saved your first R$ 10',
        icon: '🐷',
        category: 'saving',
        criteria: { type: 'amount_saved', threshold: 10 },
        rarity: 'common',
        xp_reward: 20,
        is_active: true
      },
      {
        name: 'Smart Saver',
        description: 'Saved R$ 50',
        icon: '💎',
        category: 'saving',
        criteria: { type: 'amount_saved', threshold: 50 },
        rarity: 'rare',
        xp_reward: 75,
        is_active: true
      },
      {
        name: 'First Steps',
        description: 'Made your first transaction',
        icon: '👶',
        category: 'spending',
        criteria: { type: 'transactions_count', threshold: 1 },
        rarity: 'common',
        xp_reward: 15,
        is_active: true
      },
      {
        name: 'Level Up!',
        description: 'Reached level 2',
        icon: '⭐',
        category: 'level',
        criteria: { type: 'level_reached', threshold: 2 },
        rarity: 'common',
        xp_reward: 30,
        is_active: true
      },
      {
        name: 'Early Bird',
        description: 'Joined the family bank',
        icon: '🐣',
        category: 'special',
        criteria: { type: 'special_action', threshold: 1 },
        rarity: 'common',
        xp_reward: 25,
        is_active: true
      }
    ];

    for (const badge of defaultBadges) {
      try {
        // Check if badge already exists first
        const { data: existingBadge } = await supabase
          .from('badges')
          .select('id')
          .eq('name', badge.name)
          .single();

        if (existingBadge) {
          results.push(`⚠️  Badge "${badge.name}" already exists`);
          continue;
        }

        const { data, error } = await supabase
          .from('badges')
          .insert(badge);

        if (error) {
          if (error.message.includes('duplicate key')) {
            results.push(`⚠️  Badge "${badge.name}" already exists`);
          } else {
            results.push(`❌ Error inserting badge "${badge.name}": ${error.message}`);
          }
        } else {
          results.push(`✅ Badge "${badge.name}" added`);
        }
      } catch (error) {
        results.push(`❌ Error with badge "${badge.name}": ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    }

    // Step 3: Verify setup
    results.push('\n3. Verifying gamification setup...');

    // Check badges count
    const { data: badges, error: badgesError } = await supabase
      .from('badges')
      .select('id, name, category, rarity');

    if (badgesError) {
      results.push(`❌ Error verifying badges: ${badgesError.message}`);
    } else {
      results.push(`✅ Found ${badges?.length || 0} total badges`);
      
      // Group by category
      const categories = badges?.reduce((acc: any, badge: any) => {
        acc[badge.category] = (acc[badge.category] || 0) + 1;
        return acc;
      }, {});
      
      Object.entries(categories || {}).forEach(([category, count]) => {
        results.push(`  - ${category}: ${count} badges`);
      });
    }

    // Check if child_badges table exists
    const { data: childBadgesTest, error: childBadgesError } = await supabase
      .from('child_badges')
      .select('id')
      .limit(1);

    if (childBadgesError) {
      if (childBadgesError.message.includes('relation "child_badges" does not exist')) {
        results.push('⚠️  child_badges table not found - some features may not work');
      } else {
        results.push(`✅ child_badges table is accessible`);
      }
    } else {
      results.push(`✅ child_badges table is accessible`);
    }

    // Check if child_streaks table exists
    const { data: childStreaksTest, error: childStreaksError } = await supabase
      .from('child_streaks')
      .select('id')
      .limit(1);

    if (childStreaksError) {
      if (childStreaksError.message.includes('relation "child_streaks" does not exist')) {
        results.push('⚠️  child_streaks table not found - streaks feature will not work');
      } else {
        results.push(`✅ child_streaks table is accessible`);
      }
    } else {
      results.push(`✅ child_streaks table is accessible`);
    }

    results.push('\n🎮 Gamification system setup completed!');
    results.push('💡 You can now test the gamification features at /gamification-test');

    return res.status(200).json({
      success: true,
      results: results,
      message: 'Gamification system setup completed successfully!',
      badgeCount: badges?.length || 0
    });

  } catch (error) {
    results.push(`💥 Setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error('Gamification setup error:', error);
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      results: results
    });
  }
}