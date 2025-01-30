BEGIN TRANSACTION;

-- Insert dummy users
INSERT INTO users (username, password_hash, role) VALUES
('admin1', 'hashed_password1', 'admin'),
('student1', 'hashed_password2', 'student'),
('student2', 'hashed_password3', 'student'),
('admin2', 'hashed_password4', 'admin');

SELECT * FROM users;

-- Authenticate student/admin and return a token
SELECT user_id, role 
FROM users 
WHERE username = 'admin1' AND password_hash = 'hashed_password1';

SELECT role FROM users WHERE user_id = 1;

-- Insert dummy institutions
INSERT INTO institutions (institution_name, bio, address, opening_hours, admin_id) VALUES
('Library Central', 'Main library of the city', '123 Library Street', '9 AM - 8 PM', 1),
('Co-working Space A', 'Modern space for startups', '456 Startup Lane', '24/7', 4);

INSERT INTO institutions (institution_name, bio, address, opening_hours, admin_id) 
VALUES ('Co-working Space B', 'Modern space for startups', '456 Startup Lane', '24/7', 5);

SELECT * FROM institutions;

-- Retrieve a list of all institutions
SELECT institution_id, institution_name, bio, address, opening_hours FROM institutions;

-- Retrieve details of a specific institution
SELECT institution_id, institution_name, bio, address, opening_hours FROM institutions
WHERE institution_id = 2;

-- Update institution details
UPDATE institutions
SET bio = 'Updated bio for the institution',
    address = 'New Address Street',
    opening_hours = '8 AM - 6 PM'
WHERE institution_id = 2;

-- Delete the institution and its data
DELETE FROM institutions WHERE institution_id = 1;

-- Update admin users with institution_id
UPDATE users SET institution_id = 1 WHERE user_id = 1;
UPDATE users SET institution_id = 2 WHERE user_id = 4;

-- Insert dummy spaces
INSERT INTO spaces (institution_id, space_name, layout_image) VALUES
(1, 'Library Room A', 'https://example.com/layouts/library-room-a.png'),
(1, 'Library Room B', 'https://example.com/layouts/library-room-b.png'),
(2, 'Startup Lounge', 'https://example.com/layouts/startup-lounge.png');

SELECT * FROM spaces;

-- Retrieve all spaces for a specific institution
SELECT space_id, space_name, layout_image FROM spaces WHERE institution_id = 1;

-- Retrieve details for a specific space
SELECT space_id, space_name, layout_image FROM spaces WHERE institution_id = 1 AND space_id = 1;

-- Update space details and/or replace the layout image
UPDATE spaces
SET space_name = 'Updated Room Name',
    layout_image = 'updated.png'
WHERE institution_id = 2 AND space_id = 2;

-- Delete a specific space
DELETE FROM spaces WHERE institution_id = 1 AND space_id = 2;

-- Insert dummy seats
INSERT INTO seats (space_id, seat_name, type, facilities, status) VALUES
(1, 'A1', 'Chair', '{"outlets": true, "lamp": true}', 'available'),
(1, 'A2', 'Table', '{"outlets": false, "lamp": true}', 'reserved'),
(2, 'B1', 'Armchair', '{"outlets": true}', 'available'),
(1, 'C1', 'Couch', '{"outlets": false, "lamp": false}', 'unavailable');

SELECT * FROM seats;

-- Update details of a specific seat
UPDATE seats
SET type = 'Table',
    facilities = '["Outlet"]',
    status = 'Unavailable'
WHERE space_id = 1 AND seat_id = 2;

-- Remove a specific seat
DELETE FROM seats WHERE space_id = 1 AND seat_id = 2;

SELECT * FROM seats WHERE seat_id = 3;


-- Insert dummy reservations
INSERT INTO reservations (seat_id, user_id, start_time, end_time, status) VALUES
(1, 2, '2024-12-01 10:00:00', '2024-12-01 12:00:00', 'active'),
(2, 3, '2024-12-01 13:00:00', '2024-12-01 14:00:00', 'cancelled'),
(4, 2, '2024-12-02 15:00:00', '2024-12-02 17:00:00', 'expired');

SELECT * FROM reservations;

-- Retrieve all reservations for a specific user
SELECT r.reservation_id, r.seat_id, r.start_time, r.end_time, r.status
FROM reservations r
JOIN seats s ON r.seat_id = s.seat_id
WHERE r.user_id = 3;

COMMIT;
