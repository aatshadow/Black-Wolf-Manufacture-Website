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
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('organizationId');

    if (!orgId) {
      return Response.json({ error: 'organizationId is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Load org with template
    const { data: org } = await supabase
      .from('organizations')
      .select('*, template:templates!active_template_id(*)')
      .eq('id', orgId)
      .single();

    if (!org) {
      return Response.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Stats
    const [
      { count: sessionCount },
      { count: userCount },
      { count: alertCount },
    ] = await Promise.all([
      supabase.from('sessions').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
      supabase.from('user_profiles').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
      supabase.from('alerts').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'open'),
    ]);

    // Last session
    const { data: lastSession } = await supabase
      .from('sessions')
      .select('created_at, status')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(1);

    // Tracks with progress
    interface TrackProgress {
      id: string;
      name: string;
      code: string;
      totalFields: number;
      filledFields: number;
      completion: number;
      blockCount: number;
      sessions: number;
    }

    const trackProgress: TrackProgress[] = [];
    let totalFields = 0;
    let totalFilled = 0;

    if (org.active_template_id) {
      const { data: tracks } = await supabase
        .from('tracks')
        .select('id, name, code, display_order')
        .eq('template_id', org.active_template_id)
        .order('display_order');

      if (tracks) {
        for (const track of tracks) {
          // Get blocks and fields
          const { data: blocks } = await supabase
            .from('schema_blocks')
            .select('id')
            .eq('track_id', track.id);

          const blockIds = (blocks || []).map((b) => b.id);
          let trackTotalFields = 0;
          let trackFilledFields = 0;

          if (blockIds.length > 0) {
            // Count total fields
            const { count: fieldCount } = await supabase
              .from('schema_fields')
              .select('*', { count: 'exact', head: true })
              .in('block_id', blockIds);

            trackTotalFields = fieldCount || 0;

            // Count filled fields from extraction instances
            const { data: instances } = await supabase
              .from('extraction_instances')
              .select('data')
              .eq('organization_id', orgId)
              .in('block_id', blockIds);

            if (instances) {
              for (const inst of instances) {
                const data = inst.data as Record<string, unknown> | null;
                if (data) {
                  trackFilledFields += Object.values(data).filter((v) => v != null && v !== '').length;
                }
              }
            }
          }

          // Track sessions
          const { count: trackSessions } = await supabase
            .from('sessions')
            .select('*', { count: 'exact', head: true })
            .eq('track_id', track.id);

          totalFields += trackTotalFields;
          totalFilled += trackFilledFields;

          trackProgress.push({
            id: track.id,
            name: track.name,
            code: track.code,
            totalFields: trackTotalFields,
            filledFields: trackFilledFields,
            completion: trackTotalFields > 0 ? Math.round((trackFilledFields / trackTotalFields) * 100) : 0,
            blockCount: blockIds.length,
            sessions: trackSessions || 0,
          });
        }
      }
    }

    return Response.json({
      sessions: sessionCount || 0,
      users: userCount || 0,
      alerts: alertCount || 0,
      lastActivity: lastSession?.[0]?.created_at || null,
      totalFields,
      filledFields: totalFilled,
      globalCompletion: totalFields > 0 ? Math.round((totalFilled / totalFields) * 100) : 0,
      tracks: trackProgress,
    });
  } catch (error) {
    console.error('Client progress error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
