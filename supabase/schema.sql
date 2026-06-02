-- ═══════════════════════════════════════════════
-- MANHWA SİTESİ - VERİTABANI ŞEMASI
-- Supabase SQL Editor'a yapıştır ve çalıştır
-- ═══════════════════════════════════════════════

-- Uzantılar
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- fuzzy search için

-- ── KULLANICILAR ────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── SERİLER ────────────────────────────────────
CREATE TABLE IF NOT EXISTS series (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug          TEXT UNIQUE NOT NULL,          -- url-friendly isim
  title         TEXT NOT NULL,
  alt_titles    TEXT[],                         -- alternatif isimler
  description   TEXT,
  cover_url     TEXT,
  banner_url    TEXT,                           -- hero için büyük görsel
  status        TEXT NOT NULL DEFAULT 'ongoing'
                  CHECK (status IN ('ongoing', 'completed', 'hiatus', 'cancelled')),
  type          TEXT NOT NULL DEFAULT 'manhwa'
                  CHECK (type IN ('manhwa', 'manga', 'manhua', 'webtoon')),
  author        TEXT,
  artist        TEXT,
  release_year  INTEGER,
  rating        NUMERIC(3,1) DEFAULT 0,
  rating_count  INTEGER DEFAULT 0,
  view_count    BIGINT DEFAULT 0,
  bookmark_count INTEGER DEFAULT 0,
  is_featured   BOOLEAN DEFAULT FALSE,         -- hero slider'da göster
  is_adult      BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── TÜRLER ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS genres (
  id    SERIAL PRIMARY KEY,
  name  TEXT UNIQUE NOT NULL,
  slug  TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS series_genres (
  series_id  UUID REFERENCES series(id) ON DELETE CASCADE,
  genre_id   INTEGER REFERENCES genres(id) ON DELETE CASCADE,
  PRIMARY KEY (series_id, genre_id)
);

-- ── BÖLÜMLER ───────────────────────────────────
CREATE TABLE IF NOT EXISTS chapters (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id    UUID NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  chapter_num  NUMERIC(8,1) NOT NULL,           -- 1, 1.5, 2 ...
  title        TEXT,                            -- opsiyonel bölüm başlığı
  version      TEXT NOT NULL DEFAULT 'quality'
                 CHECK (version IN ('speed', 'quality')),
  page_count   INTEGER DEFAULT 0,
  view_count   BIGINT DEFAULT 0,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(series_id, chapter_num, version)
);

-- ── BÖLÜM GÖRSELLERİ ──────────────────────────
CREATE TABLE IF NOT EXISTS chapter_pages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id  UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  page_num    INTEGER NOT NULL,
  image_url   TEXT NOT NULL,
  width       INTEGER,
  height      INTEGER,
  UNIQUE(chapter_id, page_num)
);

-- ── PUANLAR ────────────────────────────────────
CREATE TABLE IF NOT EXISTS ratings (
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  series_id  UUID REFERENCES series(id) ON DELETE CASCADE,
  score      INTEGER NOT NULL CHECK (score BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, series_id)
);

-- ── REAKSİYONLAR ──────────────────────────────
CREATE TABLE IF NOT EXISTS reactions (
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  series_id  UUID REFERENCES series(id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN ('upvote','funny','love','surprised','angry','sad')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, series_id, type)
);

-- ── YORUMLAR ───────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  series_id   UUID REFERENCES series(id) ON DELETE CASCADE,
  chapter_id  UUID REFERENCES chapters(id) ON DELETE CASCADE,
  parent_id   UUID REFERENCES comments(id) ON DELETE CASCADE, -- reply
  content     TEXT NOT NULL,
  is_spoiler  BOOLEAN DEFAULT FALSE,
  like_count  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  CHECK (series_id IS NOT NULL OR chapter_id IS NOT NULL)
);

-- ── BOOKMARK ───────────────────────────────────
CREATE TABLE IF NOT EXISTS bookmarks (
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  series_id  UUID REFERENCES series(id) ON DELETE CASCADE,
  status     TEXT DEFAULT 'reading'
               CHECK (status IN ('reading','completed','plan_to_read','dropped','on_hold')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, series_id)
);

-- ── OKUMA GEÇMİŞİ ──────────────────────────────
CREATE TABLE IF NOT EXISTS read_history (
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  chapter_id  UUID REFERENCES chapters(id) ON DELETE CASCADE,
  series_id   UUID REFERENCES series(id) ON DELETE CASCADE,
  read_at     TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, chapter_id)
);

-- ── POPULER SERILER VIEW ───────────────────────
CREATE OR REPLACE VIEW series_with_stats AS
SELECT
  s.*,
  COALESCE(
    (SELECT COUNT(*) FROM chapters c WHERE c.series_id = s.id AND c.version = 'quality'),
    0
  ) AS chapter_count,
  (SELECT MAX(chapter_num) FROM chapters c WHERE c.series_id = s.id) AS latest_chapter,
  (SELECT published_at FROM chapters c WHERE c.series_id = s.id ORDER BY published_at DESC LIMIT 1) AS last_updated,
  ARRAY(
    SELECT g.name FROM genres g
    JOIN series_genres sg ON sg.genre_id = g.id
    WHERE sg.series_id = s.id
  ) AS genre_names
FROM series s;

-- ── İNDEKSLER ─────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_series_slug ON series(slug);
CREATE INDEX IF NOT EXISTS idx_series_status ON series(status);
CREATE INDEX IF NOT EXISTS idx_series_featured ON series(is_featured);
CREATE INDEX IF NOT EXISTS idx_series_updated ON series(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_series_views ON series(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_chapters_series ON chapters(series_id);
CREATE INDEX IF NOT EXISTS idx_chapters_published ON chapters(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_read_history_user ON read_history(user_id, read_at DESC);
CREATE INDEX IF NOT EXISTS idx_series_title_trgm ON series USING gin(title gin_trgm_ops);

-- ── ÖRNEK TÜRLER ───────────────────────────────
INSERT INTO genres (name, slug) VALUES
  ('Aksiyon', 'aksiyon'),
  ('Fantastik', 'fantastik'),
  ('Macera', 'macera'),
  ('Dövüş Sanatları', 'dovus-sanatlari'),
  ('Shounen', 'shounen'),
  ('Doğaüstü', 'dogaustu'),
  ('Komedi', 'komedi'),
  ('Drama', 'drama'),
  ('Romantik', 'romantik'),
  ('Büyü', 'buyu'),
  ('Sistem', 'sistem'),
  ('Manhwa', 'manhwa'),
  ('Isekai', 'isekai'),
  ('Reenkarnasyon', 'reenkarnasyon'),
  ('Seinen', 'seinen')
ON CONFLICT DO NOTHING;

-- ── RLS (Row Level Security) ───────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE read_history ENABLE ROW LEVEL SECURITY;

-- Herkes profil görebilir
CREATE POLICY "profiles_public_read" ON profiles FOR SELECT USING (true);
-- Sadece kendi profilini düzenleyebilir
CREATE POLICY "profiles_own_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Seriler herkese açık
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
CREATE POLICY "series_public_read" ON series FOR SELECT USING (true);
CREATE POLICY "series_admin_write" ON series FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Chapters herkese açık
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chapters_public_read" ON chapters FOR SELECT USING (true);
CREATE POLICY "chapters_admin_write" ON chapters FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Yorumlar: herkes okur, giriş yapan yazar
CREATE POLICY "comments_public_read" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_auth_insert" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_own_update" ON comments FOR UPDATE USING (auth.uid() = user_id);

-- Bookmark/history: sadece kendi
CREATE POLICY "bookmarks_own" ON bookmarks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "history_own" ON read_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "ratings_own" ON ratings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "reactions_own" ON reactions FOR ALL USING (auth.uid() = user_id);

SELECT 'Şema başarıyla oluşturuldu! ✅' AS result;
