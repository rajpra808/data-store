const express = require('express');
const app = express();
var fs = require('fs');
var bodyParser = require('body-parser')
var archiver = require('archiver');
var path = require('path');
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

const directory = __dirname + '/data';

function getFiles(dir, files_) {
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files) {
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, files_);
        } else {
            files_.push(name);
        }
    }
    return files_;
}


app.get('/', (req, res) => {
    res.send('This is indoor mapping api!');
})

app.post('/add', (req, res) => {
    const {file, content} = req.body;
     
    fs.appendFileSync(directory + '/' + file, content+"\n");
    res.send("completed");
})

app.delete('/clear', (req, res) => {
    fs.readdir(directory, (err, files) => {
        if (err) throw err;

        for (const file of files) {
            fs.unlink(path.join(directory, file), err => {
                if (err) throw err;
            });
        }
    });
    res.send('Cleaned');
})

app.get('/data', (req, res) => {
    // Tell the browser that this is a zip file.
    res.writeHead(200, {
        'Content-Type': 'application/zip',
        'Content-disposition': 'attachment; filename=my_data.zip'
    });

    var archive = archiver('zip');

    archive.on('error', function (err) {
        res.status(500).send({ error: err.message });
    });

    //on stream closed we can end the request
    archive.on('end', function () {
        console.log('Archive wrote %d bytes', archive.pointer());
    });


    archive.pipe(res);

    var files = getFiles(directory);
    console.log(files);

    for (var i in files) {
        archive.file(files[i], { name: path.basename(files[i]) });
    }

    archive.finalize();
})

app.listen(process.env.PORT | 7070, () => {
    console.log(`listening`);
})