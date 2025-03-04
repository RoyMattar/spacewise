const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/require_auth');

// ------ Reservations Routes ------
function reservationsRouter(db) {
    // Route to get all reservations
    router.get('/', requireAuth, function (req, res, next) {
        if (req.session.user.role === 'admin') {
            const institutionId = req.session.user.institutionId;
            db.all(
                `
                SELECT
                    r.reservation_id,
                    r.user_id,
                    u.username,
                    r.seat_id,
                    s.seat_name,
                    r.start_time,
                    r.end_time,
                    r.status
                FROM reservations r
                JOIN seats s ON r.seat_id = s.seat_id
                JOIN spaces sp ON s.space_id = sp.space_id
                JOIN institutions i ON sp.institution_id = i.institution_id
                JOIN users u ON r.user_id = u.user_id
                WHERE i.institution_id = ?
                `,
                [institutionId],
                function (err, rows) {
                    if (err) return next(err);
                    res.render('reservationManagement', { institutionId, reservations: rows });
                }
            );
        } else {
            db.all(
                `
                SELECT
                    r.reservation_id,
                    i.institution_name, sp.space_name, s.seat_name, s.type, s.facilities,
                    DATE(r.start_time) as date,
                    TIME(r.start_time) as start_time,
                    TIME(r.end_time) as end_time,
                    r.end_time as end_time_date,
                    r.status
                FROM reservations r
                JOIN seats s ON r.seat_id = s.seat_id
                JOIN spaces sp ON s.space_id = sp.space_id
                JOIN institutions i ON sp.institution_id = i.institution_id
                WHERE r.user_id = ?
                ORDER BY r.start_time DESC
                `,
                [req.session.user.id],
                function (err, rows) {
                    if (err) return next(err);

                    const now = new Date();
                    const activeReservations = [];
                    const pastReservations = [];

                    // Sort reservations into active and past
                    rows.forEach(res => {
                        const endTime = new Date(res.end_time_date);
                        if (res.status === 'active' && endTime > now) { // TODO: change to 'booked'
                            activeReservations.push(res);
                        } else {
                            pastReservations.push(res);
                        }
                    })

                    res.render('reservationSelection', { activeReservations, pastReservations });
                }
            );
        }
    });

    //Route to create a reservation for a seat
    router.post('/', requireAuth, function (req, res, next) {
        const { seat_id, start_time, end_time } = req.body;
        const user_id = req.session.user.id;

        db.run(
            'INSERT INTO reservations (seat_id, user_id, start_time, end_time, status) VALUES (?, ?, ?, ?, ?)',
            [seat_id, user_id, start_time, end_time, 'active'],
            function (err) {
                if (err) return next(err);
                res.json({ reservation_id: this.lastID, message: 'Reservation created successfully.' });
            }
        );
    });

    //Route to retrieve all reservations for a specific user
    router.get('/:user_id', requireAuth, function (req, res, next) {
        const { user_id } = req.params;
        db.all(
            `SELECT reservation_id, seat_id, start_time, end_time, status 
            FROM reservations 
            WHERE user_id = ?`,
            [user_id],
            function (err, rows) {
                if (err) return next(err);
                res.render('reservationSelection', { reservations: rows });
            }
        );
    });

    //Route to update a reservation
    router.patch('/:id', requireAuth, function (req, res, next) {
        const { start_time, end_time, status } = req.body;
        const { id } = req.params;
        db.run(
            'UPDATE reservations SET start_time = COALESCE(?, start_time), end_time = COALESCE(?, end_time), status = COALESCE(?, status) WHERE reservation_id = ?',
            [start_time, end_time, status, id],
            function (err) {
                if (err) return next(err);
                res.json({ message: 'Reservation updated successfully.' });
            }
        );
    });

    //Route to cancel a reservation
    router.delete('/:id', requireAuth, function (req, res, next) {
        const { id } = req.params;
        db.run(
            'UPDATE reservations SET status = "cancelled" WHERE reservation_id = ?',
            [id],
            function (err) {
                if (err) return next(err);
                res.json({ message: 'Reservation cancelled successfully.' });
            }
        );
    });

    return router;
};

module.exports = reservationsRouter;
