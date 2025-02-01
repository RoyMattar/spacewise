const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10; // For password hashing

/**
 * Route to display the login page.
 * Inputs: None
 * Outputs: Renders the 'login' view with an error message if any
 */
router.get('/login', (req, res) => {
    res.render('login');
});

/**
 * Route to handle login form submission.
 * Inputs: req.body.username, req.body.password
 * Outputs: Redirects to the home page if credentials are valid, otherwise re-renders the login page with an error message
 */
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Fetch user from SQLite database using parameterized query
        global.db.get(
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

                return res.json({ success: true, redirect: '/home' });
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
    const { username, password, role } = req.body;

    try {
        if (!username || !password || !role) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if the username already exists
        global.db.get(`SELECT user_id FROM users WHERE username = ?`, [username], async (err, user) => {
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
            global.db.run(
                `INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)`,
                [username, hashedPassword, role],
                function (err) {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ error: 'Failed to register user' });
                    }

                    return res.json({ success: true, redirect: '/'}); // Redirect to the welcome page after successful registration
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
router.get('/home', (req, res) => {
    if (req.session.user.role === 'admin') {
        res.render('adminHome');
    } else {
        res.render('studentHome');
    }
});

/**
 * Route to handle logout.
 * Inputs: None
 * Outputs: Destroys the session and redirects to the login page
 */
router.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
