const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

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
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (role === "admin") { // TODO: resolve from DB
        req.session.isAdmin = true;
    }

    req.session.userId = null; // TODO: get from DB
    return res.redirect('/home');
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
 * Outputs: Redirects to the login page after successful registration, otherwise re-renders the registration page with an error message
 */
router.post('/register', (req, res) => {
    res.redirect('/login');
});

/**
 * Route to display the main home page after login.
 * Inputs: None
 * Outputs: Renders the home views
 */
router.get('/home', function (req, res, next) {
    if (req.session.isAdmin) {
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
