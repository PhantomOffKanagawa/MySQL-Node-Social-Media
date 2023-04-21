drop database socialMedia;
create database socialMedia;
use socialMedia;

create table USER ( -- Simple Table
	Username varchar(255) not null, -- pk
	CreatedTime varchar(26),
    Birthday date,
    Description varchar(255),
    Location varchar(255),
    Hash varchar(200),
    Salt varchar(100),
	primary key (Username)
);

create table ExternalLinks ( -- Multi-value Attribute
    Username varchar(255) not null, -- fk
    Link varchar(40) unique,
    FOREIGN KEY (Username) REFERENCES USER(Username)
);

create table URLSHORTENER ( -- Simple Table
    UUID varchar(20), -- pk
    OriginalURL varchar(255),
    ShortenedURL varchar(40),
    PRIMARY KEY (UUID)
);

create table HASHTAG ( -- Simple Table
    Tag varchar(20), -- pk
    PRIMARY KEY (Tag)
);

CREATE TABLE POST ( -- Compound Table
    UUID varchar(20), -- pk
    Contents VARCHAR(255),
    CreatedTime INT,
    PosterUsername VARCHAR(255), -- fk
    ShortLinkUUID VARCHAR(255), -- optional fk
    primary key (UUID),
    foreign key (PosterUsername) REFERENCES USER(Username),
    FOREIGN KEY (ShortLinkUUID) REFERENCES URLSHORTENER(UUID)
);

CREATE TABLE POLL ( -- Compound Table
    PostUUID varchar(20), -- fk
    Title varchar(40),
    Option1Text varchar(40),
    Option2Text varchar(40),
    FOREIGN KEY (PostUUID) REFERENCES POST(UUID)
);

 -- Only one trending tag or now 
CREATE TABLE TRENDING ( -- Compound Table
    StartTime int, -- pk
    Tag varchar(20),
    Lifespan int,
    PRIMARY KEY (StartTime), 
    FOREIGN KEY (Tag) References HASHTAG(Tag) 
);

CREATE TABLE Likes ( -- Reference
    Username varchar(255), -- fk
    PostUUID varchar(20), -- fk
    foreign key (Username) REFERENCES USER(Username),
    FOREIGN KEY (PostUUID) REFERENCES POST(UUID)
);

CREATE TABLE Replies ( -- Reference
    ReplyPostUUID varchar(20), -- fk
    OriginalPostUUID varchar(20), -- fk
    FOREIGN KEY (ReplyPostUUID) REFERENCES POST(UUID),
    FOREIGN KEY (OriginalPostUUID) REFERENCES POST(UUID)
);

CREATE TABLE Vote ( -- Reference
    Username varchar(255), -- fk
    PostUUID varchar(20), -- fk
    Choice int,
    foreign key (Username) REFERENCES USER(Username),
    FOREIGN KEY (PostUUID) REFERENCES POST(UUID)
);

CREATE TABLE IncludesTag ( -- Reference
    PostUUID varchar(20), -- fk
    Tag char(20), -- fk
    FOREIGN KEY (PostUUID) REFERENCES POST(UUID),
    FOREIGN KEY (Tag) REFERENCES HASHTAG(Tag)
);