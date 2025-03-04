# SpaceWise Project

Welcome to the **SpaceWise** project repository! This web application is designed to streamline the reservation process for library seats, co-working spaces, and study rooms. It empowers both administrators and users with intuitive space and seat management features.

---

## **Project Overview**

SpaceWise is a web-based application aimed at simplifying shared space reservations. Core functionalities include:

- Real-time seat availability tracking.
- Filtering by seat type and facilities.
- Admin management for layouts and seat configurations.
- Notifications for reservations and reminders.
- User authentication with role-based access for admins and students.

SpaceWise is deployed to the World Wide Web and hosted on Render at: https://spacewise.onrender.com/.

---

## **Getting Started**

### Prerequisites

Ensure you have the following installed on your system:
- **npm** (Node Package Manager, version 8 or higher)
> **Note**: All other dependencies, including Node.js libraries and SQLite3, are automatically installed via `npm install`.

---

### Installation

1. **Clone the Repository (optional if source code is not downloaded directly as a ZIP file):**
   ```bash
   git clone https://github.com/RoyMattar/spacewise.git
   cd spacewise
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables:**
   Create a `.env` file in the root directory and add the following variables:
   ```env
   SESSION_SECRET=your_secret_key
   PORT=3000
   ```

4. **Initialize the Database:**
   Use the provided scripts to set up the database:
   ```bash
   npm run build-db   # For Unix-based systems
   npm run build-db-win   # For Windows systems
   ```

   To clean the database:
   ```bash
   npm run clean-db   # For Unix-based systems
   npm run clean-db-win   # For Windows systems
   ```

5. **Optional - Insert Dummy Data into the Database:**
   Use the provided script to insert dummy data into the database for testing purposes:
   ```bash
   npm run init-dummy-data
   ```

---

### Running the Application

Start the application locally:
```bash
npm start
```

The app will run at [http://localhost:3000](http://localhost:3000).

Production Deployment: The app is hoted on Render at: https://spacewise.onrender.com/.

---

## **Project Structure**

```
project-root/
├── public/                      # Public resources
│   ├── static/                  # Static assets (CSS, JS, images)
│   └── space_layouts/           # Space layout images stored on disk
├── views/                       # EJS templates for rendering views
│   ├── partials/                # Reusable EJS components
├── routes/                      # Route handlers for different modules
│   ├── auth.js                  # Routes for authentication (login/register)
│   ├── admin.js                 # Routes for admin functionality
│   └── student.js               # Routes for student functionality
├── middleware/                  # Middleware for server
│   ├── ensure_correct_admin.js  # Middleware to restrict access to correct admins only
│   └── require_auth.js          # Middleware to restrict access to authenticated users
├── tests/                       # Automated JEST tests
│   ├── auth.test.js             # Tests for authentication routes
│   ├── institutions.test.js     # Tests for institution routes
│   ├── reservations.test.js     # Tests for reservation routes
│   ├── test_db.js               # In-memory DB setup for tests
│   └── test_setup.js            # Common test setup (Express app, sessions, etc.)
├── database.db                  # SQLite database file (generated after building the SQL file in step 4)
├── db_schema.sql                # SQL file for database schema
├── db_dummy_data.sql            # SQL file to insert dummy data into the database
├── .env                         # Environment variables
├── .github/workflows/ci.yml     # CI/CD automation using GitHub Actions
├── index.js                     # Main entry point for the app
├── package.json                 # Dependencies and scripts
├── package-lock.json            # Dependency lockfile (generated after running `npm install`)
└── README.md                    # Project documentation
```

---

## **Features**

### Student Features
- View institutions (libraries and co-working spaces) and their spaces.
- View seat availability in spaces and reserve seats.
- Filter seats by type and facilities.

### Admin Features
- Manage the institution.
- Upload layouts and configure seats.
- View and manage reservations.

---

## **Scripts**

The following npm scripts are available for database management and starting the application:

- **Build Database (Unix/Windows):**
  ```bash
  npm run build-db
  ```
- **Insert Dummy Data Into the Database (Unix/Windows):**
  ```bash
  npm run init-dummy-data
  ```
- **Start Application:**
  ```bash
  npm start
  ```
- **Clean Database (Unix):**
  ```bash
  npm run clean-db
  ```
- **Clean Database (Windows):**
  ```bash
  npm run clean-db-win
  ```
- **Rebuild Database (Unix):**
  ```bash
  npm run rebuild-db
  ```
- **Rebuild Database with Dummy Data (Unix):**
  ```bash
  npm run rebuild-db-dummy
  ```
- **Rebuild Database (Windows):**
  ```bash
  npm run rebuild-db-win
  ```
- **Rebuild Database with Dummy Data (Windows):**
  ```bash
  npm run rebuild-db-dummy-win
  ```
- **Run ESLint check:**
  ```bash
  npm run lint
  ```
- **Fix ESLint issues:**
  ```bash
  npm run lint:fix
  ```
- **Run API tests with Jest:**
  ```bash
  npm run test
  ```
- **Run CI validation locally (lint + test):**
  ```bash
  npm run ci
  ```

---

## **Technologies Used**

- **Node.js** and **Express.js**: Backend framework.
- **EJS**: Templating engine for dynamic views.
- **SQLite3**: Lightweight database for data persistence.
- **dotenv**: Environment variable management.
- **body-parser**: Middleware for parsing request bodies.
- **express-session**: Session management.
- **bcrypt**: Secure password hashing.
- **TailwindCSS**: Styling framework for responsive and modern UI.
- **GitHub Actions**: CI/CD automation for linting and testing.
- **Jest**: API unit testing.
- **Chrome DevTools' Network**: Test frontend API calls.
- **ESLint**: Linting and code style enforcement.


---

## **Development Guidelines**

### Branching and Commit Rules
- Create feature-specific branches for development.
- Submit pull requests for review before merging.
- Include clear commit messages for traceability (titles and descriptions).
- Include tags in the commit titles for clarity - [INFRA], [SERVER], [CLIENT], [TEST] or [DOC].

### Code Style
- Follow **JavaScript Standard Style**.
- Use comments to explain complex logic.
- Update the README.md as necessary.
- Ensure consistent code formatting using ESLint before submitting a PR.

### Testing
- Unit tests are recommended for all new features.
- Use Jest to write tests for APIs.
- Test API endpoints using Postman.
- Test client API calls using Chrome DevTools' Network.

---

## **Contributors**
- **Roy**, **Indu**, **Zachary** and **Jones**.

---

## **License**
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## **Contact**
For questions or contributions, please contact us at:
- Email: support@spacewise.com
- GitHub Issues: [Open an issue](https://github.com/your-repo/spacewise/issues)

---
