const express = require('express');
const router = express.Router();
const con = require('./db');
const bcrypt = require('bcryptjs');
const helpers = require('./helpers');

router.get('/', helpers.ensureNotLoggedIn, (req, res) => {
    res.render('index', { headerTitle: 'ContactBook - Login' });
});

router.post('/', helpers.ensureNotLoggedIn, (req, res) => {
    const { username, password } = req.body;
    con.pool.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error(err);
            req.flash('errorMessage', 'An error occurred during login.');
            res.redirect('/');
        } else if (results.length > 0 && bcrypt.compareSync(password, results[0].password)) {
            req.flash('successMessage', 'Login successfully!');
            req.session.user = results[0];
            res.redirect('/home');
        } else {
            req.flash('errorMessage', 'Invalid username or password.');
            res.redirect('/');
        }
    });
});

router.get('/register', helpers.ensureNotLoggedIn, (req, res) => {
    res.render('register', { headerTitle: 'ContactBook - Register' });
});

router.post('/register', helpers.ensureNotLoggedIn, (req, res) => {
    req.body.password = bcrypt.hashSync(req.body.password, 5);
    con.insertRecord('users', req.body)
        .then(() => {
            req.flash('successMessage', 'User registered successfully!');
            res.redirect('/');
        })
        .catch(err => {
            console.error(err);
            req.flash('errorMessage', 'User registration failed.');
            res.redirect('/register');
        });
});

router.get('/home', helpers.ensureLoggedIn, (req, res) => {
    const userId = req.session.user.id;
    const params = req.query || {};
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 10;
    const offset = (page - 1) * limit;
    const sortOrder = params.sortOrder || null;
    const sortField = params.sortField || null;
    const searchField = params.searchField || null;
    const q = params.q || null;

    let countQuery = `SELECT COUNT(*) AS count FROM contacts WHERE uid = ${userId}`;
    if (searchField) countQuery += ` AND ${searchField} LIKE '%${q}%'`;

    con.pool.query(countQuery, (err, countResults) => {
        if (err) {
            console.error(err);
            req.flash('errorMessage', 'Failed to load contacts.');
            return res.redirect('/home');
        }
        const totalContacts = countResults[0].count;
        const totalPages = Math.ceil(totalContacts / limit);

        let query = `SELECT * FROM contacts WHERE uid = ${userId}`;
        if (searchField) query += ` AND ${searchField} LIKE '%${q}%'`;
        if (sortField) query += ` ORDER BY ${sortField} ${sortOrder}`;
        query += ` LIMIT ${limit} OFFSET ${offset}`;

        con.pool.query(query, (err, results) => {
            if (err) {
                console.error(err);
                req.flash('errorMessage', 'An error occurred while searching.');
                return res.redirect('/home');
            }
            res.render('home', {
                headerTitle: 'ContactBook - Home',
                contacts: results,
                currentPage: page,
                totalPages: totalPages,
                limit: limit
            });
        });
    });
});

router.get('/contactform', helpers.ensureLoggedIn, (req, res) => {
    const headerTitle = req.query.id ? 'ContactBook - Edit Contact' : 'ContactBook - Add New Contact';
    const update = !!req.query.id;
    const userId = req.session.user.id;
    const contactId = req.query.id;

    if (update) {
        con.pool.query('SELECT * FROM contacts WHERE uid = ? AND id = ?', [userId, contactId], (err, results) => {
            if (err) {
                console.error(err);
                req.flash('errorMessage', 'Failed to load contact.');
                return res.redirect('/home');
            }
            res.render('addNewContact', {
                headerTitle: headerTitle,
                isUpdate: update,
                currentRecord: results[0] || null
            });
        });
    } else {
        res.render('addNewContact', {
            headerTitle: headerTitle,
            isUpdate: update,
            currentRecord: null
        });
    }
});

router.post('/contactform', helpers.ensureLoggedIn, (req, res) => {
    const userId = req.session.user.id;
    if (req.body.id) {
        const updateData = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            phone_no: req.body.phone_no,
            email: req.body.email,
            gender: req.body.gender,
            city: req.body.city
        };
        const contactId = req.body.id;

        con.pool.query('UPDATE contacts SET ? WHERE id = ? AND uid = ?', [updateData, contactId, userId], (err, results) => {
            if (err) {
                console.error(err);
                req.flash('errorMessage', 'Failed to update contact.');
                return res.redirect('/home');
            }
            if (results.affectedRows > 0) {
                req.flash('successMessage', 'Contact updated successfully!');
            } else {
                req.flash('errorMessage', 'Contact not found or you do not have permission to edit this contact.');
            }

            res.redirect('/home');
        });
    } else {
        req.body.uid = userId;
        con.insertRecord('contacts', req.body)
            .then(() => {
                req.flash('successMessage', 'Contact added successfully!');
                res.redirect('/home');
            })
            .catch(err => {
                console.error(err);
                req.flash('errorMessage', 'Failed to add contact.');
                res.redirect('/contactform');
            });
    }
});

router.delete('/deleteContact', helpers.ensureLoggedIn, (req, res) => {
    const contactId = req.body.id;
    const userId = req.session.user.id;

    con.deleteRecord('contacts', { id: contactId, uid: userId })
        .then(results => {
            if (results.affectedRows > 0) {
                res.json({ status: 'success', message: 'Contact deleted successfully.' });
            } else {
                res.json({ status: 'error', message: 'Contact not found or you do not have permission to delete this contact.' });
            }
        })
        .catch(err => {
            console.error(err);
            res.json({ status: 'error', message: 'Failed to delete contact.' });
        });
});

router.delete('/deleteContacts', helpers.ensureLoggedIn, (req, res) => {
    const contactIds = req.body.ids;
    const userId = req.session.user.id;

    con.deleteRecord('contacts', { id: contactIds, uid: userId })
        .then(results => {
            const affectedRows = results.affectedRows;
            if (affectedRows > 0) {
                res.json({
                    status: 'success',
                    message: `${affectedRows} contact(s) deleted successfully.`
                });
            } else {
                res.json({ 
                    status:"error", 
                    message: 'No contacts were deleted.' 
                });
            }
        })
        .catch(err => {
            console.error(err);
            res.json({ status: 'error', message: 'Failed to delete contacts.' });
        });
});

router.get('/profile', helpers.ensureLoggedIn, (req, res) => {
    res.render('profile', { headerTitle: 'ContactBook - Profile' });
});

router.post('/deleteUser', helpers.ensureLoggedIn, (req, res) => {
    const { password } = req.body;
    if (bcrypt.compareSync(password, req.session.user.password)) {
        const userId = req.session.user.id;

        con.deleteRecord('users', { id: userId })
            .then(() => {
                req.flash('successMessage', 'User deleted successfully.');
                delete req.session.user;
                res.redirect('/');
            })
            .catch(err => {
                console.error(err);
                req.flash('errorMessage', 'Failed to delete user.');
                res.redirect('/profile');
            });
    } else {
        req.flash('errorMessage', 'Incorrect password.');
        res.redirect('/profile');
    }
});

router.post('/profileEdit', helpers.ensureLoggedIn, (req, res) => {
    const { username, email, newPassword, oldPassword, changePassword } = req.body;
    const userId = req.session.user.id;

    if(!bcrypt.compareSync(oldPassword, req.session.user.password)){
        req.flash('errorMessage', 'Incorrect old password.');
        return res.redirect('/profile');
    }
    con.pool.query('SELECT * FROM users WHERE email = ? AND id <> ?', [email, userId], (err, results) => {
        if (err) {
            console.error(err);
            req.flash('errorMessage', 'An error occurred.');
            return res.redirect('/profile');
        }

        if (results.length > 0) {
            req.flash('errorMessage', 'Email is already in use.');
            return res.redirect('/profile');
        }
        let updateData = {
            username: username,
            email: email
        };
        if (changePassword === 'yes') {
            updateData.password = bcrypt.hashSync(newPassword, 5);
        }
        con.pool.query('UPDATE users SET ? WHERE id = ?', [updateData, userId], (err, results) => {
            if (err) {
                console.error(err);
                req.flash('errorMessage', 'Failed to update user.');
            } else {
                req.flash('successMessage', 'User updated successfully.');
                // Optionally update session with new user data
                req.session.user.username = username;
                req.session.user.email = email;
            }
            res.redirect('/profile');
        });
    });
});

router.get('/allinone', helpers.ensureLoggedIn, (req, res) => {
    const userId = req.session.user.id;
    const params = req.query || {};
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 10;
    const offset = (page - 1) * limit;
    const sortOrder = params.sortOrder || null;
    const sortField = params.sortField || null;
    const searchField = params.searchField || null;
    const q = params.q || null;

    let countQuery = `SELECT COUNT(*) AS count FROM contacts WHERE uid = ${userId}`;
    if (searchField) countQuery += ` AND ${searchField} LIKE '%${q}%'`;

    con.pool.query(countQuery, (err, countResults) => {
        if (err) {
            console.error(err);
            req.flash('errorMessage', 'Failed to load contacts.');
            return res.redirect('/');
        }
        const totalContacts = countResults[0].count;
        const totalPages = Math.ceil(totalContacts / limit);

        let query = `SELECT * FROM contacts WHERE uid = ${userId}`;
        if (searchField) query += ` AND ${searchField} LIKE '%${q}%'`;
        if (sortField) query += ` ORDER BY ${sortField} ${sortOrder}`;
        query += ` LIMIT ${limit} OFFSET ${offset}`;

        con.pool.query(query, (err, results) => {
            if (err) {
                req.flash('errorMessage', 'An error occurred while searching.');
                return res.redirect('/home');
            }
            
            res.render('partials/contacts', {
                contacts: results,
                totalPages: totalPages,
                limit: limit,
                currentPage: page
            }, (err, html) => {
                if (err) {
                    console.error(err);
                    req.flash('errorMessage', 'An error occurred while rendering the results.');
                    return res.redirect('/home');
                }
                res.send(html);
            });
        });
    });
});

router.get('/logout', helpers.ensureLoggedIn, (req, res) => {
    if(delete req.session.user) {
        req.flash('successMessage', 'Logged out successfully.');
        res.redirect('/'); 
    } else {
        console.error('Error destroying session:', err);
        req.flash('errorMessage', 'Error logging out. Please try again.');
        res.redirect('/home'); 
    }
});

router.get('/*', (req, res) => {
    res.status(404).render('404');
});

module.exports = router;
