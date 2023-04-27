drop database if exists socialMedia;
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

CREATE TABLE POST ( -- Compound Table
    ID int NOT NULL AUTO_INCREMENT, -- pk
    Contents VARCHAR(255) not null,
    CreatedTime varchar(26) not null,
    PosterUsername VARCHAR(255) not null, -- fk
    primary key (ID),
    foreign key (PosterUsername) REFERENCES USER(Username)
);

CREATE TABLE Likes ( -- Reference
    Username varchar(255) not null, -- fk
    PostID int not null, -- fk
    foreign key (Username) REFERENCES USER(Username),
    FOREIGN KEY (PostID) REFERENCES POST(ID)
);