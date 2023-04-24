const { faker } = require('@faker-js/faker');
const crypto = require('crypto');

const NUM_USERS = 10;
const NUM_POSTS = 20;
const NUM_TAGS = 5;

function generateUsers() {
    let users = [];
    for (let i = 0; i < NUM_USERS; i++) {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(faker.internet.password(), salt, 1000, 64, `sha512`).toString(`hex`);
        users.push({
            Username: faker.internet.userName(),
            CreatedTime: faker.date.past().toISOString(),
            Birthday: faker.date.past(50).toISOString().split('T')[0],
            Description: faker.lorem.sentence(),
            Location: faker.address.city(),
            Hash: hash,
            Salt: salt
        });
    }
    return users;
}

function generateExternalLinks(users) {
    let externalLinks = [];
    for (let user of users) {
        externalLinks.push({
            Username: user.Username,
            Link: faker.internet.url()
        });
    }
    return externalLinks;
}

function generateUrlShortener() {
    let urlShortener = [];
    for (let i = 0; i < NUM_POSTS; i++) {
        urlShortener.push({
            OriginalURL: faker.internet.url()
        });
    }
    return urlShortener;
}

function generateHashtags() {
    let hashtags = [];
    for (let i = 0; i < NUM_TAGS; i++) {
        hashtags.push({
            Tag: faker.lorem.word()
        });
    }
    return hashtags;
}

function generatePosts(users, urlShortener) {
    let posts = [];
    for (let i = 0; i < NUM_POSTS; i++) {
        posts.push({
            Contents: faker.lorem.sentence(),
            CreatedTime: faker.date.past().toISOString(),
            PosterUsername: users[Math.floor(Math.random() * users.length)].Username,
            ShortLinkID: urlShortener[Math.floor(Math.random() * urlShortener.length)].ID
        });
    }
    return posts;
}

function generatePolls(posts) {
    let polls = [];
    for (let post of posts) {
        polls.push({
            PostID: post.ID,
            Title: faker.lorem.sentence(),
            Option1Text: faker.lorem.word(),
            Option2Text: faker.lorem.word()
        });
    }
    return polls;
}

function generateLikes(users, posts) {
    let likes = [];
    for (let user of users) {
        likes.push({
            Username: user.Username,
            PostID: posts[Math.floor(Math.random() * posts.length)].ID
        });
    }
    return likes;
}

function generateReplies(posts) {
    let replies = [];
    for (let post of posts) {
        replies.push({
            ReplyPostID: post.ID,
            OriginalPostID: posts[Math.floor(Math.random() * posts.length)].ID
        });
    }
    return replies;
}

function generateVotes(users, posts) {
    let votes = [];
    for (let user of users) {
        votes.push({
            Username: user.Username,
            PostID: posts[Math.floor(Math.random() * posts.length)].ID,
            Choice: Math.floor(Math.random() * 2)
        });
    }
    return votes;
}

function generateIncludesTag(posts, hashtags) {
    let includesTag = [];
    for (let post of posts) {
        includesTag.push({
            PostID: post.ID,
            Tag: hashtags[Math.floor(Math.random() * hashtags.length)].Tag
        });
    }
    return includesTag;
}

function generateData() {
    const users = generateUsers();
    const externalLinks = generateExternalLinks(users);
    const urlShortener = generateUrlShortener();
    const hashtags = generateHashtags();
    const posts = generatePosts(users, urlShortener);
    const polls = generatePolls(posts);
    const likes = generateLikes(users, posts);
    const replies = generateReplies(posts);
    const votes = generateVotes(users, posts);
    const includesTag = generateIncludesTag(posts, hashtags);

   // Insert data into database here
   console.log(posts);
}

generateData();