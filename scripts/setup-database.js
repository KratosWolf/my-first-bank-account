const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need this for admin operations

async function setupDatabase() {
  console.log('🗃️  Setting up database...');
  
  if (!supabaseServiceKey) {
    console.log('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment');
    console.log('📋 Please go to Supabase Dashboard and run the SQL manually:');
    console.log('1. Go to: https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to SQL Editor');
    console.log('4. Paste the content of database/schema.sql');
    console.log('5. Click RUN');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📋 Executing SQL schema...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: schema });
    
    if (error) {
      console.error('❌ Error executing schema:', error);
    } else {
      console.log('✅ Database schema created successfully!');
    }
  } catch (error) {
    console.error('❌ Failed to setup database:', error.message);
  }
}

setupDatabase();