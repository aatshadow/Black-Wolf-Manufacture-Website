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
    const sessionId = searchParams.get('sessionId');

    if (!orgId && !sessionId) {
      return Response.json({ error: 'organizationId or sessionId is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // ── If sessionId: return session + messages + block progress ──
    if (sessionId) {
      const { data: session } = await supabase
        .from('sessions')
        .select('*, track:tracks(id, name, code, conversation_style)')
        .eq('id', sessionId)
        .single();

      if (!session) {
        return Response.json({ error: 'Session not found' }, { status: 404 });
      }

      const { data: messages } = await supabase
        .from('messages')
        .select('id, role, content, created_at')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      // Block progress
      const trackId = session.track_id;
      const { data: blocks } = await supabase
        .from('schema_blocks')
        .select('id, name, code')
        .eq('track_id', trackId)
        .order('display_order');

      let blockProgress: Array<{ id: string; name: string; code: string; completeness_pct: number }> = [];
      let entities: Array<{ instance_label: string; completeness_pct: number }> = [];

      if (blocks?.length) {
        const blockIds = blocks.map((b) => b.id);
        const { data: instances } = await supabase
          .from('extraction_instances')
          .select('block_id, completeness_pct, instance_label')
          .in('block_id', blockIds);

        const instanceMap = new Map(
          (instances || []).map((i) => [i.block_id, i.completeness_pct])
        );

        blockProgress = blocks.map((b) => ({
          id: b.id,
          name: b.name,
          code: b.code,
          completeness_pct: instanceMap.get(b.id) || 0,
        }));

        entities = (instances || [])
          .filter((i) => i.instance_label)
          .map((i) => ({
            instance_label: i.instance_label,
            completeness_pct: i.completeness_pct,
          }));
      }

      return Response.json({ session, messages: messages || [], blocks: blockProgress, entities });
    }

    // ── Org-level: return tracks + sessions + stats ──
    const { data: org } = await supabase
      .from('organizations')
      .select('active_template_id')
      .eq('id', orgId)
      .single();

    if (!org?.active_template_id) {
      return Response.json({ tracks: [], sessions: [], trackStats: {} });
    }

    const { data: tracks } = await supabase
      .from('tracks')
      .select('id, name, code, description, conversation_style')
      .eq('template_id', org.active_template_id)
      .order('display_order');

    if (!tracks?.length) {
      return Response.json({ tracks: [], sessions: [], trackStats: {} });
    }

    const trackIds = tracks.map((t) => t.id);

    // Sessions
    const { data: sessions } = await supabase
      .from('sessions')
      .select('id, status, summary, created_at, track_id')
      .in('track_id', trackIds)
      .order('created_at', { ascending: false })
      .limit(10);

    // Build track name/code lookup for sessions
    const trackMap = new Map(tracks.map((t) => [t.id, { name: t.name, code: t.code }]));
    const enrichedSessions = (sessions || []).map((s) => ({
      ...s,
      trackName: trackMap.get(s.track_id)?.name,
      trackCode: trackMap.get(s.track_id)?.code,
    }));

    // Stats per track
    const trackStats: Record<string, { sessions: number; completion: number }> = {};

    for (const track of tracks) {
      const { count } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('track_id', track.id);

      // Get blocks for this track
      const { data: blocks } = await supabase
        .from('schema_blocks')
        .select('id')
        .eq('track_id', track.id);

      let completion = 0;
      if (blocks?.length) {
        const blockIds = blocks.map((b) => b.id);

        const { count: totalFields } = await supabase
          .from('schema_fields')
          .select('*', { count: 'exact', head: true })
          .in('block_id', blockIds);

        const { data: instances } = await supabase
          .from('extraction_instances')
          .select('data')
          .eq('organization_id', orgId!)
          .in('block_id', blockIds);

        let filled = 0;
        if (instances) {
          for (const inst of instances) {
            const data = inst.data as Record<string, unknown> | null;
            if (data) filled += Object.values(data).filter((v) => v != null && v !== '').length;
          }
        }

        completion = totalFields ? Math.round((filled / totalFields) * 100) : 0;
      }

      trackStats[track.id] = { sessions: count || 0, completion };
    }

    return Response.json({
      tracks,
      sessions: enrichedSessions,
      trackStats,
    });
  } catch (error) {
    console.error('Chat data API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update session status
export async function PATCH(request: Request) {
  try {
    const { sessionId, status } = await request.json();

    if (!sessionId || !status) {
      return Response.json({ error: 'sessionId and status required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('sessions')
      .update({ status })
      .eq('id', sessionId);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Session update error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
