import { createClient } from '@/utils/supabase/server';

export async function checkAndConsumeCredit(): Promise<{ allowed: boolean; error?: string }> {
  if (process.env.NODE_ENV === 'development') {
    return { allowed: true };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { allowed: false, error: 'Authentication required' };
  }

  const { data: allowed, error } = await supabase.rpc('consume_ai_credit', { user_id_param: user.id });

  if (error || !allowed) {
    return { allowed: false, error: 'Insufficient credits. Please upgrade your plan.' };
  }

  return { allowed: true };
}
