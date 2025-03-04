// testSetup.js
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

function createTestApp() {
    const app = express();
    app.use(bodyParser.json()); // Parse JSON request bodies
    app.use(bodyParser.urlencoded({ extended: true })); // Parse form submissions
    app.use(session({
        secret: 'test-secret', // Use a hard-coded secret to simplify test setup
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false } // Ensure cookies work over HTTP and not HTTPS
    }));
    app.set('view engine', 'ejs'); // Set the app to use ejs for rendering

    // Set location of static files
    app.use(express.static(path.join(__dirname, '..', 'public', 'static')));
    app.use('/space_layouts', express.static(path.join(__dirname, '..', 'public', 'space_layouts')));

    return app;
}

module.exports = createTestApp;
