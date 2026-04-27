CREATE TABLE plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    duration_months INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trainers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    specialization VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT,
    gender VARCHAR(10),
    phone VARCHAR(20) UNIQUE NOT NULL,
    plan_id INT REFERENCES plans(id) ON DELETE SET NULL,
    trainer_id INT REFERENCES trainers(id) ON DELETE SET NULL,
    join_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    face_encoding TEXT, -- JSONified array of floats
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    member_id INT REFERENCES members(id) ON DELETE CASCADE,
    check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    method VARCHAR(50) DEFAULT 'FACE_RECOGNITION', -- or MANUAL
    confidence_score DECIMAL(5,2) DEFAULT NULL
);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    member_id INT REFERENCES members(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'PAID',
    invoice_path VARCHAR(255)
);

CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default admin: admin / admin123
INSERT INTO admins (username, password_hash) VALUES ('admin', '$2y$10$O0FfF1hD3Rj2y43g.FzU1u7K9V4gRz7J4c5I8u/6Q3X5K9nJ5YyZy');

-- Default plans
INSERT INTO plans (name, duration_months, price) VALUES 
('Monthly', 1, 50.00),
('Quarterly', 3, 140.00),
('Yearly', 12, 500.00);
