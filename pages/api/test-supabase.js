import { supabase } from '../../src/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action } = req.body;

  try {
    console.log('🧪 Testando Supabase:', action);

    switch (action) {
      case 'test-connection':
        // Testar conexão básica
        const { data, error } = await supabase
          .from('families')
          .select('id')
          .limit(1);

        if (error) {
          console.error('❌ Erro de conexão:', error);
          return res.status(500).json({ error: error.message, success: false });
        }

        return res.json({
          success: true,
          message: 'Conexão com Supabase funcionando!',
          data,
        });

      case 'create-test-family':
        // Criar família de teste
        const { data: family, error: familyError } = await supabase
          .from('families')
          .insert([
            {
              parent_name: 'Tiago Fernandes',
              parent_email: 'tifernandes@gmail.com',
            },
          ])
          .select()
          .single();

        if (familyError) {
          console.error('❌ Erro ao criar família:', familyError);
          return res
            .status(500)
            .json({ error: familyError.message, success: false });
        }

        return res.json({ success: true, message: 'Família criada!', family });

      case 'create-test-child':
        // Buscar família primeiro
        const { data: families } = await supabase
          .from('families')
          .select('id')
          .limit(1);

        if (!families || families.length === 0) {
          return res.status(400).json({
            error: 'Nenhuma família encontrada. Crie uma família primeiro.',
          });
        }

        // Criar criança de teste
        const { data: child, error: childError } = await supabase
          .from('children')
          .insert([
            {
              family_id: families[0].id,
              name: 'Teste Child',
              pin: '1234',
              avatar: '👧',
              balance: 0,
              total_earned: 0,
              total_spent: 0,
              level: 1,
              xp: 0,
            },
          ])
          .select()
          .single();

        if (childError) {
          console.error('❌ Erro ao criar criança:', childError);
          return res
            .status(500)
            .json({ error: childError.message, success: false });
        }

        return res.json({ success: true, message: 'Criança criada!', child });

      default:
        return res.status(400).json({ error: 'Ação não reconhecida' });
    }
  } catch (error) {
    console.error('❌ Erro geral:', error);
    return res.status(500).json({ error: error.message, success: false });
  }
}
