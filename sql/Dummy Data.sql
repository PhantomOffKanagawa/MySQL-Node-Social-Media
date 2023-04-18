use socialMedia;

-- USER table
INSERT INTO USER (Username, Password, CreatedTime, Birthday, Description, Location)
VALUES ('user1', 'password1', 1620000000, '2000-01-01', 'Description for user1', 'Location for user1'),
       ('user2', 'password2', 1620000000, '2000-01-02', 'Description for user2', 'Location for user2'),
       ('user3', 'password3', 1620000000, '2000-01-03', 'Description for user3', 'Location for user3'),
       ('user4', 'password4', 1620000000, '2000-01-04', 'Description for user4', 'Location for user4');

-- ExternalLinks table
INSERT INTO ExternalLinks (Username, Link)
VALUES ('user1', 'https://www.example.com/user1/link1'),
       ('user1', 'https://www.example.com/user1/link2'),
       ('user2', 'https://www.example.com/user2/link1'),
       ('user2', 'https://www.example.com/user2/link2');

-- URLSHORTENER table
INSERT INTO URLSHORTENER (UUID, OriginalURL, ShortenedURL)
VALUES ('uuid1', 'https://www.example.com/long/url/1', 'https://short.url/1'),
       ('uuid2', 'https://www.example.com/long/url/2', 'https://short.url/2'),
       ('uuid3', 'https://www.example.com/long/url/3', 'https://short.url/3'),
       ('uuid4', 'https://www.example.com/long/url/4', 'https://short.url/4');

-- HASHTAG table
INSERT INTO HASHTAG (Tag)
VALUES ('hashtag1'),
       ('hashtag2'),
       ('hashtag3'),
       ('hashtag4');

    -- POST table
INSERT INTO POST (UUID, Contents, CreatedTime, PosterUsername, ShortLinkUUID)
VALUES ('postuuid1', 'Contents for post 1', 1620000000, 'user1', 'uuid1'),
       ('postuuid2', 'Contents for post 2', 1620000000, 'user2', 'uuid2'),
       ('postuuid3', 'Contents for post 3', 1620000000, 'user3', NULL),
       ('postuuid4', 'Contents for post 4', 1620000000, 'user4', NULL);

-- POLL table
INSERT INTO POLL (PostUUID, Title, Option1Text, Option2Text)
VALUES ('postuuid1', 'Poll title 1', 'Option 1 text for poll 1', 'Option 2 text for poll 1'),
       ('postuuid2', 'Poll title 2', 'Option 1 text for poll 2', 'Option 2 text for poll 2');

-- TRENDING table
INSERT INTO TRENDING (StartTime, Tag, Lifespan)
VALUES (1620000000, 'hashtag1', 3600),
       (1620000000 + 3600, 'hashtag2', 3600);

-- Likes table
INSERT INTO Likes (Username, PostUUID)
VALUES ('user1', 'postuuid1'),
       ('user2', 'postuuid1'),
       ('user3', 'postuuid1'),
       ('user1', 'postuuid4'),
       ('user2', 'postuuid4'),
       ('user3', 'postuuid4'),
       ('user1', 'postuuid3'),
       ('user2', 'postuuid3'),
       ('user3', 'postuuid2'),
       ('user4', 'postuuid2');

-- Replies table
INSERT INTO Replies (ReplyPostUUID, OriginalPostUUID)
VALUES ('postuuid3', 'postuuid1'),
       ('postuuid4', 'postuuid1');

-- Vote table
INSERT INTO Vote (Username, PostUUID, Choice)
VALUES ('user1', 'postuuid1', 1),
       ('user2', 'postuuid1', 2),
       ('user3', 'postuuid2', 1),
       ('user4', 'postuuid2', 2);

-- IncludesTag table
INSERT INTO IncludesTag (PostUUID, Tag)
VALUES ('postuuid1', 'hashtag1'),
       ('postuuid2', 'hashtag1'),
       ('postuuid3', 'hashtag1'),
       ('postuuid4', 'hashtag4');