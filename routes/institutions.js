const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const requireAuth = require('../middleware/require_auth');

// Configure storage location for uploaded files
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, path.join(__dirname, "public", "space_layouts")), // Save files in `public/space_layouts/`
        filename: (req, file, cb) => cb(null, `layout_${Date.now()}_${path.extname(file.originalname)}`) // Rename file
    })
});

function institutionsRouter(db) {
    // ------ Institutions Routes ------
    // Route to create a new institution
    router.post('/register', requireAuth, function (req, res, next) {
        const { institution_name, bio, address, opening_hours, admin_id } = req.body;
        // Validate the input (e.g., check if admin_id exists and belongs to an admin role)
        db.get(
            'SELECT role FROM users WHERE user_id = ?',
            [admin_id],
            function (err, row) {
                if (err) return next(err);
                // Check if the user exists and is an admin
                if (!row || row.role !== 'admin') {
                    return res.status(400).json({ message: 'admin_id must belong to a user with role=admin.' });
                }
                // Insert the new institution
                db.run(
                    'INSERT INTO institutions (institution_name, bio, address, opening_hours, admin_id) VALUES (?, ?, ?, ?, ?)',
                    [institution_name, bio, address, opening_hours, admin_id],
                    function (err) {
                        if (err) return next(err);
                        // Respond with the new institution ID
                        res.json({
                            institution_id: this.lastID,
                            message: 'Institution registered successfully.',
                        });
                    }
                );
            }
        );
    });

    //Route to retrieve details of all institutions
    router.get('', requireAuth, function (req, res, next) {
        db.all(
            'SELECT institution_id, institution_name, bio, address, opening_hours FROM institutions',
            [],
            function (err, rows) {
                if (err) return next(err);
                res.render('institutionSelection', { institutions: rows });
            }
        );
    });

    //Route to retrieve details of a specific institution
    router.get('/:id', requireAuth, function (req, res, next) {
        const institutionId = req.params.id;
        db.get(
            `SELECT institution_id, institution_name, bio, address, opening_hours FROM institutions
            WHERE institution_id = ?;`,
            [institutionId],
            function (err, row) {
                if (err) return next(err);
                if (!row) return res.status(404).json({ message: 'Institution not found.' });
                if (req.session.user.role === 'admin') {
                    res.render('institutionManagement', { institution: row });
                }
            }
        );
    });


    //Route to update an institution's details
    router.patch('/:id', requireAuth, function (req, res, next) {
        const { bio, address, opening_hours } = req.body;
        const institutionId = req.params.id;
        db.run(
            `UPDATE institutions SET
            bio = COALESCE(?, bio),
            address = COALESCE(?, address),
            opening_hours = COALESCE(?, opening_hours)
            WHERE institution_id = ?`,
            [bio, address, opening_hours, institutionId],
            function (err) {
                if (err) return next(err);
                res.json({ message: 'Institution details updated successfully.' });
            }
        );
    });


    //Route to delete an institution
    router.delete('/:id', requireAuth, function (req, res, next) {
        const institutionId = req.params.id;
        db.run(
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
    router.post('/:id/spaces', requireAuth, function (req, res, next) {
        const { name, layoutImage } = req.body;
        const institutionId = req.params.id;
        db.run(
            'INSERT INTO spaces (space_name, layout_image, institution_id) VALUES (?, ?, ?)',
            [name, layoutImage, institutionId],
            function (err) {
                if (err) return next(err);
                res.json({ space_id: this.lastID, message: 'Space created successfully.' });
            }
        );
    });


    // Route to retrieve all spaces for a specific institution
    router.get('/:id/spaces', requireAuth, function (req, res, next) {
        const institutionId = req.params.id;
        db.all(
            'SELECT space_id, space_name, layout_image FROM spaces WHERE institution_id = ?',
            [institutionId],
            function (err, rows) {
                if (err) return next(err);
                if (req.session.user.role === 'admin') {
                    res.render('spaceManagement', { spaces: rows });
                } else {
                    res.render('spaceSelection', { spaces: rows });
                }
            }
        );
    });

    // Route to retrieve a specific space for a specific institution
    router.get('/:id/spaces/:spaceId', requireAuth, function (req, res, next) {
        const { id: institutionId, spaceId } = req.params;
        db.get(
            'SELECT space_id, space_name, layout_image FROM spaces WHERE institution_id = ? AND space_id = ?;',
            [institutionId, spaceId],
            function (err, row) {
                if (err) return next(err);
                if (!row) return res.status(404).json({ error: "Space not found" });

                // Check if the image file exists
                const imagePath = row.layout_image ? path.join(__dirname, 'public', row.layout_image) : null;
                if (!imagePath || !fs.existsSync(imagePath)) {
                    console.warn(`Missing image file: ${imagePath}`);

                    row.layout_image = null; // Remove broken image reference from result row

                    // Update DB to remove broken image reference
                    db.run(
                        `UPDATE spaces SET layout_image = NULL WHERE institution_id = ? AND space_id = ?`,
                        [institutionId, spaceId],
                        (updateErr) => {
                            if (updateErr) console.error("Failed to update DB:", updateErr);
                        }
                    );
                }

                if (req.session.user.role === 'admin') {
                    res.render('seatManagement', { space: row });
                } else {
                    res.render('seatSelection', { space: row });
                }
            }
        );
    });


    //Route to update details of a specific space
    router.patch('/:id/spaces/:spaceId', requireAuth, upload.single('layoutImage'), function (req, res, next) {
        const { name } = req.body;
        const { id: institutionId, spaceId } = req.params;
        // Store the layout_image path in DB as a relative path to have it as a web-accessible path (and a path compatible to any OS)
        const newLayoutImage = req.file ? `/space_layouts/${req.file.filename}` : null;

        // Get the current image path before updating
        db.get(
            'SELECT layout_image FROM spaces WHERE institution_id = ? AND space_id = ?',
            [institutionId, spaceId],
            function (err, row) {
                if (err) return next(err);

                const oldImagePath = row ? row.layout_image : null;

                // Update the database with the new image path
                db.run(
                    `UPDATE spaces SET
                    space_name = COALESCE(?, space_name),
                    layout_image = COALESCE(?, layout_image)
                    WHERE institution_id = ? AND space_id = ?`,
                    [name, newLayoutImage, institutionId, spaceId],
                    function (updateErr) {
                        if (updateErr) return next(updateErr);

                        // Delete the old image if a new one was uploaded
                        if (oldImagePath && newLayoutImage) {
                            const oldFilePath = path.join(__dirname, 'public', oldImagePath);
                            if (fs.existsSync(oldFilePath)) {
                                fs.unlink(oldFilePath, (unlinkErr) => {
                                    if (unlinkErr) console.error("Error deleting old image:", unlinkErr);
                                    else console.log(`Deleted old image: ${oldFilePath}`);
                                });
                            }
                        }

                        res.json({ message: 'Space details updated successfully.', imagePath: newLayoutImage });
                    }
                );
            }
        );
    });

    //Route to delete a space
    router.delete('/:id/spaces/:spaceId', requireAuth, function (req, res, next) {
        const { id: institutionId, spaceId } = req.params;
        db.get(
            'SELECT layout_image FROM spaces WHERE institution_id = ? AND space_id = ?;',
            [institutionId, spaceId],
            function (err, row) {
                if (err) return next(err);
                if (!row) return res.status(404).json({ error: "Space not found" });
    
                // Delete the file from disk if it exists
                if (row.layout_image) {
                    const filePath = path.join(__dirname, 'public', row.layout_image);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath); // Delete the file
                        console.log(`Deleted file: ${filePath}`);
                    }
                }

                // Delete the entry from the database
                db.run(
                    'DELETE FROM spaces WHERE institution_id = ? AND space_id = ?',
                    [institutionId, spaceId],
                    function (err) {
                        if (err) return next(err);
                        res.json({ message: 'Space deleted successfully.' });
                    }
                );
            }
        );
    });

    // ------ Seat Management Routes ------

    // Route to get all seats within a space
    router.get('/:id/spaces/:spaceId/seats', requireAuth, function (req, res, next) {
        const spaceId = req.params.spaceId;
        db.all(
            'SELECT seat_id, space_id, seat_name, type, facilities, status FROM seats WHERE space_id = ?',
            [spaceId],
            function (err, rows) {
                if (err) return next(err);
                if (req.session.user.role === 'admin') {
                    res.render('seatManagement', { seats: rows });
                } else {
                    res.render('seatSelection', { seats: rows });
                }
            }
        );
    });

    //Route to add a seat to a space with an institution
    router.post('/:id/spaces/:spaceId/seats', requireAuth, function (req, res, next) {
        const { seat_name, type, facilities, status } = req.body;
        const spaceId = req.params.spaceId;
        db.run(
            'INSERT INTO seats (space_id, seat_name, type, facilities, status) VALUES (?, ?, ?, ?, ?)',
            [spaceId, seat_name, type, facilities, status],
            function (err) {
                if (err) return next(err);
                res.json({ space_id: this.lastID, message: 'Seat added successfully.' });
            }
        );
    });

    //Route to update details of a specific seat
    router.patch('/:id/spaces/:spaceId/seats/:seatId', requireAuth, function (req, res, next) {
        const { seat_name, type, facilities, status } = req.body;
        const { spaceId, seatId } = req.params;
        db.run(
            `UPDATE seats SET
            seat_name = COALESCE(?, seat_name),
            type = COALESCE(?, type),
            facilities = COALESCE(?, facilities),
            status = COALESCE(?, status)
            WHERE seat_id = ? AND space_id = ?`,
            [seat_name, type, facilities, status, seatId, spaceId],
            function (err) {
                if (err) return next(err);
                res.json({ message: 'Seat details updated successfully.' });
            }
        );
    });

    //Route to remove a seat
    router.delete('/:id/spaces/:spaceId/seats/:seatId', requireAuth, function (req, res, next) {
        const { spaceId, seatId } = req.params;
        db.run(
            'DELETE FROM seats WHERE seat_id = ? AND space_id = ?',
            [seatId, spaceId],
            function (err) {
                if (err) return next(err);
                res.json({ message: 'Seat deleted successfully.' });
            }
        );
    });

    return router;
};

module.exports = institutionsRouter;
