-- Function 1: Update_trending (This function checks the lifetime of the most recent trending, and if it has expired uses posts and likes related to a tag to decide new trending)
with TagUses as (
  select it.Tag, count(it.PostID) as UsedCount 
  from IncludesTag it 
    left join post p on p.ID = it.PostID 
  where CreatedTime > (
      select StartTime 
      from trending 
      order by StartTime desc 
      limit 1
    ) 
  group by it.Tag
) 
select h.Tag, usedCount 
from Hashtag h left join TagUses tu on h.Tag = tu.Tag 
order by tu.UsedCount desc 
limit 1;

-- To get the most recent not null trending
select * from trending t where Tag<>"null" order by StartTime desc limit 1;

-- Function 2: Search_posts (This function returns Posts given a User to search for)
-- POST GRABBER BY USER Used by /account/ and /myaccount (ViewerUsername, ViewerUsername, WantedUsername)
-- Helper tables to count number of likes on a post, number of replies on a post, get the tags, and get the votes on the polls
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
-- Select all data relevant to posts with left joins for all relevent attached data
SELECT p.ID, p.Contents, p.CreatedTime, p.PosterUsername, p.ShortLinkID, pl.TotalLikes, pr.TotalReplies, r2.OriginalPostID, pt.IncludedTags,
	CASE WHEN l2.PostID IS NOT NULL THEN 1 ELSE 0 END AS LikedBySecondUser, u.OriginalURL, pl.Title, pl.Option1Text, pl.Option2Text, pv.VotesFor1, 
    pv.VotesFor2, v.Choice as SecondUserChoice
FROM POST p
LEFT JOIN PostLikes pl ON p.ID = pl.ID
LEFT JOIN PostReplies pr ON p.ID = pr.OriginalPostID
-- Get if viewer has liked
LEFT JOIN Likes l2 ON p.ID = l2.PostID AND l2.Username = 'Viewer'
LEFT JOIN Replies r2 ON p.ID = r2.ReplyPostID
LEFT JOIN PostTags pt ON p.ID = pt.PostID
LEFT JOIN URLSHORTENER u ON p.ShortLinkID = u.ID
LEFT JOIN POLL pl ON p.ID = pl.PostID
LEFT JOIN PollVotes pv ON p.ID = pv.PostID
-- Get viewer vote
LEFT JOIN Vote v ON p.ID = v.PostID and v.Username = 'Viewer'
WHERE p.PosterUsername = 'Searcher';

-- Function 3: Liked_replies (This function is a helper for pro-rating the replies to a post that where liked by the poster)
-- THE POST AND REPLY GRABBER Used by /post/ (ViewerUsername, ViewerUsername, PostID, ViewerUsername, ViewerUsername, PostID)
-- Helper tables to count number of likes on a post, number of replies on a post, get the tags, and get the votes on the polls
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
-- Get data for the requested post itself
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
-- Get and combine data for all posts replying to the requested post and sort it by likes
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
-- Sort by ordering (keeps selected post above its replies and total likes)
ORDER BY ordering, TotalLikes DESC;

-- Get a user's information
SELECT USER.Username, b.Birthday, d.Description, l.Location, el.Link
FROM USER
LEFT JOIN Birthday b ON USER.Username = b.Username
LEFT JOIN Description d ON USER.Username = d.Username
LEFT JOIN Location l ON USER.Username = l.Username
LEFT JOIN ExternalLinks el ON USER.Username = el.Username
WHERE USER.Username = ?