create table if not exists book (
    id INTEGER,
    name text not null UNIQUE,
    cover text,
    skills text not null,
    PRIMARY KEY(id)
);
insert into book (name,cover,skills) values ('新概念英语第一册', 'https://i03piccdn.sogoucdn.com/7560b275b4d942a8', 'read,write,listen,speak');
insert into book (name,cover,skills) values ('新概念英语第二册', 'https://images-cn.ssl-images-amazon.cn/images/I/711pHg6oKaL.jpg', 'read,write,listen,speak');
insert into book (name,cover,skills) values ('新概念英语第三册', 'https://imgv2-1-f.scribdassets.com/img/document/546231509/original/865a6dbd5e/1680034710?v=1', 'read,write,listen,speak');
insert into book (name,cover,skills) values ('新概念英语第四册', 'https://online.fliphtml5.com/apdbk/kavf/files/large/03f820a3f73b72f773dde60258de5965.jpg?1662451577', 'read,write,listen,speak');