/**
 * Middleware to require login by ensuring the user is authenticated.
 * Purpose: To restrict access to certain routes only to logged in users.
 * Inputs: None
 * Outputs: Calls the next middleware if the user is authenticated, otherwise redirects to the login page.
 */
const requireAuth = (req, res, next) => {
    if (!req.session || !req.session.user) {
        req.session.errorMessage = "You must log in to access this page.";
        return res.redirect('/login'); // Redirect to login with a message
    }
    next(); // Continue to the requested route
};

module.exports = requireAuth;
