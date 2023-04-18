use socialMedia;

SELECT p.UUID, p.Contents, COUNT(l.Username) AS LikeCount
FROM POST p
JOIN Likes l ON p.UUID = l.PostUUID
GROUP BY p.UUID
ORDER BY LikeCount DESC
LIMIT 1;

SELECT it.Tag, COUNT(it.PostUUID) AS TagCount
FROM IncludesTag it
GROUP BY it.Tag
ORDER BY TagCount DESC
LIMIT 1;

SELECT p.UUID, p.Contents
FROM POST p
WHERE p.PosterUsername = 'user1';

SELECT r.ReplyPostUUID, p.Contents, COUNT(l.Username) AS LikeCount
FROM Replies r
JOIN POST p ON r.ReplyPostUUID = p.UUID
LEFT JOIN Likes l ON r.ReplyPostUUID = l.PostUUID
WHERE r.OriginalPostUUID = 'postuuid1'
GROUP BY r.ReplyPostUUID
ORDER BY LikeCount DESC;