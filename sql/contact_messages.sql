-- =====================================================================
-- Table `contact_messages` : stockage des messages envoyés depuis le
-- formulaire de contact public (src/pages/Contact.tsx).
--
-- À exécuter une seule fois dans l'éditeur SQL Supabase.
-- =====================================================================

create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  company     text,
  subject     text not null,
  message     text not null,
  service     text,
  status      text not null default 'new',   -- 'new' | 'read' | 'replied' | 'archived'
  ip_address  inet,
  user_agent  text,
  created_at  timestamptz not null default now()
);

-- Index utile pour le tri côté admin (les plus récents d'abord).
create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);

-- Index pour filtrer par statut dans une future inbox admin.
create index if not exists contact_messages_status_idx
  on public.contact_messages (status);

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.contact_messages enable row level security;

-- 1) Autoriser l'insertion anonyme (un visiteur non authentifié doit
--    pouvoir soumettre le formulaire). On n'autorise JAMAIS SELECT/UPDATE
--    anonyme sur cette table : seul un admin (ou une edge function avec
--    service-role key) peut lire/répondre.
drop policy if exists "anon can insert contact messages" on public.contact_messages;
create policy "anon can insert contact messages"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (true);

-- 2) (Optionnel) autoriser les utilisateurs authentifiés à relire leur
--    propre message. Décommenter si tu veux cette fonctionnalité.
-- drop policy if exists "user can read own contact messages" on public.contact_messages;
-- create policy "user can read own contact messages"
--   on public.contact_messages
--   for select
--   to authenticated
--   using (email = auth.jwt() ->> 'email');

-- =====================================================================
-- Notes d'opération
-- =====================================================================
-- Pour réceptionner les messages par email, ajouter un trigger Supabase
-- qui appelle une edge function (ou un webhook n8n / Zapier) à chaque
-- INSERT. Exemple minimal :
--
--   create or replace function public.notify_new_contact_message()
--   returns trigger language plpgsql security definer as $$
--   begin
--     perform net.http_post(
--       url     := 'https://<edge-function-url>',
--       headers := jsonb_build_object('Content-Type', 'application/json'),
--       body    := jsonb_build_object('record', row_to_json(new))
--     );
--     return new;
--   end;
--   $$;
--
--   drop trigger if exists on_new_contact_message on public.contact_messages;
--   create trigger on_new_contact_message
--     after insert on public.contact_messages
--     for each row execute function public.notify_new_contact_message();
