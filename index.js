const { urlencoded } = require('express')
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const port = 9080
const bcrypt = require('bcrypt')
const session = require('express-session');
const Registration = require('./models/registration')
const multer = require('multer')
const Application = require('./models/application')
const path = require('path')
const { profile } = require('console')
const appdet = Application.find({})



mongoose.connect('mongodb://localhost:27017/Transcripts', {
    useNewUrlParser: true,

    useUnifiedTopology: true,

});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

//Storage
const Storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename: (req, profileimage, cb) => {
        cb(null, profileimage.fieldname + "_" + Date.now() + path.extname(profileimage.originalname))
    }

});

const upload = multer({
    storage: Storage,

}).single('profileimage');


// Static Files
app.use(express.static('public'))

app.use('/css', express.static(__dirname + 'public/css'))
app.use('/js', express.static(__dirname + 'public/js'))
app.use('public', express.static(__dirname + 'public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(session({ secret: 'notagoodsecret' }))
app.use(express.static(__dirname + "./public/"))
// Set Views
app.set('views', './views')
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('choice')
})

app.get('/adminhome', async(req, res) => {
    const areview = await Application.find({});
    res.render('adminhome', { areview });
})

app.get('/adminhome/apps', async (req, res) => {
    const areview = await Application.find({});
    res.render('apps', { areview });

})

app.get('/adminlogin', (req, res) => {

    res.render('adminlogin')
})

app.get('/adminregister', (req, res) => {
    res.send('yo')
})

app.post('/adminregister', async (req, res) => {
    const { password, username } = req.body
    const hash = await bcrypt.hash(password, 12);
    const reg = new registration({
        username,
        password: hash,
    })
    await reg.save();
    req.session.user_id = reg._id;
    res.redirect('/adminlogin')
})



app.post('/adminlogin', async (req, res) => {
    const { username, password } = req.body;
    const reg = await Registration.findOne({ username });
    console.log(reg)
    const validPassword = await bcrypt.compare(password, reg.password)
    console.log(password, reg.password)
    console.log(validPassword)

    if (validPassword) {
        //when logged in store user id in session using the req.session.user_id
        req.session.user_id = reg._id;
        res.redirect('/adminhome')
    }
    else {
        res.redirect('/adminlogin')
    }
})




//student section begins

app.get('/sturegister', (req, res) => {
    res.render('sturegister')
})

app.post('/sturegister', async (req, res) => {
    const { password, username } = req.body
    const hash = await bcrypt.hash(password, 12);
    const reg = new Registration({
        username,
        password: hash,
    })
    await reg.save();
    req.session.user_id = reg._id;
    res.redirect('/stulogin')
})

app.get('/stulogin', async (req, res) => {
    res.render('stulogin')
})

app.post('/stulogin', async (req, res) => {
    const { username, password } = req.body;
    const reg = await Registration.findOne({ username });
    console.log(reg)
    const validPassword = await bcrypt.compare(password, reg.password)
    console.log(password, reg.password)
    console.log(validPassword)

    if (validPassword) {
        //when logged in store user id in session using the req.session.user_id
        req.session.user_id = reg._id;
        res.redirect('/stuhome')
    }
    else {
        res.redirect('/stulogin')
    }
})

app.get('/stuhome', async (req, res) => {
    const reg = await Registration.find({});
    console.log(reg.username)
    res.render('stuhome', { reg })
})

app.get('/stuhome/transcriptdet', async (req, res) => {

    res.render('transcriptdet')

})

app.post('/stuhome/transcriptdet', upload, async (req, res) => {
    const { name, age, email, dob, rollno, seatno, profileimage } = req.body;
    console.log(req.file);
    const apply = new Application({
        name,
        age,
        email,
        dob,
        rollno,
        seatno,
        profileimage: req.file.filename,




    })
    await apply.save()
    res.redirect('/stuhome')
})

app.get('/adminhome/transcriptdet/show', async (req, res) => {
    const img = await Application.find({});
    res.render('show', { img })
})



//  Listen on port 3000
app.listen(port, () => console.info(`Listening on port ${port}`))