-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;


CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'student')), -- Role determines subclass
    institution_id INTEGER UNIQUE DEFAULT NULL, -- Only for admins, 1-to-1 with institution
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (institution_id) REFERENCES institutions(institution_id) ON DELETE SET NULL
);

-- Enforce: Only admins can be assigned an institution_id
CREATE TRIGGER enforce_admin_update
BEFORE UPDATE OF institution_id ON users
FOR EACH ROW
WHEN (SELECT role FROM users WHERE user_id = NEW.user_id) != 'admin'
BEGIN
    SELECT RAISE(ABORT, 'Only admin users can be assigned an institution_id');
END;


CREATE TABLE institutions (
    institution_id INTEGER PRIMARY KEY AUTOINCREMENT,
    institution_name TEXT NOT NULL,
    bio TEXT,
    address TEXT,
    opening_hours TEXT,
    admin_id INTEGER UNIQUE NOT NULL, -- Foreign key linking to users.user_id, 1-to-1 with admin
    FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Enforce: Instituions can refer only to admins
CREATE TRIGGER enforce_admin_id
BEFORE INSERT OR UPDATE ON institutions
FOR EACH ROW
WHEN (SELECT role FROM users WHERE user_id = NEW.admin_id) != 'admin'
BEGIN
    SELECT RAISE(ABORT, 'admin_id must belong to a user with role=admin');
END;


CREATE TABLE spaces (
    space_id INTEGER PRIMARY KEY AUTOINCREMENT,
    institution_id INTEGER NOT NULL, -- Foreign key linking to institutions.institution_id
    space_name TEXT NOT NULL,
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
    status TEXT NOT NULL CHECK(status IN ('available', 'reserved', 'unavailable')), -- Current seat status
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (space_id) REFERENCES spaces(space_id) ON DELETE CASCADE,
    UNIQUE (space_id, seat_name) -- Ensure seat_name is unique within a space
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
