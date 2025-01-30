const express = require('express');
const router = express.Router();
const ensureAdmin = require('../middleware/ensure_admin');

// ------ Reservation Management Routes ------

// Route to get all reservations
router.get('/', function (req, res, next) {
    if (req.session.isAdmin) {
        res.render('reservationManagement');
    } else {
        res.render('reservationSelection');
    }
});

//Route to create a reservation for a seat
router.post('/', function (req, res, next) {
    const { seat_id, user_id, start_time, end_time } = req.body;
    global.db.run(
        'INSERT INTO reservations (seat_id, user_id, start_time, end_time, status) VALUES (?, ?, ?, ?, ?)',
        [seat_id, user_id, start_time, end_time, 'active'],
        function (err) {
            if (err) return next(err);
            res.json({ reservation_id: this.lastID, message: 'Reservation created successfully.' });
        }
    );
});

//Route to retrieve all reservations for a specific user
router.get('/:user_id', function (req, res, next) {
    const { user_id } = req.params;
    global.db.all(
        `SELECT reservation_id, seat_id, start_time, end_time, status 
         FROM reservations 
         WHERE user_id = ?`,
        [user_id],
        function (err, rows) {
            if (err) return next(err);
            res.json(rows);
        }
    );
});

//Route to update a reservation
router.patch('/:id', function (req, res, next) {
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
router.delete('/:id', function (req, res, next) {
    const { id } = req.params;
    global.db.run(
        'UPDATE reservations SET status = "cancelled" WHERE reservation_id = ?',
        [id],
        function (err) {
            if (err) return next(err);
            res.json({ message: 'Reservation canceled successfully.' });
        }
    );
});

module.exports = router;
