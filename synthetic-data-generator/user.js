const fs = require('fs');

// Generate data

function generateUsers(n) {
    var data = [];
    for (var i = 0; i < n; i++) {
        const createdTime = new Date().min
        for (var j = 0; j < i; j++)
        
        data.push("user"+n, )
    }
}

writeToSQL()

function writeToSQL(tableName, headers, data) {
    const firstLine = `insert into ${tableName} (${headers.join(', ')})`;

    append(firstLine, fname);
    for (var i = 0; i < data.length; i++) {
        let start = "       ('",
            end = "'),";
        if ( i == 0 ) start = "VALUES('";
        if ( i == data.length - 1 ) end = ");";
        var line = start + data[i].join("', '");
        append(line, fname)
    }
}

function append(str, fname) {
    fs.appendFile(fname, str, err => {
        if (err) console.error(err);
    });
}