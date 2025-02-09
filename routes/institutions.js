const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const requireAuth = require('../middleware/require_auth');
const ensureCorrectAdmin = require('../middleware/ensure_correct_admin');

// Configure storage location for uploaded files
const publicPath = path.join(__dirname, "..", "public");
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, path.join(publicPath, "space_layouts")), // Save files in `public/space_layouts/`
        filename: (req, file, cb) => cb(null, `layout_institution_${req.params.id}_space_${req.params.spaceId}_${Date.now()}${path.extname(file.originalname)}`) // Rename file to `layout_space_<spaceId>_<date>.png`
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

                        const institution_id = this.lastID;
                        console.log(`Created institution in database: id=${institution_id}, name=${institution_name}.`);

                        // Attach the institution_id to the admin user
                        db.run(
                            'UPDATE users SET institution_id = ? WHERE user_id = ?',
                            [institution_id, admin_id],
                            function (err) {
                                if (err) {
                                    console.error('Database error:', err);
                                    return res.status(500).json({ error: 'Failed to link institution to admin user' });
                                }

                                console.log(`Linked institution_id=${institution_id} to admin user_id=${admin_id}.`);

                                // Respond with the new institution ID
                                res.json({
                                    institution_id: institution_id,
                                    message: 'Institution registered successfully.',
                                });
                            }
                        );
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
    router.get('/:id', requireAuth, ensureCorrectAdmin, function (req, res, next) {
        const institutionId = req.params.id;
        db.get(
            `SELECT institution_id, institution_name, bio, address, opening_hours FROM institutions
            WHERE institution_id = ?;`,
            [institutionId],
            function (err, row) {
                if (err) return next(err);
                if (!row) return res.status(404).json({ message: 'Institution not found.' });
                if (req.session.user.role === 'admin') {
                    res.render('institutionManagement', { institutionId, institution: row });
                }
            }
        );
    });


    //Route to update an institution's details
    router.patch('/:id', requireAuth, ensureCorrectAdmin, function (req, res, next) {
        const { institution_name, bio, address, opening_hours } = req.body;
        const institutionId = req.params.id;
        db.run(
            `UPDATE institutions SET
            institution_name = COALESCE(?, institution_name),
            bio = COALESCE(?, bio),
            address = COALESCE(?, address),
            opening_hours = COALESCE(?, opening_hours)
            WHERE institution_id = ?`,
            [institution_name, bio, address, opening_hours, institutionId],
            function (err) {
                if (err) return next(err);
                res.json({ message: 'Institution details updated successfully.' });
            }
        );
    });


    //Route to delete an institution
    router.delete('/:id', requireAuth, ensureCorrectAdmin, function (req, res, next) {
        const institutionId = req.params.id;
        db.run(
            'DELETE FROM institutions WHERE institution_id = ?',
            [institutionId],
            function (err) {
                if (err) return next(err);
                db.run(
                    'DELETE FROM users where institution_id = ?',
                    [institutionId],
                    function (err) {
                        if (err) return next(err);
                        return res.json({ success: true, redirect: '/logout' });
                    }
                )
            }
        );
    });


    // ------ Space Management Routes ------

    //Route to create a space for a specific institution
    router.post('/:id/spaces', requireAuth, ensureCorrectAdmin, function (req, res, next) {
        const { name, layoutImage } = req.body;
        const institutionId = req.params.id;
        db.run(
            'INSERT INTO spaces (space_name, layout_image, institution_id) VALUES (?, ?, ?)',
            [name, layoutImage, institutionId],
            function (err) {
                if (err) return next(err);
                const spaceId = this.lastID;
                console.log(`Space ${spaceId} - "${name}" created successfully in institution ${institutionId}.`);
                res.redirect(`/institutions/${institutionId}/spaces/${spaceId}`); // Redirect to the new space's edit page
            }
        );
    });


    // Route to retrieve all spaces for a specific institution
    router.get('/:id/spaces', requireAuth, ensureCorrectAdmin, function (req, res, next) {
        const institutionId = req.params.id;
        db.all(
            'SELECT * FROM spaces WHERE institution_id = ?',
            [institutionId],
            function (err, rows) {
                if (err) return next(err);
                if (req.session.user.role === 'admin') {
                    res.render('spaceManagement', { institutionId, spaces: rows});
                } else {
                    res.render('spaceSelection', { spaces: rows });
                }
            }
        );
    });

    // Route to retrieve a specific space for a specific institution
    router.get('/:id/spaces/:spaceId', requireAuth, ensureCorrectAdmin, function (req, res, next) {
        const { id: institutionId, spaceId } = req.params;
        db.get(
            'SELECT * FROM spaces WHERE institution_id = ? AND space_id = ?;',
            [institutionId, spaceId],
            function (err, space) {
                if (err) return next(err);
                if (!space) return res.status(404).json({ error: "Space not found" });

                if (space.layout_image) {
                    // Check if the image file exists and remove broken image reference if it does not
                    const imagePath = path.join(publicPath, space.layout_image);
                    if (!fs.existsSync(imagePath)) {
                        console.warn(`Missing image file: ${imagePath}`);
                        space.layout_image = null;

                        db.run(
                            `UPDATE spaces SET layout_image = NULL WHERE institution_id = ? AND space_id = ?`,
                            [institutionId, spaceId],
                            (updateErr) => {
                                if (updateErr) console.error("Failed to update DB: ", updateErr);
                            }
                        );
                    }
                }

                // Fetch seats of the space
                db.all('SELECT * FROM seats WHERE space_id = ?', [spaceId], (seatErr, seats) => {
                    if (seatErr) return next(seatErr);

                    if (req.session.user.role === 'admin') {
                        res.render('seatManagement', { institutionId, space, seats });
                    } else {
                        res.render('seatSelection', { space, seats });
                    }
                });
            }
        );
    });


    //Route to update details of a specific space
    router.patch('/:id/spaces/:spaceId', requireAuth, ensureCorrectAdmin, upload.single('layoutImage'), function (req, res, next) {
        const { spaceName } = req.body || null;
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
                    [spaceName, newLayoutImage, institutionId, spaceId],
                    function (updateErr) {
                        if (updateErr) return next(updateErr);

                        // Delete the old image if the new one was successfully updated in DB
                        if (oldImagePath && newLayoutImage) {
                            const oldFilePath = path.join(publicPath, oldImagePath);
                            if (fs.existsSync(oldFilePath)) {
                                fs.unlink(oldFilePath, (unlinkErr) => {
                                    if (unlinkErr) console.error("Error deleting old image:", unlinkErr);
                                    else console.log(`Deleted old image: ${oldFilePath}`);
                                });
                            }
                        }

                        const finalSpaceName = spaceName || row.space_name;
                        const finalLayoutImage = newLayoutImage || oldImagePath;
                        const message = `Space ${spaceId} details updated successfully: space_name=${finalSpaceName}, layout_image=${finalLayoutImage}.`;
                        console.log(message);
                        res.json({ message: message, imagePath: finalLayoutImage });
                    }
                );
            }
        );
    });

    //Route to delete a space
    router.delete('/:id/spaces/:spaceId', requireAuth, ensureCorrectAdmin, function (req, res, next) {
        const { id: institutionId, spaceId } = req.params;
        db.get(
            'SELECT layout_image FROM spaces WHERE institution_id = ? AND space_id = ?;',
            [institutionId, spaceId],
            function (err, row) {
                if (err) return next(err);
                if (!row) return res.status(404).json({ error: "Space not found" });
    
                // Delete the file from disk if it exists
                if (row.layout_image) {
                    const filePath = path.join(publicPath, row.layout_image);
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
                        const message = `Space ${spaceId} deleted successfully.`;
                        console.log(message);
                        res.json({ message: message });
                    }
                );
            }
        );
    });

    // ------ Seat Management Routes ------

    // Route to get all seats within a space
    router.get('/:id/spaces/:spaceId/seats', requireAuth, ensureCorrectAdmin, function (req, res, next) {
        const { id: institutionId, spaceId } = req.params;
        db.all(
            'SELECT seat_id, space_id, seat_name, type, facilities, status FROM seats WHERE space_id = ?',
            [spaceId],
            function (err, rows) {
                if (err) return next(err);
                if (req.session.user.role === 'admin') {
                    res.render('seatManagement', { institutionId, seats: rows });
                } else {
                    res.render('seatSelection', { seats: rows });
                }
            }
        );
    });

    // Route to get all available seats within a space
    router.get('/:id/spaces/:spaceId/available-seats', requireAuth, (req, res) => {
        const { spaceId } = req.params;
        const { start_time, end_time } = req.query;
    
        const query = `
            SELECT s.seat_id, s.seat_name, s.type, s.facilities
            FROM seats s
            WHERE s.space_id = ?
            AND s.status = 'available'
            AND s.seat_id NOT IN (
                SELECT seat_id
                FROM reservations
                WHERE status = 'active'
                AND (
                    (start_time <= ? AND end_time >= ?)
                    OR (start_time <= ? AND end_time >= ?)
                    OR (start_time <= ? AND end_time >= ?)
                    OR (start_time >= ? AND end_time <= ?)
                )
            )
        `;
    
        db.all(query, [
            spaceId,
            start_time, start_time, // Overlap at start
            end_time, end_time, // Overlap at end
            start_time, end_time, // Contains
            start_time, end_time // Is contained within
        ], (err, availableSeats) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(availableSeats);
        });
    });

    //Route to add a seat to a space with an institution
    router.post('/:id/spaces/:spaceId/seats', requireAuth, ensureCorrectAdmin, function (req, res, next) {
        const { seat_name, type, facilities, status } = req.body;
        const spaceId = req.params.spaceId;

        if (!seat_name || !type || !status) {
            return res.status(400).json({ error: 'Missing required seat fields.' });
        }

        db.run(
            'INSERT INTO seats (space_id, seat_name, type, facilities, status) VALUES (?, ?, ?, ?, ?)',
            [spaceId, seat_name, type, facilities, status],
            function (err) {
                if (err) return next(err);
                const seatId = this.lastID;
                const message = `Seat ${seatId} added successfully to space ${spaceId}.`;
                console.log(message);
                res.json({ seat_id: seatId, message: message });
            }
        );
    });

    //Route to update details of a specific seat
    router.patch('/:id/spaces/:spaceId/seats/:seatId', requireAuth, ensureCorrectAdmin, function (req, res, next) {
        const { seat_name, type, facilities, status } = req.body;
        const { spaceId, seatId } = req.params;

        if (!seatId) {
            return res.status(400).json({ error: 'Seat ID is required.' });
        }

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
                res.json({ message:`Seat ${seatId} details updated successfully (space ${spaceId}).` });
            }
        );
    });

    //Route to remove a seat
    router.delete('/:id/spaces/:spaceId/seats/:seatId', requireAuth, ensureCorrectAdmin, function (req, res, next) {
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

    // Route to clear all seats within a space
    router.delete('/:id/spaces/:spaceId/seats', requireAuth, ensureCorrectAdmin, function (req, res, next) {
        const { spaceId } = req.params;
        db.get('SELECT COUNT(*) as count FROM seats WHERE space_id = ?', [spaceId], (err, result) => {
            if (err) return next(err);
            if (result.count === 0) {
                const message = 'No seats found to delete.';
                console.warn(message);
                return res.status(404).json({ error: message });
            }
    
            db.run('DELETE FROM seats WHERE space_id = ?', [spaceId], function (err) {
                if (err) return next(err);
                const message = `${result.count} seats cleared successfully from space ${spaceId}.`;
                console.log(message);
                res.json({ message: message });
            });
        });
    });

    return router;
};

module.exports = institutionsRouter;
