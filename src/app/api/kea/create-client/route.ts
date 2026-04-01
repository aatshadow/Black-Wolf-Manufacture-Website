import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(request: Request) {
  try {
    const { name, slug, industry, language, status } = await request.json();

    if (!name || !slug) {
      return Response.json({ error: 'name and slug are required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: newOrg, error } = await supabase
      .from('organizations')
      .insert({
        name: name.trim(),
        slug: slug.trim(),
        industry: industry || 'manufacturing',
        language: language || 'en',
        status: status || 'active',
      })
      .select('*')
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({ success: true, organization: newOrg });
  } catch (error) {
    console.error('Create client error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
