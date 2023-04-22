UPDATE USER SET Description="" WHERE Username='1234';
select * from user;
SELECT USER.Username, Birthday, Description, Location, ExternalLinks.Link FROM USER LEFT JOIN ExternalLinks ON USER.Username = ExternalLinks.Username WHERE USER.Username = '1234';

select * from includestag;

-- POST GRABBER BY USER
WITH PostLikes AS (
    SELECT p.ID, COUNT(l.PostID) AS TotalLikes
    FROM POST p
    LEFT JOIN Likes l ON p.ID = l.PostID
    GROUP BY p.ID
),
PostReplies AS (
    SELECT r.OriginalPostID, COUNT(r.ReplyPostID) AS TotalReplies
    FROM Replies r
    GROUP BY r.OriginalPostID
),
PostTags AS (
    Select it.PostID, json_arrayagg(it.Tag) AS IncludedTags
	From IncludesTag it
	group by it.PostID
)
SELECT p.*, pl.TotalLikes, pr.TotalReplies, r2.OriginalPostID, pt.IncludedTags, CASE WHEN l2.PostID IS NOT NULL THEN 1 ELSE 0 END AS LikedBySecondUser
FROM POST p
LEFT JOIN PostLikes pl ON p.ID = pl.ID
LEFT JOIN PostReplies pr ON p.ID = pr.OriginalPostID
LEFT JOIN Likes l2 ON p.ID = l2.PostID AND l2.Username = '1234'
LEFT JOIN Replies r2 ON p.ID = r2.ReplyPostID
LEFT JOIN PostTags pt ON p.ID = pt.PostID
WHERE p.ID = '54'
UNION ALL
SELECT p.*, pl.TotalLikes, pr.TotalReplies, r.OriginalPostID, pt.IncludedTags, CASE WHEN l2.PostID IS NOT NULL THEN 1 ELSE 0 END AS LikedBySecondUser
FROM POST p
JOIN Replies r ON p.ID = r.ReplyPostID
LEFT JOIN PostLikes pl ON p.ID = pl.ID
LEFT JOIN PostReplies pr ON p.ID = pr.OriginalPostID
LEFT JOIN Likes l2 ON p.ID = l2.PostID AND l2.Username = '1234'
LEFT JOIN PostTags pt ON p.ID = pt.PostID
WHERE r.OriginalPostID = '54'
ORDER BY TotalLikes DESC;

-- THE POST AND REPLY GRABBER ViewerUsername PostID ViewerUsername PostID
WITH PostLikes AS (
    SELECT p.ID, COUNT(l.PostID) AS TotalLikes
    FROM POST p
    LEFT JOIN Likes l ON p.ID = l.PostID
    GROUP BY p.ID
),
PostReplies AS (
    SELECT r.OriginalPostID, COUNT(r.ReplyPostID) AS TotalReplies
    FROM Replies r
    GROUP BY r.OriginalPostID
),
PostTags AS (
    Select it.PostID, json_arrayagg(it.Tag) AS IncludedTags
	From IncludesTag it
	group by it.PostID
)
SELECT p.ID, p.Contents, p.CreatedTime, p.PosterUsername, p.ShortlinkID, pl.TotalLikes, pr.TotalReplies, r2.OriginalPostID, pt.IncludedTags, CASE WHEN l2.PostID IS NOT NULL THEN 1 ELSE 0 END AS LikedBySecondUser
FROM POST p
LEFT JOIN PostLikes pl ON p.ID = pl.ID
LEFT JOIN PostReplies pr ON p.ID = pr.OriginalPostID
LEFT JOIN Likes l2 ON p.ID = l2.PostID AND l2.Username = '1234'
LEFT JOIN Replies r2 ON p.ID = r2.ReplyPostID
LEFT JOIN PostTags pt ON p.ID = pt.PostID
WHERE p.ID = '54'
UNION ALL
SELECT p.*, pl.TotalLikes, pr.TotalReplies, r.OriginalPostID, pt.IncludedTags, CASE WHEN l2.PostID IS NOT NULL THEN 1 ELSE 0 END AS LikedBySecondUser
FROM POST p
JOIN Replies r ON p.ID = r.ReplyPostID
LEFT JOIN PostLikes pl ON p.ID = pl.ID
LEFT JOIN PostReplies pr ON p.ID = pr.OriginalPostID
LEFT JOIN Likes l2 ON p.ID = l2.PostID AND l2.Username = '1234'
LEFT JOIN PostTags pt ON p.ID = pt.PostID
WHERE r.OriginalPostID = '54'
ORDER BY TotalLikes DESC;


WITH PostLikes AS ( SELECT p.ID, COUNT(l.PostID) AS TotalLikes FROM POST p LEFT JOIN Likes l ON p.ID = l.PostID GROUP BY p.ID ), PostReplies AS ( SELECT r.OriginalPostID, COUNT(r.ReplyPostID) AS TotalReplies FROM Replies r GROUP BY r.OriginalPostID ) SELECT p.*, pl.TotalLikes, pr.TotalReplies, r2.OriginalPostID, CASE WHEN l2.PostID IS NOT NULL THEN 1 ELSE 0 END AS LikedBySecondUser FROM POST p LEFT JOIN PostLikes pl ON p.ID = pl.ID LEFT JOIN PostReplies pr ON p.ID = pr.OriginalPostID LEFT JOIN Likes l2 ON p.ID = l2.PostID AND l2.Username = "1234" LEFT JOIN Replies r2 ON p.ID = r2.ReplyPostID WHERE p.ID = '52' UNION ALL SELECT p.*, pl.TotalLikes, pr.TotalReplies, r.OriginalPostID, CASE WHEN l2.PostID IS NOT NULL THEN 1 ELSE 0 END AS LikedBySecondUser FROM POST p JOIN Replies r ON p.ID = r.ReplyPostID LEFT JOIN PostLikes pl ON p.ID = pl.ID LEFT JOIN PostReplies pr ON p.ID = pr.OriginalPostID LEFT JOIN Likes l2 ON p.ID = l2.PostID AND l2.Username = "1234" WHERE r.OriginalPostID = '52' ORDER BY TotalLikes DESC;


-- Tag Selector PostID
Select Tag
From IncludesTag it
Where it.PostID = '53';

SELECT p.ID, p.Contents, p.CreatedTime, p.PosterUsername, p.ShortLinkID, GROUP_CONCAT(i.Tag) AS IncludedTags
FROM POST p
LEFT JOIN IncludesTag i ON p.ID = i.PostID
GROUP BY p.ID
HAVING COUNT(i.Tag) <= 5;

SELECT 
  ID, 
  Contents, 
  CreatedTime, 
  PosterUsername, 
  ShortlinkID, 
  CASE WHEN l.PostID IS NOT NULL THEN 1 ELSE 0 END AS LikedBySecondUser, 
  COUNT(DISTINCT l2.PostID) AS TotalLikes, 
  COUNT(DISTINCT r.ReplyPostID) AS TotalReplies, 
  MAX(r2.OriginalPostID) AS OriginalPostID 
FROM 
  POST p 
  LEFT JOIN Likes l ON p.ID = l.PostID 
  AND l.Username = "1234" 
  LEFT JOIN Likes l2 ON p.ID = l2.PostID 
  LEFT JOIN Replies r ON p.ID = r.OriginalPostID 
  LEFT JOIN Replies r2 ON p.ID = r2.ReplyPostID 
WHERE 
  p.PosterUsername = "1234" 
GROUP BY 
  p.ID;

SELECT p.*, CASE WHEN l.PostID IS NOT NULL THEN 1 ELSE 0 END AS LikedBySecondUser
FROM Post p
LEFT JOIN Likes l ON p.ID = l.PostID AND l.Username = 'Person2'
WHERE p.Username = '1234';
SELECT ID, Contents, CreatedTime, PosterUsername, ShortlinkID, CASE WHEN l.PostID IS NOT NULL THEN 1 ELSE 0 END AS LikedBySecondUser FROM POST p LEFT JOIN Likes l ON p.ID = l.PostID AND l.Username = '1234' WHERE p.PosterUsername = 'Person2';

SELECT p.*, CASE WHEN l.PostID IS NOT NULL THEN 1 ELSE 0 END AS LikedBySecondUser, COUNT(l2.PostID) AS TotalLikes
FROM POST p
LEFT JOIN Likes l ON p.ID = l.PostID AND l.Username = 'SecondUser'
LEFT JOIN Likes l2 ON p.ID = l2.PostID
WHERE p.PosterUsername = 'FirstUser'
GROUP BY p.ID;

insert into POST (Contents, CreatedTime, PosterUsername)
	values ("Test1", "", "1234");

SELECT p.*, CASE WHEN l.PostID IS NOT NULL THEN 1 ELSE 0 END AS LikedBySecondUser FROM POST p LEFT JOIN Likes l ON p.ID = l.PostID AND l.Username = "1234" WHERE p.PosterUsername = "Person2";

SELECT USER.Username, Birthday, Description, Location, ExternalLinks.Link FROM USER LEFT JOIN ExternalLinks ON USER.Username = ExternalLinks.Username WHERE USER.Username = "Person2";

SELECT Contents, CreatedTime, PosterUsername, ShortlinkID FROM POST WHERE PosterUsername = "Person2" LIMIT 10;

DELETE FROM ExternalLinks WHERE Link = "google.com" and Username = "1234";
Select * from externallinks;

Error Code: 1175. You are using safe update mode and you tried to update a table without a WHERE that uses a KEY column.  To disable safe mode, toggle the option in Preferences -> SQL Editor and reconnect.
