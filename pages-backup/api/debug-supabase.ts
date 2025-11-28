import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const results = [];

  try {
    // Test 1: Check if we can list tables
    results.push('🔍 Testing table access...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      results.push(`❌ Tables query error: ${tablesError.message}`);
    } else {
      results.push(`✅ Found ${tables?.length || 0} tables`);
      tables?.forEach(table => results.push(`  - ${table.table_name}`));
    }

    // Test 2: Try to insert into families table directly
    results.push('\n💾 Testing families table insert...');
    
    const { data: familyData, error: familyError } = await supabase
      .from('families')
      .insert({
        parent_name: 'Debug Test',
        parent_email: `debug-${Date.now()}@test.com`
      })
      .select()
      .single();

    if (familyError) {
      results.push(`❌ Family insert error: ${familyError.message}`);
      results.push(`   Details: ${JSON.stringify(familyError, null, 2)}`);
    } else {
      results.push(`✅ Family created: ${familyData.id}`);

      // Test 3: Try to insert child
      results.push('\n👶 Testing children table insert...');
      
      const { data: childData, error: childError } = await supabase
        .from('children')
        .insert({
          family_id: familyData.id,
          name: 'Debug Child',
          pin: '9999',
          avatar: '👶'
        })
        .select()
        .single();

      if (childError) {
        results.push(`❌ Child insert error: ${childError.message}`);
        results.push(`   Details: ${JSON.stringify(childError, null, 2)}`);
      } else {
        results.push(`✅ Child created: ${childData.id}`);
      }
    }

    // Test 4: Check RLS policies
    results.push('\n🔒 Checking RLS status...');
    
    const { data: rlsData, error: rlsError } = await supabase
      .rpc('check_rls_status');
    
    if (rlsError) {
      results.push(`⚠️  RLS check failed: ${rlsError.message}`);
    } else {
      results.push(`📋 RLS data: ${JSON.stringify(rlsData)}`);
    }

  } catch (error) {
    results.push(`💥 Unexpected error: ${error instanceof Error ? error.message : 'Unknown'}`);
  }

  return res.status(200).json({
    success: true,
    results: results,
    environment: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV
    }
  });
}