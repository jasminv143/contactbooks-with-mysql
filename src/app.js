const express = require('express');
const path = require('path');
const hbs = require('hbs');
const con = require('./db');
const flash = require('connect-flash');
const session = require('express-session');
const app = express()

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../templates'));

app.use(express.urlencoded({ extended: true }));
app.use('/media', express.static(path.join(__dirname, '../media')));
hbs.registerPartials(path.join(__dirname, '../templates/partials'))

app.use(session({
    key: 'session_cookie_name',
    secret: 'your_secret_key',
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
hbs.registerHelper('eq', function (a, b) {
    return a == b;
});

hbs.registerHelper('isActive', function(currentUrl, linkUrl) {
    return currentUrl === linkUrl ? 'active' : '';
});

hbs.registerHelper('removeHref', function(currentUrl, linkUrl) {
    return currentUrl === linkUrl ? 'javascript:void(0);' : linkUrl;
});

app.get('/', function (req, res) {
    if (req.session.user) {
        res.redirect('/home');
    }else{

        res.render("index",{ 
            headerTitle:"ContactBook - Login"
        });
    }
    
})
app.post('/', function (req, res) {
    if (req.session.user) {
        res.redirect('/home');
    }else{
        const { username, password } = req.body;
        con.pool.query(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, password], (err, results) => {
            if (err) {
                console.error(err);
                req.flash('errorMessage', 'An error occurred during login.');
                res.redirect('/');
            } else if (results.length > 0) {
                req.flash('successMessage', 'Login successfully!');
                req.session.user = results[0];
                res.redirect('/home');
            } else {
                req.flash('errorMessage', 'Invalid username or password.');
                res.redirect('/');
            }
        });
    }
});

app.get('/register', function (req, res) {
    if (req.session.user) {
        res.redirect('/home');
    }else{
        res.render("register",{
            headerTitle:"ContactBook - Home"
        });
    }
})

app.post('/register', function (req, res) {
    if (req.session.user) {
        res.redirect('/home');
    }else{
        con.insertRecord("users", req.body)
            .then(() => {
                req.flash('successMessage', 'User registered successfully!');
                res.redirect('/'); 
            })
            .catch((err) => {
                console.error(err);
                req.flash('errorMessage', 'User registration failed.');
                res.redirect('/register'); 
            });
        return; 
    }
})

app.get('/home', function (req, res) {
    if (req.session.user) {
        const userId = req.session.user.id;
        con.pool.query('SELECT * FROM contacts WHERE uid = ? ', [userId], (err, results) => {
            if (err) {
                console.error(err);
                req.flash('errorMessage', 'Failed to load contacts.');
                return res.redirect('/');
            }
            res.render('home', {
                headerTitle: "ContactBook - Home",
                contacts: results
            });
        });
    } else {
        req.flash('errorMessage', 'Please Login.');
        res.redirect('/');
    }
    // const userId = req.session.user.id;
    // const userId = 1;
    // const page = parseInt(req.query.page) || 1;
    // const limit = parseInt(req.query.limit) || 10;
    // const offset = (page - 1) * limit;

    // con.pool.query('SELECT COUNT(*) AS count FROM contacts WHERE uid = ?', [userId], (err, countResults) => {
    //     if (err) {
    //         console.error(err);
    //         req.flash('errorMessage', 'Failed to load contacts.');
    //         return res.redirect('/');
    //     }

    //     const totalContacts = countResults[0].count;
    //     const totalPages = Math.ceil(totalContacts / limit);

    //     con.pool.query('SELECT * FROM contacts WHERE uid = ? LIMIT ? OFFSET ?', [userId, limit, offset], (err, results) => {
    //         if (err) {
    //             console.error(err);
    //             req.flash('errorMessage', 'Failed to load contacts.');
    //             return res.redirect('/');
    //         }

    //         res.render('home', {
    //             headerTitle: "ContactBook - Home",
    //             contacts: results,
    //             currentPage: page,
    //             totalPages: totalPages
    //         });
    //     });
    // });
});

app.get('/contactform', function (req, res) {
    if (req.session.user) {
        var headerTitle = "ContactBook - Add New Contact";
        var update = false;
        var currentRecord = null;

        if (req.query.id) {
            headerTitle = "ContactBook - Edit Contact"; // Change title if id is present
            update = true;

            const userId = req.session.user.id;
            const contactId = req.query.id;

            con.pool.query('SELECT * FROM contacts WHERE uid = ? AND id = ?', [userId, contactId], (err, results) => {
                if (err) {
                    console.error(err);
                    req.flash('errorMessage', 'Failed to load contact.');
                    return res.redirect('/home');
                }

                if (results.length > 0) {
                    currentRecord = results[0];
                    console.log(currentRecord);
                    res.render("addNewContact", {
                        headerTitle: headerTitle,
                        isUpdate: update,
                        currentRecord: currentRecord
                    });
                } else {
                    req.flash('errorMessage', 'Contact not found or you do not have permission to edit this contact.');
                    res.redirect('/home');
                }
            });
        } else {
            res.render("addNewContact", {
                headerTitle: headerTitle,
                isUpdate: update,
                currentRecord: currentRecord
            });
        }
    } else {
        req.flash('errorMessage', 'Please Login.');
        res.redirect('/');
    }
});
app.post('/contactform', function (req, res) {
    if (req.session.user) {
        if(req.body.id){
            // Update existing contact
            var userId = req.session.user.id;
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
        }else{
            req.body.uid = req.session.user.id;
            con.insertRecord("contacts", req.body)
                .then(() => {
                    req.flash('successMessage', 'Contact added successfully!');
                    res.redirect('/home'); 
                })
                .catch((err) => {
                    console.error(err);
                    req.flash('errorMessage', 'Failed to add contact.');
                    res.redirect('/contactform');
                });
            return; 
        }
    }else {
        req.flash('errorMessage', 'Please Login.');
        res.redirect('/');
    }
});

app.get('/deleteContact', function (req, res) {
    if (req.session.user) {
        const contactId = req.query.id;

        con.pool.query('DELETE FROM contacts WHERE id = ? AND uid = ?', [contactId, req.session.user.id], (err, results) => {
            if (err) {
                console.error(err);
                req.flash('errorMessage', 'Failed to delete contact.');
                return res.redirect('/home');
            }

            if (results.affectedRows > 0) {
                req.flash('successMessage', 'Contact deleted successfully.');
            } else {
                req.flash('errorMessage', 'Contact not found or you do not have permission to delete this contact.');
            }
            res.redirect('/home');
        });
    } else {
        req.flash('errorMessage', 'Please Login.');
        res.redirect('/');
    }
});
app.post('/deleteContacts', (req, res) => {
    const { check } = req.body;
    
    if (!check || !Array.isArray(check) || check.length === 0) {
        req.flash('errorMessage', 'No contacts selected for deletion.');
        return res.redirect('/home');
    }

    // Convert check array values to integers (IDs)
    const contactIds = check.map(id => parseInt(id));
    var userId = req.session.user.id;

    // Delete contacts with the selected IDs
    con.pool.query('DELETE FROM contacts WHERE id IN (?) AND uid = (?)', [contactIds,userId], (err, results) => {
        if (err) {
            console.error(err);
            req.flash('errorMessage', 'Failed to delete contacts.');
        } else {
            const affectedRows = results.affectedRows;
            if (affectedRows > 0) {
                req.flash('successMessage', `${affectedRows} contact(s) deleted successfully.`);
            } else {
                req.flash('errorMessage', 'No contacts were deleted.');
            }
        }
        res.redirect('/home');
    });
});

app.get('/profile', function (req, res) {
    if (!req.session.user) {
        req.flash('errorMessage', 'Please Login.');
        res.redirect('/');
    }else{
        res.render('profile', {
            headerTitle: "ContactBook - Profile"
        });
    }
});
app.post('/deleteUser', (req, res) => {
    const {password } = req.body;
    if (password === req.session.user.password) {
        var userId = req.session.user.id;

        con.pool.query('DELETE FROM users WHERE id = ?', [userId], (err, results) => {
            if (err) {
                console.error(err);
                req.flash('errorMessage', 'Failed to delete user.');
            } else {
                req.flash('successMessage', 'User deleted successfully.');
                delete req.session.user;
                res.redirect('/');
            }
        });
    } else {
        req.flash('errorMessage', 'Incorrect password.');
        res.redirect('/profile');
    }
});
app.post('/profileEdit', (req, res) => {
    const { username, email, newPassword, oldPassword, changePassword } = req.body;
    const userId = req.session.user.id;

    // Check if old password matches
    if (oldPassword !== req.session.user.password) {
        req.flash('errorMessage', 'Incorrect old password.');
        return res.redirect('/profile');
    }

    // Check if the new email is already used by another user
    con.pool.query('SELECT * FROM users WHERE email = ? AND id <> ?', [email, userId], (err, results) => {
        if (err) {
            console.error(err);
            req.flash('errorMessage', 'Database error.');
            return res.redirect('/profile');
        }

        if (results.length > 0) {
            req.flash('errorMessage', 'Email is already in use.');
            return res.redirect('/profile');
        }

        // Prepare update query based on password change option
        let updateData = {
            username: username,
            email: email
        };

        if (changePassword === 'yes') {
            updateData.password = newPassword;
        }

        // Execute the update query
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

// app.get('/fetchSortedContacts', (req, res) => {



  // const { field, order } = req.query;
  // const validFields = ['id', 'firstname', 'lastname', 'gender', 'phone_no', 'email', 'city'];

  // if (!validFields.includes(field) || !['asc', 'desc'].includes(order)) {
  //   return res.status(400).send('Invalid sort field or order');
  // }

  // const sql = `SELECT * FROM contacts ORDER BY ${field} ${order}`;
  // // console.log(sql);
  // con.pool.query(sql, (err, results) => {
  //   if (err) throw err;

  //   const sortedContactsHtml = results.map(contact => `
  //     <tr>
  //       <td><input class="mark submark" type="checkbox" name="check[]" value="${contact.id}"></td>
  //       <td>${contact.id}</td>
  //       <td>${contact.firstname}</td>
  //       <td>${contact.lastname}</td>
  //       <td>${contact.gender}</td>
  //       <td>${contact.phone_no}</td>
  //       <td>${contact.email}</td>
  //       <td>${contact.city}</td>
  //       <td></td>
  //       <td>
  //         <a href="/contactform?id=${contact.id}" class="btn btn-primary">Edit</a>
  //         <a href="javascript:void(0);" class="btn btn-danger" onclick='confirmdelete(${contact.id})'>Delete</a>
  //       </td>
  //     </tr>
  //   `).join('');

  //   res.send(sortedContactsHtml);
  // });
// });
app.get('/fetchSortedContacts', (req, res) => {
  const { field, order } = req.query;
  const validFields = ['id', 'firstname', 'lastname', 'gender', 'phone_no', 'email', 'city'];

  if (!validFields.includes(field) || !['asc', 'desc'].includes(order)) {
    return res.status(400).send('Invalid sort field or order');
  }

  const sql = `SELECT * FROM contacts ORDER BY ${field} ${order}`;
  con.pool.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching contacts:', err);
      return res.status(500).json({ error: 'Error fetching contacts' });
    }
    res.render(path.join(__dirname, '../templates/partials/contacts'), {
        contacts: results
    });
        
  });
});

app.post('/search', (req, res) => {
    const { field, searchField } = req.body;
    // const userId = req.session.user.id;
    const userId = 1;
    console.log(req.body);
    const query = `SELECT * FROM contacts WHERE uid = ? AND ${field} LIKE ?`;
    con.pool.query(query, [userId, `%${searchField}%`], (err, results) => {
        if (err) {
            console.error(err);
            req.flash('errorMessage', 'An error occurred while searching.');
            return res.redirect('/home');
        }
        
        res.render('partials/contacts', { contacts: results }, (err, html) => {
            if (err) {
                console.error(err);
                req.flash('errorMessage', 'An error occurred while rendering the results.');
                return res.redirect('/home');
            }
            res.send(html);
        });
    });
});


app.get('/logout', function (req, res) {
    if (!req.session.user) {
        req.flash('errorMessage', 'Please Login.');
        res.redirect('/');
    }else{
        if (delete req.session.user) {
            req.flash('successMessage', 'Logged out successfully.');
            res.redirect('/'); // Redirect to the login page or another page after successful logout
        } else {
            console.error('Error destroying session:', err);
            req.flash('errorMessage', 'Error logging out. Please try again.');
            res.redirect('/home'); // Redirect to the home page or another page if there's an error
        }
    }
});

app.listen(3000)