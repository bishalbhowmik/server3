const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const cors = require('cors');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(cors());
app.use(express.json());
// app.set('view engine', 'ejs');

//Mongo URI

const mongoURI = `mongodb+srv://bishalbhomwik:wUL5y0BeuThF84ka@project1.ee2s1rz.mongodb.net/filesList?retryWrites=true&w=majority`;

// Create mongo connection

const conn = mongoose.createConnection(mongoURI);



//Init gfs

let gfs;

conn.once('open', () => {
    //Init stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
})

// Create storage engine
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
        });
    }
});
const upload = multer({ storage });


//@route GET /
//@desc Loads form


app.get('/', (req, res) => {
    res.send('server running');
})

//@route POST /upload
//@desc uploads file to DB

app.post('/upload', upload.single('file'), (req, res) => {
    

    // res.redirect('http://localhost:3000');

    res.json({file: req.file});
    // res.send('successful');



    
})

//@route GET /files
//@desc Display all files in JSON

app.get("/files", async (req, res) => {
    const file = await gfs.files?.find().toArray();
    res.json({ 'file': file });

});

// app.get("/files/:filename", async (req, res) => {
//     const file = await gfs.files.findOne({ filename: req.params.filename });
//     console.log(file);
//     res.json({'file': file.toArray()});

// });




const port = 5000;

app.listen(port, () => {
    console.log('server running', port);
})