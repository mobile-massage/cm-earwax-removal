-- Notifies the notify-new-submission Edge Function on new enquiries/reviews.
--
-- Uses a raw pg_net trigger rather than the dashboard's "Database Webhooks"
-- UI feature: on this project, that UI failed with
-- `ERROR: 3F000: schema "supabase_functions" does not exist` (the internal
-- schema it depends on was never provisioned). pg_net itself works fine once
-- enabled (Database > Extensions > pg_net), so calling net.http_post()
-- directly from a plain trigger function sidesteps the missing dependency.
--
-- Auth: the Edge Function has "Verify JWT with legacy secret" enabled
-- (the default). The publishable API key (same one used client-side in
-- src/supabase.ts) satisfies this check, so it doubles as the Authorization
-- bearer token here — no separate secret needed for this call.

create or replace function public.notify_new_submission()
returns trigger
language plpgsql
security definer
as $$
begin
  perform net.http_post(
    url := 'https://volydinbgoelrtfzbeck.supabase.co/functions/v1/notify-new-submission',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer sb_publishable_153a1iqYQdboXq2lJ7HpAg_m2sZT3IG'
    ),
    body := jsonb_build_object(
      'table', TG_TABLE_NAME,
      'record', row_to_json(NEW)
    )
  );
  return new;
end;
$$;

drop trigger if exists on_enquiry_insert on public.enquiries;
create trigger on_enquiry_insert
  after insert on public.enquiries
  for each row execute function public.notify_new_submission();

drop trigger if exists on_review_insert on public.reviews;
create trigger on_review_insert
  after insert on public.reviews
  for each row execute function public.notify_new_submission();
