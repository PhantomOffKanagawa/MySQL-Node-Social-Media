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

-- Function 3: Liked_replies (This function is a helper for pro-rating the replies to a post that where liked by the poster)