-- ════════════════════════════════════════════════════════════════
-- TRIGGER DÜZELTMESİ — Supabase SQL Editor'da çalıştır
--
-- Sorun: Bu trigger fonksiyonları `security definer` değildi. Normal bir
-- kullanıcı bookmark eklediğinde / puan verdiğinde, trigger `series`
-- tablosunu güncellemeye çalışıyor; ama `series_update` RLS politikası
-- sadece admin'e izin verdiği için güncelleme SESSİZCE engelleniyordu.
-- Bu yüzden "Listede" sayısı ve puan ortalaması hep 0 kalıyordu.
--
-- Çözüm: Fonksiyonları `security definer` yap → tablo sahibinin
-- yetkisiyle çalışır ve RLS'i atlayarak series'i güncelleyebilir.
-- ════════════════════════════════════════════════════════════════

-- 1) Bölüm istatistikleri
create or replace function update_series_chapter_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
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

-- 2) Bookmark sayacı
create or replace function update_series_bookmark_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
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

-- 3) Puan ortalaması
create or replace function update_series_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update series set
    rating_count = (select count(*) from ratings where series_id = NEW.series_id),
    rating       = coalesce((select round(avg(rating)::numeric, 1) from ratings where series_id = NEW.series_id), 0)
  where id = NEW.series_id;
  return NEW;
end;
$$;

-- ── Mevcut (yanlış kalmış) sayaçları yeniden hesapla ───────────────
-- Geçmişte eklenmiş bookmark/puanların sayaçları 0 kaldıysa düzeltir.
update series s set
  bookmark_count = (select count(*) from bookmarks   b where b.series_id = s.id),
  rating_count   = (select count(*) from ratings     r where r.series_id = s.id),
  rating         = coalesce((select round(avg(r.rating)::numeric, 1) from ratings r where r.series_id = s.id), 0),
  chapter_count  = (select count(*) from chapters    c where c.series_id = s.id),
  latest_chapter = coalesce((select max(c.num) from chapters c where c.series_id = s.id), 0);
