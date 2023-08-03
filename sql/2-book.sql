create table if not exists book (
    id INTEGER,
    name text not null UNIQUE,
    cover text,
    skills text not null,
    PRIMARY KEY(id)
);