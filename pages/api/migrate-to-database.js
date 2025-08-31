import { supabase } from '../../src/lib/supabase';
import { StorageAdapter } from '../../src/lib/services/storage-adapter';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { parentEmail } = req.body;

  if (!parentEmail) {
    return res.status(400).json({ error: 'Parent email is required' });
  }

  try {
    console.log('🚀 Starting migration to database for:', parentEmail);

    // 1. Find or create family
    let { data: family, error: familyError } = await supabase
      .from('families')
      .select('*')
      .eq('parent_email', parentEmail)
      .single();

    if (familyError && familyError.code === 'PGRST116') {
      // Family doesn't exist, create it
      console.log('📝 Creating new family...');

      // Extract name from email or use a default
      const parentName = parentEmail.includes('@')
        ? parentEmail
            .split('@')[0]
            .replace(/[._]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
        : 'Parent';

      const { data: newFamily, error: createError } = await supabase
        .from('families')
        .insert([
          {
            parent_name: parentName,
            parent_email: parentEmail,
          },
        ])
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating family:', createError);
        return res.status(500).json({ error: createError.message });
      }

      family = newFamily;
      console.log('✅ Family created:', family.id);
    } else if (familyError) {
      console.error('❌ Error finding family:', familyError);
      return res.status(500).json({ error: familyError.message });
    } else {
      console.log('✅ Family found:', family.id);
    }

    // 2. Migrate localStorage data to database
    console.log('🔄 Migrating localStorage data...');
    const migrationSuccess = await StorageAdapter.migrateLocalStorageToSupabase(
      family.id
    );

    if (!migrationSuccess) {
      return res.status(500).json({
        error: 'Migration failed',
        family: family,
        success: false,
      });
    }

    // 3. Get migrated data summary
    const { data: children } = await supabase
      .from('children')
      .select('id, name, balance')
      .eq('family_id', family.id);

    const childrenSummary = children || [];
    const totalBalance = childrenSummary.reduce(
      (sum, child) => sum + child.balance,
      0
    );

    console.log('✅ Migration completed successfully');

    return res.json({
      success: true,
      message: 'Data migrated to database successfully!',
      family: family,
      children_count: childrenSummary.length,
      total_balance: totalBalance,
      children_summary: childrenSummary,
    });
  } catch (error) {
    console.error('❌ Migration error:', error);
    return res.status(500).json({
      error: error.message,
      success: false,
    });
  }
}
