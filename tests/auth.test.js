const request = require('supertest');
const { setupTestDB, closeTestDB } = require('./test_db');
const createTestApp = require('./test_setup');
const authRouter = require('../routes/auth');

let agent; // Persistent session for auth tests

beforeAll(async () => {
    const db = await setupTestDB(); // Initialize test database
    if (!db) {
        throw new Error("Test database (db) is not initialized.");
    }

    const app = createTestApp();
    app.use('/', authRouter(db)); // Inject test database into auth router

    agent = request.agent(app); // Keep session across requests
});

afterAll(async () => {
    await closeTestDB();
});

const NEW_USER = { username: "newuser", password: "securepassword", role: "student" };
const TEST_USER = { username: "testuser", password: "testpassword", role: "student" };
const ADMIN_USER = { username: "adminuser", password: "adminpassword", role: "admin" };

describe('Auth Routes', () => {

    test('Should successfully register a new student user', async () => {
        const res = await agent.post('/register').send(NEW_USER);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.redirect).toBe('/');
    });

    test('Should return error for duplicate username registration', async () => {
        await agent.post('/register').send(TEST_USER);
        const res = await agent.post('/register').send(TEST_USER);

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Username already exists');
    });

    test('Should return error for missing fields in registration', async () => {
        const res = await agent.post('/register').send({
            username: "",
            password: "password",
            role: "student"
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('All fields are required');
    });

    test('Should return error for wrong login credentials', async () => {
        const res = await agent.post('/login').send({
            username: TEST_USER.username,
            password: "wrongpassword"
        });

        expect(res.statusCode).toBe(401);
        expect(res.body.error).toBe('Incorrect password');
    });

    test('Should return success for correct login of a student', async () => {
        const res = await agent.post('/login').send({
            username: TEST_USER.username,
            password: TEST_USER.password
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test('Should allow an authenticated user to access /home', async () => {
        const res = await agent.get('/home');
        expect(res.statusCode).toBe(200);
    });

    test('Should log out and prevent access to /home', async () => {
        const resBeforeLogout = await agent.get('/home');
        expect(resBeforeLogout.statusCode).toBe(200);

        await agent.post('/logout');

        const resAfterLogout = await agent.get('/home');
        expect(resAfterLogout.statusCode).toBe(302);
    });

    test('Should successfully register an admin user', async () => {
        let adminRegister = ADMIN_USER;
        adminRegister.institution_name = "library";
        const res = await agent.post('/register').send(adminRegister);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.redirect).toBe('/');
    });

    test('Should allow an admin user to log in', async () => {
        const res = await agent.post('/login').send({
            username: ADMIN_USER.username,
            password: ADMIN_USER.password
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test('Should allow an admin user to access /home', async () => {
        const res = await agent.get('/home');
        expect(res.statusCode).toBe(200);
    });

});
