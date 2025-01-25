/**
 * Middleware to protect admin routes by ensuring the user is authenticated as an admin.
 * Purpose: To restrict access to certain routes to only authenticated users.
 * Inputs: None
 * Outputs: Calls the next middleware if the user is authenticated, otherwise redirects to the login page.
 */
const ensureAdmin = (req, res, next) => {
    if (req.session.isAdmin) {
        next();
    } else {
        res.redirect('/login');
    }
};

module.exports = ensureAdmin;
