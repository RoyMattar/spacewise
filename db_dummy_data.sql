BEGIN TRANSACTION;

-- Insert dummy users
INSERT INTO users (username, password_hash, role) VALUES
('admin1', 'hashed_password1', 'admin'),
('student1', 'hashed_password2', 'student'),
('student2', 'hashed_password3', 'student'),
('admin2', 'hashed_password4', 'admin');

-- Insert dummy institutions
INSERT INTO institutions (institution_name, bio, address, opening_hours, admin_id) VALUES
('Library Central', 'Main library of the city', '123 Library Street', '9 AM - 8 PM', 1),
('Co-working Space A', 'Modern space for startups', '456 Startup Lane', '24/7', 4);

-- Insert dummy spaces
INSERT INTO spaces (institution_id, space_name, layout_image) VALUES
(1, 'Library Room A', 'https://example.com/layouts/library-room-a.png'),
(1, 'Library Room B', 'https://example.com/layouts/library-room-b.png'),
(2, 'Startup Lounge', 'https://example.com/layouts/startup-lounge.png');

-- Insert dummy seats
INSERT INTO seats (space_id, seat_name, type, facilities, status) VALUES
(1, 'A1', 'Chair', '{"outlets": true, "lamp": true}', 'available'),
(1, 'A2', 'Table', '{"outlets": false, "lamp": true}', 'reserved'),
(2, 'B1', 'Armchair', '{"outlets": true}', 'available'),
(1, 'C1', 'Couch', '{"outlets": false, "lamp": false}', 'unavailable');

-- Insert dummy reservations
INSERT INTO reservations (seat_id, user_id, start_time, end_time, status) VALUES
(1, 2, '2024-12-01 10:00:00', '2024-12-01 12:00:00', 'active'),
(2, 3, '2024-12-01 13:00:00', '2024-12-01 14:00:00', 'cancelled'),
(4, 2, '2024-12-02 15:00:00', '2024-12-02 17:00:00', 'expired');

COMMIT;
