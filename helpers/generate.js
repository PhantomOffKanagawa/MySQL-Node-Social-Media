const { faker } = require('@faker-js/faker')
const crypto = require('crypto')
const fs = require('fs')

const NUM_USERS = 20
const NUM_POSTS = 100
const NUM_TAGS = 5

const BDAY_CHANCE = 0.6
const DESC_CHANCE = 0.2
const LOC_CHANCE = 0.4

const LIKE_CHANCE = 0.4
const VOTE_CHANCE = 0.4
const POLL_CHANCE = 0.2

const TAGS_MAX = 5

function generateUsers () {
  let users = []
  for (let i = 0; i < NUM_USERS; i++) {
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto
      .pbkdf2Sync(faker.internet.password(), salt, 1000, 64, `sha512`)
      .toString(`hex`)
    users.push({
      Username: faker.internet.userName().substring(0, 255),
      CreatedTime: faker.date.past().toISOString(),
      Hash: hash,
      Salt: salt
    })
  }
  return users
}

function generateBirthdays (users) {
  let birthdays = []
  for (let user of users) {
    if (Math.random() < BDAY_CHANCE)
      birthdays.push({
        Username: user.Username,
        Birthday: faker.date.past(50).toISOString().split('T')[0]
      })
  }
  return birthdays
}

function generateDescriptions (users) {
  let descriptions = []
  for (let user of users) {
    if (Math.random() < DESC_CHANCE)
      descriptions.push({
        Username: user.Username,
        Description: faker.lorem.sentence().substring(0, 255)
      })
  }
  return descriptions
}

function generateLocations (users) {
  let locations = []
  for (let user of users) {
    if (Math.random() < LOC_CHANCE)
      locations.push({
        Username: user.Username,
        Location: faker.address.city().substring(0, 255)
      })
  }
  return locations
}

function generateExternalLinks (users) {
  let externalLinks = []
  for (let user of users) {
    externalLinks.push({
      Username: user.Username,
      Link: faker.internet.url().substring(0, 40)
    })
  }
  return externalLinks
}

function generateUrlShortener () {
  let urlShortener = []
  for (let i = 1; i <= NUM_POSTS; i++) {
    urlShortener.push({
      ID: i,
      OriginalURL: faker.internet.url().substring(0, 255)
    })
  }
  return urlShortener
}

function generateHashtags () {
  let hashtags = []
  for (let i = 0; i <= NUM_TAGS; i++) {
    hashtags.push({
      Tag: faker.lorem.slug(4).substring(0, 20)
    })
  }
  return hashtags
}

function generatePosts (users, urlShortener) {
  let posts = []
  for (let i = 1; i <= NUM_POSTS; i++) {
    posts.push({
      ID: i,
      Contents: faker.lorem.sentence().substring(0, 255),
      CreatedTime: faker.date.past().toISOString(),
      PosterUsername: users[Math.floor(Math.random() * users.length)].Username,
      ShortLinkID:
        urlShortener[Math.floor(Math.random() * urlShortener.length)].ID
    })
  }
  return posts
}

function generateIncludesTag (posts, hashtags) {
  let includesTag = []
  for (let post of posts) {
    includesTag.push({
      PostID: post.ID,
      Tag: hashtags[Math.floor(Math.random() * hashtags.length)].Tag
    })
  }
  return includesTag
}

function generateHashtagsAndPostsandIncludes (users, urlShortener) {
  let posts = [],
    hashtagsSet = new Set(),
    includesTag = []
  for (let i = 1; i <= NUM_POSTS; i++) {
    let contents = faker.lorem.sentence().substring(0, 250),
      contentSplit = contents.split(' ')
    const tagCount = Math.floor(Math.random() * TAGS_MAX)

    for (let j = 1; j < tagCount; j++) {
      let index = Math.floor(Math.random() * contentSplit.length),
        potHT = contentSplit[index]
      if (potHT.startsWith('#') && potHT.length <= 20) continue
      contentSplit[index] = '#' + potHT

      hashtagsSet.add(('#' + potHT).toLowerCase())
      includesTag.push({
        PostID: i,
        Tag: ('#' + potHT).toLowerCase()
      })
    }

    posts.push({
      ID: i,
      Contents: contentSplit.join(' '),
      CreatedTime: faker.date.past().toISOString(),
      PosterUsername: users[Math.floor(Math.random() * users.length)].Username,
      ShortLinkID:
        urlShortener[Math.floor(Math.random() * urlShortener.length)].ID
    })
  }

  let hashtags = []
  hashtagsSet.forEach(hashtag => {
    hashtags.push({
      Tag: hashtag
    })
  })

  return [hashtags, posts, includesTag]
}

function generatePolls (posts) {
  let polls = []
  for (let post of posts) {
    if (Math.random() < POLL_CHANCE)
      polls.push({
        PostID: post.ID,
        Title: faker.lorem.sentence().substring(0, 40),
        Option1Text: faker.lorem.word().substring(0, 40),
        Option2Text: faker.lorem.word().substring(0, 40)
      })
  }
  return polls
}

function generateLikes (users, posts) {
  let likes = []
  for (let user of users) {
    for (let post of posts) {
      if (Math.random() < LIKE_CHANCE)
        likes.push({
          Username: user.Username,
          PostID: post.ID
        })
    }
  }
  return likes
}

function generateReplies (posts) {
  let replies = []
  for (let post of posts) {
    replies.push({
      ReplyPostID: post.ID,
      OriginalPostID: posts[Math.floor(Math.random() * (posts.length / 2))].ID
      // OriginalPostID: posts[Math.floor(Math.random() * posts.length)].ID
    })
  }
  return replies
}

function generateVotes (users, posts) {
  let votes = []
  for (let user of users) {
    for (let post of posts) {
      if (Math.random() < VOTE_CHANCE)
        votes.push({
          Username: user.Username,
          PostID: post.ID,
          Choice: Math.floor(Math.random() * 2) + 1
        })
    }
  }
  return votes
}

function writeToSQL (fname, tableName, data, minifyfname) {
  const tominify = typeof minifyfname == 'undefined' ? false : true

  const firstLine = `\n\n-- Insert Statements for ${tableName}\ninsert into ${tableName} (${
    delete data[0].ID && Object.keys(data[0]).join(', ')
  })\n`
  append(firstLine, fname)

  if (tominify) {
    const mfirstLine = `insert into ${tableName} (${
      delete data[0].ID && Object.keys(data[0]).join(', ')
    }) `
    append(mfirstLine, minifyfname)
  }

  for (let i = 0; i < data.length; i++) {
    let start = '       ("',
      end = '"),'
    if (i == 0) start = 'VALUES("'
    if (i == data.length - 1) end = '");'
    const line =
      start + Object.values(delete data[i].ID && data[i]).join('", "') + end
    append(line + '\n', fname)

    if (tominify) {
      append(line, minifyfname)
    }
  }
}

function append (str, fname) {
  fs.appendFileSync(fname, str, err => {
    if (err) console.error(err)
  })
}

function generateData () {
  const users = generateUsers()
  const birthdays = generateBirthdays(users)
  const descriptions = generateDescriptions(users)
  const locations = generateLocations(users)
  const externalLinks = generateExternalLinks(users)
  const urlShortener = generateUrlShortener()

  const group = generateHashtagsAndPostsandIncludes(users, urlShortener)
  const hashtags = group[0]
  const posts = group[1]
  const includesTag = group[2]

  // const hashtags = generateHashtags();
  // const posts = generatePosts(users, urlShortener);
  // const includesTag = generateIncludesTag(posts, hashtags);

  const polls = generatePolls(posts)
  const likes = generateLikes(users, posts)
  const replies = generateReplies(posts)
  const votes = generateVotes(users, posts)

  fs.writeFileSync('./sql/SQLinserts.sql', '')
  fs.writeFileSync('./sql/minified/SQLinserts.sql', '')

  writeToSQL(
    './sql/SQLinserts.sql',
    'USER',
    users,
    './sql/minified/SQLinserts.sql'
  )
  writeToSQL(
    './sql/SQLinserts.sql',
    'Birthday',
    birthdays,
    './sql/minified/SQLinserts.sql'
  )
  writeToSQL(
    './sql/SQLinserts.sql',
    'Description',
    descriptions,
    './sql/minified/SQLinserts.sql'
  )
  writeToSQL(
    './sql/SQLinserts.sql',
    'Location',
    locations,
    './sql/minified/SQLinserts.sql'
  )
  writeToSQL(
    './sql/SQLinserts.sql',
    'ExternalLinks',
    externalLinks,
    './sql/minified/SQLinserts.sql'
  )
  writeToSQL(
    './sql/SQLinserts.sql',
    'URLSHORTENER',
    urlShortener,
    './sql/minified/SQLinserts.sql'
  )
  writeToSQL(
    './sql/SQLinserts.sql',
    'HASHTAG',
    hashtags,
    './sql/minified/SQLinserts.sql'
  )
  writeToSQL(
    './sql/SQLinserts.sql',
    'POST',
    posts,
    './sql/minified/SQLinserts.sql'
  )
  writeToSQL(
    './sql/SQLinserts.sql',
    'IncludesTag',
    includesTag,
    './sql/minified/SQLinserts.sql'
  )
  writeToSQL(
    './sql/SQLinserts.sql',
    'POLL',
    polls,
    './sql/minified/SQLinserts.sql'
  )
  writeToSQL(
    './sql/SQLinserts.sql',
    'Likes',
    likes,
    './sql/minified/SQLinserts.sql'
  )
  writeToSQL(
    './sql/SQLinserts.sql',
    'Replies',
    replies,
    './sql/minified/SQLinserts.sql'
  )
  writeToSQL(
    './sql/SQLinserts.sql',
    'Vote',
    votes,
    './sql/minified/SQLinserts.sql'
  )
}

generateData()
