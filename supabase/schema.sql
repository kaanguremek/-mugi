-- İmugi Supabase Schema — SQL Editor'da çalıştır

-- 1. Profiller
create table if not exists profiles (
  id                 uuid references auth.users on delete cascade primary key,
  username           text unique not null,
  avatar_url         text,
  equipped_frame     text,
  equipped_accessory text,
  show_badge         boolean default true,
  vip_points         integer default 0,
  shop_balance       integer default 0,
  last_daily_claim   date,
  is_premium         boolean default false,
  is_admin           boolean default false,
  created_at         timestamptz default now()
);

-- Yeni kayıt → otomatik profil
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1)));
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function handle_new_user();

-- 2. Seriler
create table if not exists series (
  id              uuid default gen_random_uuid() primary key,
  slug            text unique not null,
  title           text not null,
  description     text,
  cover_url       text,
  status          text default 'ongoing',
  genres          text[] default '{}',
  author          text,
  chapter_count   integer default 0,
  latest_chapter  numeric default 0,
  bookmark_count  integer default 0,
  view_count      integer default 0,
  rating          numeric default 0,
  rating_count    integer default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- 3. Bölümler
create table if not exists chapters (
  id         uuid default gen_random_uuid() primary key,
  series_id  uuid references series on delete cascade,
  num        numeric not null,
  title      text,
  pages      text[] default '{}',
  created_at timestamptz default now(),
  unique(series_id, num)
);

-- Bölüm eklenince/silinince seri istatistiklerini güncelle
create or replace function update_series_chapter_stats()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'DELETE' then
    update series set
      chapter_count  = (select count(*) from chapters where series_id = OLD.series_id),
      latest_chapter = coalesce((select max(num) from chapters where series_id = OLD.series_id), 0),
      updated_at     = now()
    where id = OLD.series_id;
    return OLD;
  else
    update series set
      chapter_count  = (select count(*) from chapters where series_id = NEW.series_id),
      latest_chapter = coalesce((select max(num) from chapters where series_id = NEW.series_id), 0),
      updated_at     = now()
    where id = NEW.series_id;
    return NEW;
  end if;
end;
$$;
drop trigger if exists on_chapter_change on chapters;
create trigger on_chapter_change
  after insert or delete on chapters
  for each row execute function update_series_chapter_stats();

-- 4. Bookmarks
create table if not exists bookmarks (
  user_id    uuid references auth.users on delete cascade,
  series_id  uuid references series on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, series_id)
);

-- Bookmark eklenince/silinince seri sayacını güncelle
create or replace function update_series_bookmark_count()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'DELETE' then
    update series set bookmark_count = greatest(0, bookmark_count - 1) where id = OLD.series_id;
    return OLD;
  else
    update series set bookmark_count = bookmark_count + 1 where id = NEW.series_id;
    return NEW;
  end if;
end;
$$;
drop trigger if exists on_bookmark_change on bookmarks;
create trigger on_bookmark_change
  after insert or delete on bookmarks
  for each row execute function update_series_bookmark_count();

-- 5. Yorumlar
create table if not exists comments (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users on delete cascade,
  series_id  uuid references series on delete cascade,
  content    text not null,
  likes      uuid[] default '{}',
  dislikes   uuid[] default '{}',
  username   text,
  avatar_url text,
  frame_url  text,
  is_premium boolean default false,
  created_at timestamptz default now()
);

-- 6. Yanıtlar
create table if not exists replies (
  id         uuid default gen_random_uuid() primary key,
  comment_id uuid references comments on delete cascade,
  user_id    uuid references auth.users on delete cascade,
  content    text not null,
  likes      uuid[] default '{}',
  dislikes   uuid[] default '{}',
  username   text,
  avatar_url text,
  frame_url  text,
  is_premium boolean default false,
  created_at timestamptz default now()
);

-- 7. Bildirimler
create table if not exists notifications (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users on delete cascade,
  type       text not null,
  title      text not null,
  body       text,
  link       text,
  read       boolean default false,
  created_at timestamptz default now()
);

-- 8. Okuma geçmişi
create table if not exists read_history (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users on delete cascade,
  series_id   uuid references series on delete cascade,
  chapter_num numeric not null,
  read_at     timestamptz default now(),
  unique(user_id, series_id, chapter_num)
);

-- 9. Değerlendirmeler
create table if not exists ratings (
  user_id    uuid references auth.users on delete cascade,
  series_id  uuid references series on delete cascade,
  rating     numeric not null,
  created_at timestamptz default now(),
  primary key (user_id, series_id)
);

-- Rating güncellenince seri ortalamasını güncelle
create or replace function update_series_rating()
returns trigger language plpgsql as $$
begin
  update series set
    rating_count = (select count(*) from ratings where series_id = NEW.series_id),
    rating       = coalesce((select round(avg(rating)::numeric, 1) from ratings where series_id = NEW.series_id), 0)
  where id = NEW.series_id;
  return NEW;
end;
$$;
drop trigger if exists on_rating_change on ratings;
create trigger on_rating_change
  after insert or update on ratings
  for each row execute function update_series_rating();

-- ── RLS ──────────────────────────────────────────────────────────
alter table profiles      enable row level security;
alter table series        enable row level security;
alter table chapters      enable row level security;
alter table bookmarks     enable row level security;
alter table comments      enable row level security;
alter table replies       enable row level security;
alter table notifications enable row level security;
alter table read_history  enable row level security;
alter table ratings       enable row level security;

-- Profiles
drop policy if exists "profiles_select"      on profiles;
drop policy if exists "profiles_update"      on profiles;
create policy "profiles_select" on profiles  for select using (true);
create policy "profiles_update" on profiles  for update
  using (
    auth.uid() = id
    or (select is_admin from profiles where id = auth.uid()) = true
  );

-- Series (herkes okur, sadece admin yazar)
drop policy if exists "series_select"        on series;
drop policy if exists "series_all_service"   on series;
create policy "series_select" on series for select using (true);
create policy "series_insert" on series for insert
  with check ((select is_admin from profiles where id = auth.uid()) = true);
create policy "series_update" on series for update
  using ((select is_admin from profiles where id = auth.uid()) = true);
create policy "series_delete" on series for delete
  using ((select is_admin from profiles where id = auth.uid()) = true);

-- Chapters (herkes okur, sadece admin yazar)
drop policy if exists "chapters_select"      on chapters;
drop policy if exists "chapters_all_service" on chapters;
create policy "chapters_select" on chapters for select using (true);
create policy "chapters_insert" on chapters for insert
  with check ((select is_admin from profiles where id = auth.uid()) = true);
create policy "chapters_update" on chapters for update
  using ((select is_admin from profiles where id = auth.uid()) = true);
create policy "chapters_delete" on chapters for delete
  using ((select is_admin from profiles where id = auth.uid()) = true);

-- Bookmarks
drop policy if exists "bookmarks_all"        on bookmarks;
create policy "bookmarks_all" on bookmarks for all using (auth.uid() = user_id);

-- Comments
drop policy if exists "comments_select"      on comments;
drop policy if exists "comments_insert"      on comments;
drop policy if exists "comments_update"      on comments;
drop policy if exists "comments_delete"      on comments;
create policy "comments_select" on comments  for select using (true);
create policy "comments_insert" on comments  for insert with check (auth.uid() = user_id);
create policy "comments_update" on comments  for update using (auth.uid() = user_id);
create policy "comments_delete" on comments  for delete
  using (auth.uid() = user_id or (select is_admin from profiles where id = auth.uid()) = true);

-- Replies
drop policy if exists "replies_select"       on replies;
drop policy if exists "replies_insert"       on replies;
drop policy if exists "replies_delete"       on replies;
create policy "replies_select" on replies    for select using (true);
create policy "replies_insert" on replies    for insert with check (auth.uid() = user_id);
create policy "replies_delete" on replies    for delete
  using (auth.uid() = user_id or (select is_admin from profiles where id = auth.uid()) = true);

-- Notifications
drop policy if exists "notifs_all"           on notifications;
create policy "notifs_own"   on notifications for select using (auth.uid() = user_id);
create policy "notifs_update" on notifications for update using (auth.uid() = user_id);
create policy "notifs_insert" on notifications for insert
  with check (
    auth.uid() = user_id
    or (select is_admin from profiles where id = auth.uid()) = true
  );

-- Read history
drop policy if exists "history_all"          on read_history;
create policy "history_all" on read_history  for all using (auth.uid() = user_id);

-- Ratings
drop policy if exists "ratings_select"       on ratings;
drop policy if exists "ratings_all"          on ratings;
create policy "ratings_select" on ratings    for select using (true);
create policy "ratings_all"    on ratings    for all   using (auth.uid() = user_id);

-- ── STORAGE (Dashboard'dan da yapılabilir) ────────────────────────
-- Bucket oluşturma: Dashboard → Storage → New bucket → "covers" (public) ve "chapters" (public)
-- Aşağıdaki SQL'leri Storage → Policies kısmında çalıştır:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('covers', 'covers', true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('chapters', 'chapters', true) ON CONFLICT DO NOTHING;

-- Storage policies (herkes okur, sadece admin yazar)
-- create policy "storage_covers_read"   on storage.objects for select using (bucket_id = 'covers');
-- create policy "storage_covers_write"  on storage.objects for insert with check (bucket_id = 'covers' and (select is_admin from profiles where id = auth.uid()) = true);
-- create policy "storage_chapters_read" on storage.objects for select using (bucket_id = 'chapters');
-- create policy "storage_chapters_write" on storage.objects for insert with check (bucket_id = 'chapters' and (select is_admin from profiles where id = auth.uid()) = true);
