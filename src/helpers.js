const moment = require('moment');
const bcrypt = require('bcryptjs');

module.exports = {
    ensureLoggedIn: (req, res, next) => {
        if (!req.session.user) {
            req.flash('errorMessage', 'Please Login.');
            return res.redirect('/');
        }
        next();
    },

    ensureNotLoggedIn: (req, res, next) => {
        if (req.session.user) {
            return res.redirect('/home');
        }
        next();
    },

    dateTime: (date, format) => moment(date).format(format),
    eq: (a, b) => a == b,
    gt: (a, b) => a > b,
    lt: (a, b) => a < b,
    add: (a, b) => a + b,
    subtract: (a, b) => a - b,
    paginationLinks: (currentPage, totalPages) => {
        let links = [];
        for (let i = 1; i <= totalPages; i++) {
            links.push({ number: i, active: i === currentPage });
        }
        return links;
    },
    isActive: (currentUrl, linkUrl) => (currentUrl === linkUrl ? 'active' : ''),
    removeHref: (currentUrl, linkUrl) => (currentUrl === linkUrl ? 'javascript:void(0);' : linkUrl)
};
