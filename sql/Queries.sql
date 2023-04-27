-- Search_posts (This function returns Posts given a User to search for)
-- POST GRABBER BY USER Used by /account/ and /myaccount (ViewerUsername, ViewerUsername, WantedUsername)
-- Helper tables to count number of likes on a post, number of replies on a post, get the tags, and get the votes on the polls
WITH PostLikes AS (
    SELECT p.ID, COUNT(l.PostID) AS TotalLikes
    FROM POST p
    LEFT JOIN Likes l ON p.ID = l.PostID
    GROUP BY p.ID
)
-- Select all data relevant to posts with left joins for all relevent attached data
SELECT p.ID, p.Contents, p.CreatedTime, p.PosterUsername, pl.TotalLikes,
	CASE WHEN l2.PostID IS NOT NULL THEN 1 ELSE 0 END AS LikedBySecondUser
FROM POST p
LEFT JOIN PostLikes pl ON p.ID = pl.ID
-- Get if viewer has liked
LEFT JOIN Likes l2 ON p.ID = l2.PostID AND l2.Username = 'Viewer'
WHERE p.PosterUsername = 'Searcher';