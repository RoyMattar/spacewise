const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const requireAuth = require('../middleware/require_auth');
const saltRounds = 10; // For password hashing

function authRouter(db) {
    /**
     * Route to display the login page.
     * Inputs: None
     * Outputs: Renders the 'login' view with an error message if any
     */
    router.get('/login', (req, res) => {
        const errorMessage = req.session.errorMessage;
        req.session.errorMessage = null; // Clear error message after displaying
        res.render('login', { errorMessage });
    });

    /**
     * Route to handle login form submission.
     * Inputs: req.body.username, req.body.password
     * Outputs: Redirects to the home page if credentials are valid, otherwise re-renders the login page with an error message
     */
    router.post('/login', async (req, res) => {
        if (req.session.user) {
            return res.status(400).json({ error: "User is already logged in." });
        }

        const { username, password } = req.body;

        try {
            // Fetch user from SQLite database using parameterized query
            db.get(
                `SELECT user_id, username, role, password_hash FROM users WHERE username = ?`,
                [username],
                async (err, user) => {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ error: 'Internal server error' });
                    }

                    // If no user found
                    if (!user) {
                        return res.status(401).json({ error: 'User does not exist' });
                    }

                    // Compare entered password with stored hashed password
                    const validPassword = await bcrypt.compare(password, user.password_hash);
                    if (!validPassword) {
                        return res.status(401).json({ error: 'Incorrect password' });
                    }

                    // Store user data in session (excluding password hash)
                    req.session.user = {
                        id: user.user_id,
                        username: user.username,
                        role: user.role
                    };

                    // Store institution ID in session if user is admin - assume institution was creating when user registered
                    if (user.role === 'admin') {
                        db.get(
                            'SELECT institution_id FROM institutions WHERE admin_id = ?',
                            [user.user_id],
                            (err, institution) => {
                                if (err) {
                                    console.error('Database error:', err);
                                    return res.status(500).json({ error: 'Internal server error' });
                                }

                                req.session.user.institutionId = institution ? institution.institution_id : null;

                                // Ensure this is called after the institutionId is set
                                req.session.successMessage = 'Login successful! Welcome back.';
                                return res.json({ success: true, redirect: '/home' });
                            }
                        );
                    } else { // For students, respond immediately (no institution needed)
                        // Set success message in session
                        req.session.successMessage = 'Login successful! Welcome back.';
                        return res.json({ success: true, redirect: '/home' });
                    }
                }
            );
        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    });

    /**
     * Route to display the registration page.
     * Inputs: None
     * Outputs: Renders the 'register' view with an error message if any
     */
    router.get('/register', (req, res) => {
        res.render('register');
    });

    /**
     * Route to handle registration form submission.
     * Inputs: req.body.username, req.body.password, req.body.role
     * Outputs: Redirects to the welcome page after successful registration, otherwise re-renders the registration page with an error message
     */
    router.post('/register', async (req, res) => {
        const { username, password, role, institution_name, bio, address, opening_hours } = req.body;

        try {
            if (!username || !password || !role) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            // Check if the username already exists
            db.get(`SELECT user_id FROM users WHERE username = ?`, [username], async (err, user) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                if (user) {
                    return res.status(400).json({ error: 'Username already exists' });
                }

                // Hash the password
                const hashedPassword = await bcrypt.hash(password, saltRounds);

                // Insert the new user into the database
                db.run(
                    `INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)`,
                    [username, hashedPassword, role],
                    function (err) {
                        if (err) {
                            console.error('Database error:', err);
                            return res.status(500).json({ error: 'Failed to register user' });
                        }

                        console.log(`Created user in database: id=${this.lastID}, username=${username}, role=${role}.`);

                        // If user is an admin, also create their institution
                        if (role === 'admin') {
                            const adminId = this.lastID;
                            db.run(
                                'INSERT INTO institutions (institution_name, bio, address, opening_hours, admin_id) VALUES (?, ?, ?, ?, ?)',
                                [institution_name, bio, address, opening_hours, adminId],
                                function (err) {
                                    if (err) {
                                        console.error('Database error:', err);
                                        return res.status(500).json({ error: 'Failed to create institution' });
                                    }

                                    const institutionId = this.lastID;
                                    console.log(`Created institution in database: id=${institutionId}, name=${institution_name}.`);

                                    // Attach the institution_id to the admin user
                                    db.run(
                                        'UPDATE users SET institution_id = ? WHERE user_id = ?',
                                        [institutionId, adminId],
                                        function (err) {
                                            if (err) {
                                                console.error('Database error:', err);
                                                return res.status(500).json({ error: 'Failed to link institution to admin user' });
                                            }

                                            console.log(`Linked institution_id=${institutionId} to admin user_id=${adminId}.`);

                                            req.session.successMessage = 'Registration successful! You can now log in.';
                                            return res.json({ success: true, redirect: '/'}); // Redirect to the welcome page after successful registration
                                        }
                                    );
                                }
                            );
                        } else {
                            // Set success message in session
                            req.session.successMessage = 'Registration successful! You can now log in.';
                            return res.json({ success: true, redirect: '/'}); // Redirect to the welcome page after successful registration
                        }
                    }
                );
            });
        } catch (error) {
            console.error('Registration error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    });

    /**
     * Route to display the main home page after login.
     * Inputs: None
     * Outputs: Renders the home views
     */
    router.get('/home', requireAuth, (req, res) => {
        const successMessage = req.session.successMessage;
        req.session.successMessage = null; // Clear message after displaying

        // Render the relevant home page with a login success message if exists
        if (req.session.user.role === 'admin') {
            res.render('adminHome', { successMessage, institutionId: req.session.user.institutionId });
        } else {
            res.render('studentHome', { successMessage });
        }
    });

    /**
     * Route to handle logout.
     * Inputs: None
     * Outputs: Destroys the session and redirects to the login page
     */
    router.post('/logout', requireAuth, (req, res) => {
        req.session.destroy();
        res.redirect('/');
    });

    return router;
}

module.exports = authRouter;
