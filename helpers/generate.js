const {
    faker
} = require('@faker-js/faker');
const crypto = require('crypto');
const fs = require('fs');

const NUM_USERS = 20;
const NUM_POSTS = 100;

const LIKE_CHANCE = 0.4;

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

function generatePosts(users) {
    let posts = [];
    for (let i = 1; i <= NUM_POSTS; i++) {
        posts.push({
            ID: i,
            Contents: faker.lorem.sentence().substring(0, 255),
            CreatedTime: faker.date.past().toISOString(),
            PosterUsername: users[Math.floor(Math.random() * users.length)].Username
        });
    }
    return posts;
}

function generateLikes(users, posts) {
    let likes = [];
    for (let user of users) {
        for (let post of posts) {
            if (Math.random() < LIKE_CHANCE)
                likes.push({
                    Username: user.Username,
                    PostID: post.ID
                });
        }
    }
    return likes;
}

function writeToSQL(fname, tableName, data, minifyfname) {
    const tominify = (typeof minifyfname == 'undefined') ? false : true;

    const firstLine = `\n\n-- Insert Statements for ${tableName}\ninsert into ${tableName} (${delete data[0].ID && Object.keys(data[0]).join(', ')})\n`;
    append(firstLine, fname);

    if (tominify) {
        const mfirstLine = `insert into ${tableName} (${delete data[0].ID && Object.keys(data[0]).join(', ')}) `;
        append(mfirstLine, minifyfname);
    }

    for (let i = 0; i < data.length; i++) {
        let start = '       ("',
            end = '"),';
        if (i == 0) start = 'VALUES("';
        if (i == data.length - 1) end = '");';
        const line = start + Object.values(delete data[i].ID && data[i]).join('", "') + end;
        append(line + "\n", fname);

        if (tominify) {
            append(line, minifyfname);
        }
    }
}

function append(str, fname) {
    fs.appendFileSync(fname, str, err => {
        if (err) console.error(err);
    });
}

function generateData() {
    const users = generateUsers();
    const posts = generatePosts(users);
    const likes = generateLikes(users, posts);

    fs.writeFileSync("./sql/SQLinserts.sql", "");
    fs.writeFileSync("./sql/minified/SQLinserts.sql", "");

    writeToSQL("./sql/SQLinserts.sql", "USER", users, "./sql/minified/SQLinserts.sql");
    writeToSQL("./sql/SQLinserts.sql", "POST", posts, "./sql/minified/SQLinserts.sql");
    writeToSQL("./sql/SQLinserts.sql", "Likes", likes, "./sql/minified/SQLinserts.sql");
}

generateData();