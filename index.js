/**
* index.js
* This is our main app entry point
*/

// Set up express
const express = require('express');
const app = express();

// Set up bodyparser
const bodyParser = require("body-parser");
// Parse URL-encoded form data (for normal form submissions)
app.use(bodyParser.urlencoded({ extended: true }));
// Parse JSON body (for AJAX fetch requests)
app.use(bodyParser.json());

// Set up EJS
app.set('view engine', 'ejs'); // set the app to use ejs for rendering
app.use(express.static(__dirname + '/static')); // set location of static files

// Set up dotenv for environment variables
const dotenv = require('dotenv');
dotenv.config();

// Set up express-session
const session = require('express-session');
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Not using HTTPS
}));

// Set up SQLite
// Items in the global namespace are accessible throughout the node application
const sqlite3 = require('sqlite3').verbose();
global.db = new sqlite3.Database('./database.db', function(err){
    if(err){
        console.error(err);
        process.exit(1); // bail out as we can't connect to the DB
    } else {
        console.log("Database connected");
        global.db.run("PRAGMA foreign_keys=ON"); // tell SQLite to pay attention to foreign key constraints
    }
});

// Main home page accessible to everyone
app.get('/', (req, res) => {
    const successMessage = req.session.successMessage;
    req.session.successMessage = null; // Clear message after displaying
    res.render('welcome', { successMessage }); // Render the welcome page with a registration success message if exists
});

// Routes for login and registration
const authRoutes = require('./routes/auth');
app.use('/', authRoutes);

// Institution routes
const institutionRoutes = require('./routes/institutions');
app.use('/institutions', institutionRoutes);

// Reservations routes
const reservationRoutes = require('./routes/reservations');
app.use('/reservations', reservationRoutes);

// Error handling middleware
app.use((err, req, res) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Make the web application listen for HTTP requests
app.listen(process.env.PORT, () => {
    console.log(`SpaceWise app listening on port ${process.env.PORT}`);
});
