Used at [DBDiagram](https://dbdiagram.io/)
```
// Step 1: Basic Entities
Table USER {
  Username varchar(255) [primary key]
  CreatedTime varchar(26)
  Birthday date
  Description varchar(255)
  Location varchar(255)
  Hash varchar(200)
  Salt varchar(200)
}

  
Table POST {
  UUID char(20) [primary key]
  Contents varchar(255)
  CreatedTime integer
  PosterUsername varchar
  ShortLinkUUID varchar(40)
}

  
Table HASHTAG {
  Tag char(20) [primary key]
  StartTime integer
}

  
Table URLSHORTENER {
  UUID char(20) [primary key]
  OriginalURL varchar(255)
  ShortenedURL varchar(40)
}

  
Table TRENDING {
  StartTime integer [primary key]
  Lifespan integer
}

  
Table POLL {
  PostUUID char(20) [pk, Note: "foreign key"]
  Title varchar(40)
  Option1Text varchar(40)
  Option2Text varchar(40)
}

  
//M to N Tables
Table IncludesTag {
  PostUUID char(20) [pk]
  Tag char(20) [pk]
}

  
Table Likes {
  PostUUID char(20) [pk]
  Username varchar [pk]
}

  
Table Vote {
  Username varchar [pk]
  PostUUID char(20) [pk]
  Choice integer
}

  
//Multivalued Attributes
Table ExternalLinks {
  Username varchar [pk]
  Link varchar(40) [pk]
}

  
Table Replies {
  ReplyPostUUID char(20) [pk]
  OriginalPostUUID char(20)
}

  
//Relations
// 1-1
Ref: POLL.PostUUID - POST.UUID
  
// 1-n
Ref: POST.PosterUN > USER.Username
Ref: POST.ShortLinkUUID > URLSHORTENER.UUID
Ref: HASHTAG.StartTime > TRENDING.StartTime
  
// m-n
Ref: IncludesTag.PostUUID <> POST.UUID
Ref: IncludesTag.Tag <> HASHTAG.Tag
Ref: Vote.Username <> USER.Username
Ref: Vote.PostUUID <> POST.UUID
Ref: Likes.Username <> USER.Username
Ref: Likes.PostUUID <> POST.UUID
  
//multivalued
Ref: ExternalLinks.Username > USER.Username
Ref: Replies.ReplyPostUUID - POST.UUID
Ref: Replies.OriginalPostUUID > POST.UUID
```