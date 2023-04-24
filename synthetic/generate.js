const {
    faker
} = require('@faker-js/faker');
const crypto = require('crypto');
const fs = require('fs');

const NUM_USERS = 20;
const NUM_POSTS = 100;
const NUM_TAGS = 5;

const VOTE_CHANCE = 0.4;

function generateUsers() {
    let users = [];
    for (let i = 0; i < NUM_USERS; i++) {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(faker.internet.password(), salt, 1000, 64, `sha512`).toString(`hex`);
        users.push({
            Username: faker.internet.userName().substring(0, 255),
            CreatedTime: faker.date.past().toISOString(),
            Birthday: faker.date.past(50).toISOString().split('T')[0],
            Description: faker.lorem.sentence().substring(0, 255),
            Location: faker.address.city().substring(0, 255),
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
            Link: faker.internet.url().substring(0, 40)
        });
    }
    return externalLinks;
}

function generateUrlShortener() {
    let urlShortener = [];
    for (let i = 1; i <= NUM_POSTS; i++) {
        urlShortener.push({
            ID: i,
            OriginalURL: faker.internet.url().substring(0, 255)
        });
    }
    return urlShortener;
}

function generateHashtags() {
    let hashtags = [];
    for (let i = 0; i <= NUM_TAGS; i++) {
        hashtags.push({
            Tag: faker.lorem.slug(4).substring(0, 20)
        });
    }
    return hashtags;
}

function generatePosts(users, urlShortener) {
    let posts = [];
    for (let i = 1; i <= NUM_POSTS; i++) {
        posts.push({
            ID: i,
            Contents: faker.lorem.sentence().substring(0, 255),
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
            Title: faker.lorem.sentence().substring(0, 40),
            Option1Text: faker.lorem.word().substring(0, 40),
            Option2Text: faker.lorem.word().substring(0, 40)
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
        for (let post of posts) {
            if (Math.random() < VOTE_CHANCE)
                votes.push({
                    Username: user.Username,
                    PostID: post.ID,
                    Choice: Math.floor(Math.random() * 2) + 1
                });
        }
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

function writeToSQL(fname, tableName, data) {
    const firstLine = `\n\n-- Insert Statements for ${tableName}\ninsert into ${tableName} (${delete data[0].ID && Object.keys(data[0]).join(', ')})\n`;
    append(firstLine, fname);

    for (let i = 0; i < data.length; i++) {
        let start = "       ('",
            end = "'),\n";
        if (i == 0) start = "VALUES('";
        if (i == data.length - 1) end = "');";
        const line = start + Object.values(delete data[i].ID && data[i]).join("', '") + end;
        append(line, fname);
    }
}

function append(str, fname) {
    fs.appendFileSync(fname, str, err => {
        if (err) console.error(err);
    });
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

    fs.writeFileSync("./synthetic/SQLinserts.sql", "");

    writeToSQL("./synthetic/SQLinserts.sql", "USER", users);
    writeToSQL("./synthetic/SQLinserts.sql", "ExternalLinks", externalLinks);
    writeToSQL("./synthetic/SQLinserts.sql", "URLSHORTENER", urlShortener);
    writeToSQL("./synthetic/SQLinserts.sql", "HASHTAG", hashtags);
    writeToSQL("./synthetic/SQLinserts.sql", "POST", posts);
    writeToSQL("./synthetic/SQLinserts.sql", "POLL", polls);
    writeToSQL("./synthetic/SQLinserts.sql", "Likes", likes);
    writeToSQL("./synthetic/SQLinserts.sql", "Replies", replies);
    writeToSQL("./synthetic/SQLinserts.sql", "Vote", votes);
    writeToSQL("./synthetic/SQLinserts.sql", "IncludesTag", includesTag);
    // Insert data into database here
    console.log(posts);
}

generateData();