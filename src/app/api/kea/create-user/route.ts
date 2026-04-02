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
    const { email, password, fullName, organizationId, role } = await request.json();

    if (!fullName || !organizationId) {
      return Response.json(
        { error: 'fullName and organizationId are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Generate email if not provided (Supabase auth requires email)
    const userEmail = email?.trim() || `${fullName.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now()}@kea-internal.local`;
    const userPassword = password?.trim() || `KEA-${crypto.randomUUID().slice(0, 12)}`;

    // Step 1: Create auth user (required because user_profiles.id references auth.users)
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: userEmail,
      password: userPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        organization_id: organizationId,
        role: role || 'viewer',
      },
    });

    if (authError || !authUser?.user) {
      return Response.json({ error: authError?.message || 'Failed to create auth user' }, { status: 400 });
    }

    // Step 2: Create user_profile with the auth user's id
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authUser.user.id,
        organization_id: organizationId,
        full_name: fullName,
        role: role || 'viewer',
        track_access: [],
        language: 'en',
      });

    if (profileError) {
      // Rollback: delete the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return Response.json({ error: profileError.message }, { status: 400 });
    }

    return Response.json({
      success: true,
      userId: authUser.user.id,
      email: userEmail,
      hasCustomPassword: !!password?.trim(),
    });
  } catch (error) {
    console.error('Create user error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return Response.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Delete related data first (messages, sessions, injected_questions, profile)
    await supabase.from('messages').delete().eq('user_id', userId);
    await supabase.from('sessions').delete().eq('user_id', userId);
    await supabase.from('injected_questions').delete().eq('asked_by', userId);
    await supabase.from('user_profiles').delete().eq('id', userId);

    // Finally delete auth user
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
