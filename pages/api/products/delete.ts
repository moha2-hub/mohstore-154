import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/app/actions/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ success: false, message: 'Product ID is required' });
  }

  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    await query('DELETE FROM products WHERE id = $1', [id]);
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('API Delete product error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete product' });
  }
}
