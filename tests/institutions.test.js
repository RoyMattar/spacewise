const request = require('supertest');
const { setupTestDB, closeTestDB } = require('./test_db');
const createTestApp = require('./test_setup');
const institutionsRouter = require('../routes/institutions');

let agent; // Persistent session for auth tests

beforeAll(async () => {
    const db = await setupTestDB(); // Initialize test database
    if (!db) {
        throw new Error("Test database (db) is not initialized.");
    }

    // Insert an admin user and an institution for testing
    await new Promise((resolve, reject) => {
        db.serialize(() => {
            // Insert an admin user
            db.run("INSERT INTO users (username, password_hash, role) VALUES ('adminuser', 'hash', 'admin')", function (err) {
                if (err) return reject(err);
            });
            // Insert an institution for that admin (admin_id = 1)
            db.run("INSERT INTO institutions (institution_name, admin_id) VALUES ('Test Institution', 1)", function (err) {
                if (err) return reject(err);
                resolve();
            });
        });
    });

    const app = createTestApp();

    // Override session to simulate a logged-in admin
    app.use((req, res, next) => {
        req.session.user = { id: 1, role: 'admin', username: 'adminuser', institutionId: 1 };
        next();
    });

    app.use('/institutions', institutionsRouter(db));

    agent = request.agent(app); // Keep session across requests
});

afterAll(async () => {
    await closeTestDB();
});

describe('Institutions Routes', () => {
    test('GET / returns list of institutions', async () => {
        const res = await agent.get('/institutions');
        expect(res.statusCode).toBe(200);
        // Optionally assert that the response contains "Test Institution"
        expect(res.text).toContain('Test Institution');
    });

    test('GET /:id returns institution details', async () => {
        const res = await agent.get('/institutions/1');
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('Test Institution');
    });

    test('PATCH /:id updates institution details', async () => {
        const res = await agent.patch('/institutions/1').send({
            institution_name: 'Updated Institution',
            address: '123 Test Ave'
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toContain('Institution updated successfully');
    });

    test('DELETE /:id deletes an institution', async () => {
        const res = await agent.delete(`/institutions/1`);
        expect(res.statusCode).toBe(200);
        expect(res.body.redirect).toContain('/logout');
    });
});