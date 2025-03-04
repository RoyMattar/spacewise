const request = require('supertest');
const { setupTestDB, closeTestDB } = require('./test_db');
const createTestApp = require('./test_setup');
const reservationsRouter = require('../routes/reservations');

let agent;

beforeAll(async () => {
    const db = await setupTestDB(); // Initialize test database
    if (!db) {
        throw new Error("Test database (db) is not initialized.");
    }

    // Seed the database with test data:
    await new Promise((resolve, reject) => {
        db.serialize(() => {
            // Insert a student user (this will get id = 1)
            db.run("INSERT INTO users (username, password_hash, role) VALUES ('teststudent', 'hash', 'student')", function(err) {
                if (err) return reject(err);
            });
            // Insert an admin user (this will get id = 2)
            db.run("INSERT INTO users (username, password_hash, role) VALUES ('adminuser', 'hash', 'admin')", function(err) {
                if (err) return reject(err);
            });
            // Insert an institution with a valid admin_id (2)
            db.run("INSERT INTO institutions (institution_name, admin_id) VALUES ('Test Institution', 2)", function(err) {
                if (err) return reject(err);
            });
            // Insert a space (using institution_id = 1, since the first institution inserted will have institution_id = 1)
            db.run("INSERT INTO spaces (institution_id, space_name) VALUES (1, 'Test Space')", function(err) {
                if (err) return reject(err);
            });
            // Insert a seat in that space with seat_name 'A1'
            db.run("INSERT INTO seats (space_id, seat_name, type, facilities, status) VALUES (1, 'A1', 'Chair', '{}', 'available')", function(err) {
                if (err) return reject(err);
            });
            // Insert a reservation for teststudent on seat A1
            const now = new Date().toISOString();
            const future = new Date(Date.now() + 3600000).toISOString();
            db.run("INSERT INTO reservations (user_id, seat_id, start_time, end_time, status) VALUES (1, 1, ?, ?, 'active')", [now, future], function(err) {
                if (err) return reject(err);
                resolve();
            });
        });
    });

    const app = createTestApp();

    // Override session to simulate a logged-in student
    app.use((req, res, next) => {
        req.session.user = { id: 1, role: 'student', username: 'teststudent' };
        next();
    });

    app.use('/reservations', reservationsRouter(db));

    agent = request.agent(app);
});

afterAll(async () => {
    await closeTestDB();
});

describe('Reservations Routes', () => {
    test('GET / returns reservations for a student', async () => {
        const res = await agent.get('/reservations');
        expect(res.statusCode).toBe(200);
        // Further assertions can check that the rendered HTML contains seat A1
        expect(res.text).toContain('A1');
    });

    test('POST / creates a new reservation', async () => {
        const now = new Date().toISOString();
        const future = new Date(Date.now() + 7200000).toISOString();
        const res = await agent.post('/reservations').send({
            seat_id: 1,
            start_time: now,
            end_time: future
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.reservation_id).toBeDefined();
    });

    test('PATCH /:id updates a reservation', async () => {
        // Update the reservation with id=1 (from beforeAll) to cancel it
        const res = await agent.patch('/reservations/1').send({ status: 'cancelled' });
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toContain('Reservation updated successfully');
    });

    test('DELETE /:id cancels a reservation', async () => {
        const res = await agent.delete(`/reservations/2`);
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toContain('Reservation cancelled successfully');
    });
});
