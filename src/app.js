const express = require('express');
const path = require('path');
const hbs = require('hbs');
const flash = require('connect-flash');
const session = require('express-session');
const dotenv = require('dotenv');
const helpers = require('./helpers');
const router = require('./router');

const port = process.env.PORT || 3000;

dotenv.config();
const app = express()


app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../templates'));

app.use(express.urlencoded({ extended: true }));
app.use('/media', express.static(path.join(__dirname, '../media')));
app.use(session({
    key: 'contactbooks',
    secret: process.env.SESSION_SECRET || 'contactbooks',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

app.use(flash());


app.use((req, res, next) => {
    res.locals.successMessage = req.flash('successMessage');
    res.locals.errorMessage = req.flash('errorMessage');
    res.locals.currentUrl = req.originalUrl;
    res.locals.user = req.session.user;
    next();
});


hbs.registerPartials(path.join(__dirname, '../templates/partials'))
hbs.registerHelper(helpers); //Helper





// Use routes
app.use('/', router);

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
} else {
    module.exports = app;
}