CREATE TABLE IF NOT EXISTS card (
    id INTEGER,
    sentence_id INTEGER NOT NULL REFERENCES sentence,
    skill TEXT NOT NULL CHECK( skill IN('read', 'write', 'listen', 'speak') ),
    create_time TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    due_time TEXT,
    skilled TEXT,
	PRIMARY KEY("id"),
    unique(sentence_id, skill) ON CONFLICT IGNORE
);