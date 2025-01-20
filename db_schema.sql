-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'student')), -- Role determines subclass
    institution_id INTEGER DEFAULT NULL, -- Only for admins
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (institution_id) REFERENCES institutions(institution_id) ON DELETE SET NULL
);

CREATE TABLE institutions (
    institution_id INTEGER PRIMARY KEY AUTOINCREMENT,
    institution_name TEXT NOT NULL,
    bio TEXT,
    address TEXT,
    opening_hours TEXT,
    admin_id INTEGER NOT NULL, -- Foreign key linking to users.user_id
    FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE spaces (
    space_id INTEGER PRIMARY KEY AUTOINCREMENT,
    institution_id INTEGER NOT NULL, -- Foreign key linking to institutions.institution_id
    name TEXT NOT NULL,
    layout_image TEXT, -- URL or path to the uploaded layout image
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (institution_id) REFERENCES institutions(institution_id) ON DELETE CASCADE
);

CREATE TABLE seats (
    seat_id INTEGER PRIMARY KEY AUTOINCREMENT,
    space_id INTEGER NOT NULL, -- Foreign key linking to spaces.space_id
    seat_name TEXT NOT NULL, -- e.g., 'A1', 'B1'
    type TEXT, -- e.g., 'Chair', 'Table'
    facilities TEXT, -- JSON string to store facilities, e.g., '{"Outlet": true, "Lamp": false}'
    status TEXT NOT NULL CHECK(status IN ('Available', 'Reserved', 'Unavailable')), -- Current seat status
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (space_id) REFERENCES spaces(space_id) ON DELETE CASCADE
);

CREATE TABLE reservations (
    reservation_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL, -- Foreign key linking to users.user_id
    seat_id INTEGER NOT NULL, -- Foreign key linking to seats.seat_id
    space_id INTEGER NOT NULL, -- Foreign key linking to spaces.space_id
    start_time TIMESTAMP NOT NULL, -- Reservation start time
    end_time TIMESTAMP NOT NULL,   -- Reservation end time
    status TEXT NOT NULL CHECK(status IN ('active', 'expired', 'cancelled')), -- Reservation status
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES seats(seat_id) ON DELETE CASCADE,
    FOREIGN KEY (space_id) REFERENCES spaces(space_id) ON DELETE CASCADE
);

COMMIT;
