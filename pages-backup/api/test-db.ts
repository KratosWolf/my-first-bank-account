import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('families')
      .select('count')
      .limit(1);

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Database connection failed - tables may not exist yet'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Database connection successful!',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to connect to database'
    });
  }
}