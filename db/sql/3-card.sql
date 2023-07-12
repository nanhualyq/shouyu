CREATE TABLE IF NOT EXISTS card (
    id INTEGER,
    sentence_id INTEGER NOT NULL REFERENCES sentence ON DELETE CASCADE,
    skill TEXT NOT NULL CHECK( skill IN('read', 'write', 'listen', 'speak') ),
    cloze TEXT NOT NULL DEFAULT '', /* example: 1,5 */
    create_time TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    due_time TEXT,
    skilled INTEGER,
	PRIMARY KEY("id"),
    unique(sentence_id, skill, cloze) ON CONFLICT IGNORE
);