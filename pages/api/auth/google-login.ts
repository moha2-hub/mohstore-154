import type { NextApiRequest, NextApiResponse } from 'next';
import { loginWithGoogle } from '@/app/actions/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  try {
    const result = await loginWithGoogle(email);
    if (result.success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(401).json({ success: false, message: result.message });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
