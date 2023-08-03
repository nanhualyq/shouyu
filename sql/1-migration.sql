create table if not exists migration (
    version TEXT NOT NULL,
    time TEXT NOT NULL
);

INSERT INTO migration VALUES ('', '');