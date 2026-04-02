import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET(request: Request) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const orgUsersId = searchParams.get('usersForOrg');

    // If requesting users for a specific org
    if (orgUsersId) {
      const { data } = await supabase
        .from('user_profiles')
        .select('id, full_name, role, created_at')
        .eq('organization_id', orgUsersId)
        .order('created_at', { ascending: true });
      return Response.json({ users: data || [] });
    }

    const [
      { data: organizations },
      { data: templates },
    ] = await Promise.all([
      supabase.from('organizations').select('*').order('created_at', { ascending: false }),
      supabase.from('templates').select('id, name, industry, organization_id').order('created_at', { ascending: false }),
    ]);

    return Response.json({
      organizations: organizations || [],
      templates: templates || [],
    });
  } catch (error) {
    console.error('Admin data error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
