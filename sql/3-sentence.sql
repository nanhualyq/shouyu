CREATE TABLE IF NOT EXISTS "sentence" (
	"id"	INTEGER,
	"book_id"	INTEGER NOT NULL REFERENCES book ON DELETE CASCADE,
	"lesson"	INTEGER NOT NULL,
	"position"	INTEGER NOT NULL,
	"text_foreign"	TEXT NOT NULL,
	"text_local"	TEXT NOT NULL,
	"media_url"	TEXT,
	"media_start"	TEXT,
	"media_end"	TEXT,
	PRIMARY KEY("id"),
	UNIQUE("book_id","lesson","position")
);