const express = require('express');
const router = express.Router();
const ensureAdmin = require('../middleware/ensure_admin');


// ------ Institutions Routes ------

//Route to create a new institution
router.post('/register', ensureAdmin, function (req, res, next) {
    const { institution_name, bio, address, opening_hours, admin_id } = req.body;
    global.db.run(
        'INSERT INTO institutions (name, bio, address, opening_hours) VALUES (?, ?, ?, ?)',
        [institution_name, bio, address, opening_hours],
        function (err) {
            if (err) return next(err);
            const institutionId = this.lastID;
            global.db.run(
                'INSERT INTO institution_admins (institution_id, admin_id) VALUES (?, ?)',
                [institutionId, admin_id],
                function (adminErr) {
                    if (adminErr) return next(adminErr);
                    res.json({ institution_id: institutionId, message: 'Institution registered successfully.' });
                }
            );
        }
    );
});


//Route to retrieve all spaces for a specific institution
router.get('', function (req, res, next) {
  global.db.all(
      'SELECT institution_id, name, bio, address, opening_hours FROM institutions',
      [],
      function (err, rows) {
          if (err) return next(err);
          res.json(rows);
      }
  );
});


//Route to retrieve details of a specific institution
router.get('/:id', function (req, res, next) {
    const institutionId = req.params.id;
    global.db.get(
        `SELECT i.institution_id, i.name, i.bio, i.address, i.opening_hours, u.username AS admin_username
         FROM institutions i
         JOIN institution_admins ia ON i.institution_id = ia.institution_id
         JOIN users u ON ia.admin_id = u.user_id
         WHERE i.institution_id = ?`,
        [institutionId],
        function (err, row) {
            if (err) return next(err);
            if (!row) return res.status(404).json({ message: 'Institution not found.' });
            res.json(row);
        }
    );
});


//Route to update an institution's details
router.patch('/:id', ensureAdmin, function (req, res, next) {
    const { bio, address, opening_hours } = req.body;
    const institutionId = req.params.id;
    global.db.run(
        'UPDATE institutions SET bio = COALESCE(?, bio), address = COALESCE(?, address), opening_hours = COALESCE(?, opening_hours) WHERE institution_id = ?',
        [bio, address, opening_hours, institutionId],
        function (err) {
            if (err) return next(err);
            res.json({ message: 'Institution details updated successfully.' });
        }
    );
});


//Route to delete an institution
router.delete('/:id', ensureAdmin, function (req, res, next) {
    const institutionId = req.params.id;
    global.db.run(
        'DELETE FROM institutions WHERE institution_id = ?',
        [institutionId],
        function (err) {
            if (err) return next(err);
            res.json({ message: 'Institution deleted successfully.' });
        }
    );
});


// ------ Space Management Routes ------

//Route to create a space for a specific institution
router.post('/:id/spaces', ensureAdmin, function (req, res, next) {
    const { name, layoutImage } = req.body;
    const institutionId = req.params.id;
    global.db.run(
        'INSERT INTO spaces (name, layout, institution_id) VALUES (?, ?, ?)',
        [name, layoutImage, institutionId],
        function (err) {
            if (err) return next(err);
            res.json({ space_id: this.lastID, message: 'Space created successfully.' });
        }
    );
});


// Route to retrieve all spaces for a specific institution
router.get('/:id/spaces', function (req, res, next) {
    const institutionId = req.params.id;
    global.db.all('SELECT space_id, name, layout FROM spaces WHERE institution_id = ?', [institutionId], function (err, rows) {
        if (err) return next(err);
        res.json(rows);
    });
});

// Route to retrieve all spaces for a specific institution
router.get('/:id/spaces/:spaceId', function (req, res, next) {
    const institutionId = req.params.id;
    global.db.all('SELECT space_id, name, layout FROM spaces WHERE institution_id = ? AND space_id = ?;', [institutionId, spaceId], function (err, rows) {
        if (err) return next(err);
        res.json(rows);
    });
});


//Route to update details of a specific space
router.patch('/:id/spaces/:spaceId', ensureAdmin, function (req, res, next) {
    const { name, layoutImage } = req.body;
    const { id: institutionId, spaceId } = req.params;
    global.db.run(
        'UPDATE spaces SET name = COALESCE(?, name), layout = COALESCE(?, layout) WHERE institution_id = ? AND space_id = ?',
        [name, layoutImage, institutionId, spaceId],
        function (err) {
            if (err) return next(err);
            res.json({ message: 'Space details updated successfully.' });
        }
    );
});

//Route to delete a space
router.delete('/:id/spaces/:spaceId', ensureAdmin, function (req, res, next) {
    const { id: institutionId, spaceId } = req.params;
    global.db.run(
        'DELETE FROM spaces WHERE institution_id = ? AND space_id = ?',
        [institutionId, spaceId],
        function (err) {
            if (err) return next(err);
            res.json({ message: 'Space deleted successfully.' });
        }
    );
});

module.exports = router;
