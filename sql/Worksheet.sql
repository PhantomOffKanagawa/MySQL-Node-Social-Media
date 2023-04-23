UPDATE USER SET Description="" WHERE Username='1234';
select * from user
order by CreatedTime desc limit 1;
SELECT USER.Username, Birthday, Description, Location, ExternalLinks.Link FROM USER LEFT JOIN ExternalLinks ON USER.Username = ExternalLinks.Username WHERE USER.Username = '1234';

select * from POLL;
select * from vote where Username="1234" and PostID="11";
INSERT INTO vote (Username, PostID, Choice) VALUES("1234", "11", 2) ON DUPLICATE KEY UPDATE;
REPLACE INTO vote (Username, PostID, Choice) VALUES ("1234", "11", 2);

select ID from URLSHORTENER where OriginalURL="test.com";

-- GET TOP TRENDING HASHTAG
with TagUses as (
select it.Tag, count(it.PostID) as UsedCount
from IncludesTag it
left join post p on p.ID = it.PostID
where CreatedTime > (select StartTime from trending order by StartTime desc limit 1)
group by it.Tag
)
select h.Tag, usedCount
from Hashtag h
left join TagUses tu on h.Tag = tu.Tag
order by tu.UsedCount desc
limit 1;

select * from trending t where Tag<>"null" order by StartTime desc limit 1;

insert into Vote
values ("1234", 11, 1);

-- POST GRABBER BY TAG ViewerUsername ViewerUsername Tag
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
),
PollVotes AS (
    Select v.PostID, sum(if(Choice = 1, 1, 0)) as VotesFor1, sum(if(Choice = 2, 1, 0)) as VotesFor2
	From Vote v
	group by v.PostID
)
SELECT p.ID, p.Contents, p.CreatedTime, p.PosterUsername, p.ShortLinkID, pl.TotalLikes, pr.TotalReplies, r2.OriginalPostID, pt.IncludedTags,
	CASE WHEN l2.PostID IS NOT NULL THEN 1 ELSE 0 END AS LikedBySecondUser, u.OriginalURL, pl.Title, pl.Option1Text, pl.Option2Text, pv.VotesFor1, 
    pv.VotesFor2, v.Choice as SecondUserChoice
FROM POST p
LEFT JOIN PostLikes pl ON p.ID = pl.ID
LEFT JOIN PostReplies pr ON p.ID = pr.OriginalPostID
LEFT JOIN Likes l2 ON p.ID = l2.PostID AND l2.Username = '1234'
LEFT JOIN Replies r2 ON p.ID = r2.ReplyPostID
LEFT JOIN PostTags pt ON p.ID = pt.PostID
LEFT JOIN IncludesTag it ON p.ID = it.PostID
LEFT JOIN URLSHORTENER u ON p.ShortLinkID = u.ID
LEFT JOIN POLL pl ON p.ID = pl.PostID
LEFT JOIN PollVotes pv ON p.ID = pv.PostID
LEFT JOIN Vote v ON p.ID = v.PostID and v.Username = '1234'
WHERE it.Tag = '#test'
order by TotalLikes desc;

-- POST GRABBER BY USER ViewerUsername ViewerUsername WantedUsername
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
),
PollVotes AS (
    Select v.PostID, sum(if(Choice = 1, 1, 0)) as VotesFor1, sum(if(Choice = 2, 1, 0)) as VotesFor2
	From Vote v
	group by v.PostID
)
SELECT p.ID, p.Contents, p.CreatedTime, p.PosterUsername, p.ShortLinkID, pl.TotalLikes, pr.TotalReplies, r2.OriginalPostID, pt.IncludedTags,
	CASE WHEN l2.PostID IS NOT NULL THEN 1 ELSE 0 END AS LikedBySecondUser, u.OriginalURL, pl.Title, pl.Option1Text, pl.Option2Text, pv.VotesFor1, 
    pv.VotesFor2, v.Choice as SecondUserChoice
FROM POST p
LEFT JOIN PostLikes pl ON p.ID = pl.ID
LEFT JOIN PostReplies pr ON p.ID = pr.OriginalPostID
LEFT JOIN Likes l2 ON p.ID = l2.PostID AND l2.Username = '1234'
LEFT JOIN Replies r2 ON p.ID = r2.ReplyPostID
LEFT JOIN PostTags pt ON p.ID = pt.PostID
LEFT JOIN URLSHORTENER u ON p.ShortLinkID = u.ID
LEFT JOIN POLL pl ON p.ID = pl.PostID
LEFT JOIN PollVotes pv ON p.ID = pv.PostID
LEFT JOIN Vote v ON p.ID = v.PostID and v.Username = '1234'
WHERE p.PosterUsername = '1234';

-- THE POST AND REPLY GRABBER ViewerUsername ViewerUsername PostID ViewerUsername ViewerUsername PostID
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
),
PollVotes AS (
    Select v.PostID, sum(if(Choice = 1, 1, 0)) as VotesFor1, sum(if(Choice = 2, 1, 0)) as VotesFor2
	From Vote v
	group by v.PostID
)
SELECT p.ID, p.Contents, p.CreatedTime, p.PosterUsername, p.ShortLinkID, pl.TotalLikes, pr.TotalReplies, r2.OriginalPostID, pt.IncludedTags,
	CASE WHEN l2.PostID IS NOT NULL THEN 1 ELSE 0 END AS LikedBySecondUser, 1 AS ordering, u.OriginalURL, pl.Title, pl.Option1Text, pl.Option2Text, 
    pv.VotesFor1, pv.VotesFor2, v.Choice as SecondUserChoice
FROM POST p
LEFT JOIN PostLikes pl ON p.ID = pl.ID
LEFT JOIN PostReplies pr ON p.ID = pr.OriginalPostID
LEFT JOIN Likes l2 ON p.ID = l2.PostID AND l2.Username = '1234'
LEFT JOIN Replies r2 ON p.ID = r2.ReplyPostID
LEFT JOIN PostTags pt ON p.ID = pt.PostID
LEFT JOIN URLSHORTENER u ON p.ShortLinkID = u.ID
LEFT JOIN POLL pl ON p.ID = pl.PostID
LEFT JOIN PollVotes pv ON p.ID = pv.PostID
LEFT JOIN Vote v ON p.ID = v.PostID and v.Username = '1234'
WHERE p.ID = '1'
UNION ALL
SELECT p.ID, p.Contents, p.CreatedTime, p.PosterUsername, p.ShortLinkID, pl.TotalLikes, pr.TotalReplies, r.OriginalPostID, pt.IncludedTags,
	CASE WHEN l2.PostID IS NOT NULL THEN 1 ELSE 0 END AS LikedBySecondUser, 2 AS ordering, u.OriginalURL, pl.Title, pl.Option1Text, pl.Option2Text,
    pv.VotesFor1, pv.VotesFor2, v.Choice as SecondUserChoice
FROM POST p
JOIN Replies r ON p.ID = r.ReplyPostID
LEFT JOIN PostLikes pl ON p.ID = pl.ID
LEFT JOIN PostReplies pr ON p.ID = pr.OriginalPostID
LEFT JOIN Likes l2 ON p.ID = l2.PostID AND l2.Username = '1234'
LEFT JOIN PostTags pt ON p.ID = pt.PostID
LEFT JOIN URLSHORTENER u ON p.ShortLinkID = u.ID
LEFT JOIN POLL pl ON p.ID = pl.PostID
LEFT JOIN PollVotes pv ON p.ID = pv.PostID
LEFT JOIN Vote v ON p.ID = v.PostID and v.Username = '1234'
WHERE r.OriginalPostID = '1'
ORDER BY ordering, TotalLikes DESC;


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
