drop database socialMedia;
create database socialMedia;
use socialMedia;

create table USER ( -- Simple Table
	Username varchar(255) not null, -- pk
	CreatedTime varchar(26) not null,
    Birthday date,
    Description varchar(255),
    Location varchar(255),
    Hash varchar(200) not null,
    Salt varchar(100) not null,
	primary key (Username)
);

create table ExternalLinks ( -- Multi-value Attribute
    Username varchar(255) not null, -- fk
    Link varchar(40) unique not null,
    FOREIGN KEY (Username) REFERENCES USER(Username)
);

create table URLSHORTENER ( -- Simple Table
    ID int NOT NULL AUTO_INCREMENT, -- pk
    OriginalURL varchar(255) unique not null,
    -- ShortenedURL varchar(40) unique not null,
    PRIMARY KEY (ID)
);

create table HASHTAG ( -- Simple Table
    Tag varchar(20) not null, -- pk
    PRIMARY KEY (Tag)
);

CREATE TABLE POST ( -- Compound Table
    ID int NOT NULL AUTO_INCREMENT, -- pk
    Contents VARCHAR(255) not null,
    CreatedTime varchar(26) not null,
    PosterUsername VARCHAR(255) not null, -- fk
    ShortLinkID int, -- optional fk
    primary key (ID),
    foreign key (PosterUsername) REFERENCES USER(Username),
    FOREIGN KEY (ShortLinkID) REFERENCES URLSHORTENER(ID)
);

CREATE TABLE POLL ( -- Compound Table
    PostID int not null, -- fk
    Title varchar(40) not null,
    Option1Text varchar(40) not null,
    Option2Text varchar(40) not null,
    FOREIGN KEY (PostID) REFERENCES POST(ID)
);

 -- Only one trending tag or now 
CREATE TABLE TRENDING ( -- Compound Table
    StartTime varchar(26) not null, -- pk
    Tag varchar(20),
    Lifespan int not null,
    PRIMARY KEY (StartTime), 
    FOREIGN KEY (Tag) References HASHTAG(Tag) 
);

CREATE TABLE Likes ( -- Reference
    Username varchar(255) not null, -- fk
    PostID int not null, -- fk
    foreign key (Username) REFERENCES USER(Username),
    FOREIGN KEY (PostID) REFERENCES POST(ID)
);

CREATE TABLE Replies ( -- Reference
    ReplyPostID int not null, -- fk
    OriginalPostID int not null, -- fk
    FOREIGN KEY (ReplyPostID) REFERENCES POST(ID),
    FOREIGN KEY (OriginalPostID) REFERENCES POST(ID)
);

CREATE TABLE Vote ( -- Reference
    Username varchar(255) not null, -- fk
    PostID int not null, -- fk
    Choice int not null,
    foreign key (Username) REFERENCES USER(Username),
    FOREIGN KEY (PostID) REFERENCES POST(ID),
    constraint u_vote unique(Username, PostID)
);

CREATE TABLE IncludesTag ( -- Reference
    PostID int not null, -- fk
    Tag varchar(20) not null, -- fk
    FOREIGN KEY (PostID) REFERENCES POST(ID),
    FOREIGN KEY (Tag) REFERENCES HASHTAG(Tag)
);