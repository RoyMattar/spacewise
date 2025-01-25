const express = require('express');
const router = express.Router();
const ensureAdmin = require('../middleware/ensure_admin');

// ------ Reservation Management Routes ------
//Route to create a reservation for a seat
router.post('/reservations', function (req, res, next) {
    const { seat_id, user_id, start_time, end_time } = req.body;
    global.db.run(
        'INSERT INTO reservations (seat_id, user_id, start_time, end_time, status) VALUES (?, ?, ?, ?, ?)',
        [seat_id, user_id, start_time, end_time, 'Active'],
        function (err) {
            if (err) return next(err);
            res.json({ reservation_id: this.lastID, message: 'Reservation created successfully.' });
        }
    );
});

//Route to retrieve all reservations for a specific user
router.get('/reservations/:user_id', function (req, res, next) {
    const { user_id } = req.params;
    global.db.all(
        `SELECT r.reservation_id, r.seat_id, s.name AS seat_name, r.start_time, r.end_time, r.status 
         FROM reservations r 
         JOIN seats s ON r.seat_id = s.seat_id 
         WHERE r.user_id = ?`,
        [user_id],
        function (err, rows) {
            if (err) return next(err);
            res.json(rows);
        }
    );
});

//Route to update a reservation
router.patch('/reservations/:id', function (req, res, next) {
    const { start_time, end_time, status } = req.body;
    const { id } = req.params;
    global.db.run(
        'UPDATE reservations SET start_time = COALESCE(?, start_time), end_time = COALESCE(?, end_time), status = COALESCE(?, status) WHERE reservation_id = ?',
        [start_time, end_time, status, id],
        function (err) {
            if (err) return next(err);
            res.json({ message: 'Reservation updated successfully.' });
        }
    );
});

//Route to cancel a reservation
router.delete('/reservations/:id', ensureAdmin, function (req, res, next) {
    const { id } = req.params;
    global.db.run(
        'UPDATE reservations SET status = "Cancelled" WHERE reservation_id = ?',
        [id],
        function (err) {
            if (err) return next(err);
            res.json({ message: 'Reservation canceled successfully.' });
        }
    );
});

module.exports = router;
