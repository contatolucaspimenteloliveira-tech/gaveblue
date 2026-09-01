import { createClient } from 'npm:@supabase/supabase-js@2';
import { send, type PushError } from 'jsr:@daaku/webpush@0.2.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-wetasks-cron-secret',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

const json = (status: number, payload: unknown) => new Response(JSON.stringify(payload), {
  status,
  headers: { ...corsHeaders, 'content-type': 'application/json; charset=utf-8' }
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const publicKey = Deno.env.get('WETASKS_VAPID_PUBLIC_KEY') || '';
  if (req.method === 'GET') return json(200, { publicKey });
  if (req.method !== 'POST') return json(405, { error: 'Método não permitido.' });

  const cronSecret = Deno.env.get('WETASKS_CRON_SECRET') || '';
  if (!cronSecret || req.headers.get('x-wetasks-cron-secret') !== cronSecret) {
    return json(401, { error: 'Chamada não autorizada.' });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const privateKey = Deno.env.get('WETASKS_VAPID_PRIVATE_KEY') || '';
  const subscriber = Deno.env.get('WETASKS_VAPID_SUBJECT') || 'mailto:contato@gaveblue.com.br';
  if (!supabaseUrl || !serviceKey || !publicKey || !privateKey) {
    return json(503, { error: 'Notificações do WeTasks ainda não foram configuradas.' });
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const { data: dueTasks, error: claimError } = await admin.rpc('claim_due_wetasks_tasks', { batch_size: 100 });
  if (claimError) return json(500, { error: claimError.message });

  let delivered = 0;
  let failed = 0;
  for (const task of dueTasks || []) {
    const { data: subscriptions } = await admin
      .from('wetasks_push_subscriptions')
      .select('id,subscription')
      .eq('user_id', task.user_id)
      .eq('active', true);

    let taskDelivered = false;
    let lastError = '';
    for (const row of subscriptions || []) {
      try {
        await send(row.subscription, JSON.stringify({
          title: 'WeTasks • Tarefa agendada',
          body: task.due_time
            ? `“${task.title}” está agendada para ${String(task.due_time).slice(0, 5)}.`
            : `“${task.title}” está agendada para hoje.`,
          tag: `wetasks-${task.task_id}`,
          taskId: task.task_id,
          url: `/wetasks/?task=${encodeURIComponent(task.task_id)}`
        }), {
          vapid: privateKey,
          subscriber,
          ttl: 3600,
          urgency: task.priority === 'urgent' ? 'high' : 'normal',
          topic: `wetasks-${String(task.task_id).slice(-24)}`
        });
        taskDelivered = true;
        delivered += 1;
      } catch (error) {
        failed += 1;
        const pushError = error as PushError;
        lastError = pushError?.message || String(error);
        if (pushError?.permanent || pushError?.statusCode === 404 || pushError?.statusCode === 410) {
          await admin.from('wetasks_push_subscriptions').update({ active: false }).eq('id', row.id);
        }
      }
    }

    await admin.from('wetasks_tasks').update({
      notification_sent_at: taskDelivered ? new Date().toISOString() : null,
      notification_claimed_at: taskDelivered ? null : new Date(0).toISOString(),
      last_notification_error: taskDelivered ? null : (lastError || 'Nenhum dispositivo inscrito.')
    }).eq('user_id', task.user_id).eq('task_id', task.task_id);

    if (taskDelivered) {
      await admin.from('wetasks_notifications').upsert({
        id: `scheduled_${task.task_id}_${Date.now()}`,
        user_id: task.user_id,
        task_id: task.task_id,
        type: 'scheduled',
        message: `Lembrete enviado para “${task.title}”.`,
        is_read: false
      });
    }
  }

  return json(200, { processed: (dueTasks || []).length, delivered, failed });
});
