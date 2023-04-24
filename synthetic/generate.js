const fs = require('fs');
const {
    head
} = require('../helpers/router');

// Generate data
generateUsers(20);
generateExternalLinks(10);
urlShortener(10);
hashtag(4);

function generateUsers(n) {
    const headers = ["Username, CreatedTime, Birthday, Description", "Location", "Hash", "Salt"];

    var data = [],
        date = new Date(),
        bdate = new Date();

    date.setDate(date.getDate() - n * 2);
    bdate.setDate(date.getMonth() - n * 2);

    for (var i = 0; i < n; i++) {
        var row = [];
        row.push("user" + i);

        date.setDate(date.getDate() + 2);
        row.push(date.toISOString());

        bdate.getMonth(bdate.getMonth() + 2);
        row.push(bdate.toISOString());

        row.push("description " + i);

        row.push("location " + i);

        row.push(makeid(120));
        row.push(makeid(64));
        data.push(row);
    }

    writeToSQL("USER", headers, data, "./synthetic/SynthUser.sql");
}

function generateExternalLinks(n) {
    var data = [];
    for (var i = 0; i < n; i++) {
        var row = [];
        row.push("user" + i);
        row.push("https://www.example-link.com/1");
        data.push(row);
        row = [];
        row.push("user" + i);
        row.push("https://www.example-link.com/2");
        data.push(row);
        row = [];
        row.push("user" + i);
        row.push("https://www.example-link.com/3");
        data.push(row);
    }

    const headers = ["Username", "Link"];
    writeToSQL("ExternalLinks", headers, data, "./synthetic/SynthELinks.sql");
}

function urlShortener(n) {
    var data = [];
    for (var i = 0; i < n; i++) {
        var row = [];
        row.push("https://www.url-to-shorten-number-" + i + ".com/");
        data.push(row);
    }

    const headers = ["OriginalURL"];
    writeToSQL("URLSHORTENER", headers, data, "./synthetic/urlShorten.sql");
}

function urlShortener(n) {
    var data = [];
    for (var i = 0; i < n; i++) {
        var row = [];
        row.push("https://www.url-to-shorten-number-" + i + ".com/");
        data.push(row);
    }

    const headers = ["OriginalURL"];
    writeToSQL("URLSHORTENER", headers, data, "./synthetic/urlShorten.sql");
}

function hashtag(n) {
    var data = [];
    for (var i = 0; i < n; i++) {
        var row = [];
        row.push("#hashtag" + i);
        data.push(row);
    }

    const headers = ["Tag"];
    writeToSQL("HASHTAG", headers, data, "./synthetic/hashtag.sql");
}

function post(n) {
    var data = [];
    for (var i = 0; i < n; i++) {
        var row = [];
        row.push("example" + i);
        data.push(row);
    }

    const headers = ["Contents", "CreatedTime", "PosterUsername", "ShortLinkID"];
    writeToSQL("POST", headers, data, "./synthetic/POST.sql");
}


function example(n) {
    var data = [];
    for (var i = 0; i < n; i++) {
        var row = [];
        row.push("example" + i);
        data.push(row);
    }

    const headers = ["header"];
    writeToSQL("table", headers, data, "./synthetic/table.sql");
}

function writeToSQL(tableName, headers, data, fname) {
    fs.writeFileSync(fname, "");
    const firstLine = `insert into ${tableName} (${headers.join(', ')})\n`;

    append(firstLine, fname);
    for (var i = 0; i < data.length; i++) {
        let start = "       ('",
            end = "'),\n";
        if (i == 0) start = "VALUES('";
        if (i == data.length - 1) end = ");";
        var line = start + data[i].join("', '") + end;
        append(line, fname)
    }
}

function append(str, fname) {
    fs.appendFileSync(fname, str, err => {
        if (err) console.error(err);
    });
}

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

process.exit();