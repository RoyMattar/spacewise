/**
 * Middleware to ensure the user is an admin and belongs to the correct institution.
 * Purpose: To restrict access to institution-specific routes only to the corresponding admin.
 * Inputs: Expects `req.params.id` (institution ID) and `req.session.user` (admin session info).
 * Outputs: Calls the next middleware if the user is the correct admin, otherwise returns a 403 error.
 */
const ensureCorrectAdmin = (req, res, next) => {
    const institutionId = req.params.id;

    // Check if the user is logged in and has an admin role
    if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
        req.session.errorMessage = "You must be an admin to access this page.";
        return res.status(403).redirect('/login'); // Redirect unauthorized users to login
    }

    // Verify if the admin belongs to the requested institution
    if (req.session.user.institutionId != institutionId) {
        return res.status(403).json({ error: `Access denied. This institution does not belong to your account (accessed=${institutionId}, yours=${req.session.user.institution_id}).` });
    }

    next(); // User is authorized, continue to the requested route
};

module.exports = ensureCorrectAdmin;
