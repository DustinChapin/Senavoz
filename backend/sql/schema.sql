-- SeñaVoz · esquema PostgreSQL (local o Neon)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS dictionary (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword   VARCHAR(100) NOT NULL UNIQUE CHECK (keyword = lower(keyword)),
  media_url TEXT NOT NULL,
  category  VARCHAR(50)
);
CREATE INDEX IF NOT EXISTS idx_dictionary_keyword ON dictionary (keyword);

CREATE TABLE IF NOT EXISTS quick_phrases (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_text VARCHAR(150) NOT NULL UNIQUE,
  spoken_text  TEXT NOT NULL,
  icon_name    VARCHAR(50)
);
