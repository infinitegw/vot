CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY,
    password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    class TEXT NOT NULL,
    dorm TEXT NOT NULL
);

-- Insert default admin password (admin123 hashed)
INSERT INTO admin (id, password)
VALUES (1, '$2b$10$0/kkcFxIpxC7oQDYEMH0euTYoAqj7hA4bMZL5PztZ0B7q2B0GeW0e');
