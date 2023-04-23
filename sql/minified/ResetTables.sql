drop database socialMedia; create database socialMedia; use socialMedia; create table USER ( Username varchar(255) not null, CreatedTime varchar(26) not null, Birthday date, Description varchar(255), Location varchar(255), Hash varchar(200) not null, Salt varchar(100) not null, primary key (Username) ); create table ExternalLinks ( Username varchar(255) not null, Link varchar(40) unique not null, FOREIGN KEY (Username) REFERENCES USER(Username) ); create table URLSHORTENER ( ID int NOT NULL AUTO_INCREMENT, OriginalURL varchar(255) unique not null, PRIMARY KEY (ID) ); create table HASHTAG ( Tag varchar(20) not null, PRIMARY KEY (Tag) ); CREATE TABLE POST ( ID int NOT NULL AUTO_INCREMENT, Contents VARCHAR(255) not null, CreatedTime varchar(26) not null, PosterUsername VARCHAR(255) not null, ShortLinkID int, primary key (ID), foreign key (PosterUsername) REFERENCES USER(Username), FOREIGN KEY (ShortLinkID) REFERENCES URLSHORTENER(ID) ); CREATE TABLE POLL ( PostID int not null, Title varchar(40) not null, Option1Text varchar(40) not null, Option2Text varchar(40) not null, FOREIGN KEY (PostID) REFERENCES POST(ID) ); CREATE TABLE TRENDING ( StartTime varchar(26) not null, Tag varchar(20), Lifespan int not null, PRIMARY KEY (StartTime), FOREIGN KEY (Tag) References HASHTAG(Tag) ); CREATE TABLE Likes ( Username varchar(255) not null, PostID int not null, foreign key (Username) REFERENCES USER(Username), FOREIGN KEY (PostID) REFERENCES POST(ID) ); CREATE TABLE Replies ( ReplyPostID int not null, OriginalPostID int not null, FOREIGN KEY (ReplyPostID) REFERENCES POST(ID), FOREIGN KEY (OriginalPostID) REFERENCES POST(ID) ); CREATE TABLE Vote ( Username varchar(255) not null, PostID int not null, Choice int not null, foreign key (Username) REFERENCES USER(Username), FOREIGN KEY (PostID) REFERENCES POST(ID), constraint u_vote unique(Username, PostID) ); CREATE TABLE IncludesTag ( PostID int not null, Tag varchar(20) not null, FOREIGN KEY (PostID) REFERENCES POST(ID), FOREIGN KEY (Tag) REFERENCES HASHTAG(Tag) );