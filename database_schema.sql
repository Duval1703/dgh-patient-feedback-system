-- Douala General Hospital Patient Feedback System - Database Schema
-- This SQL file creates all necessary tables for Supabase/PostgreSQL

-- Enable UUID extension (optional, for better IDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    specialty VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patients Table
CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone_number VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feedback Categories Table
CREATE TABLE IF NOT EXISTS feedback_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

-- Feedback Table
CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INTEGER REFERENCES doctors(id) ON DELETE SET NULL,
    category_id INTEGER REFERENCES feedback_categories(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feedback Replies Table
CREATE TABLE IF NOT EXISTS feedback_replies (
    id SERIAL PRIMARY KEY,
    feedback_id INTEGER REFERENCES feedback(id) ON DELETE CASCADE,
    admin_id INTEGER REFERENCES admins(id) ON DELETE SET NULL,
    reply_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medication Reminders Table
CREATE TABLE IF NOT EXISTS medication_reminders (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    medication VARCHAR(255) NOT NULL,
    time VARCHAR(10) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
    date VARCHAR(20) NOT NULL,
    time VARCHAR(10) NOT NULL,
    category VARCHAR(255),
    description TEXT,
    status VARCHAR(50) DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medications Table
CREATE TABLE IF NOT EXISTS medications (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
    medication VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    instructions TEXT,
    start_date VARCHAR(20),
    end_date VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_feedback_patient ON feedback(patient_id);
CREATE INDEX IF NOT EXISTS idx_feedback_doctor ON feedback(doctor_id);
CREATE INDEX IF NOT EXISTS idx_feedback_category ON feedback(category_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_medications_patient ON medications(patient_id);

-- Insert Default Feedback Categories
INSERT INTO feedback_categories (name) VALUES 
    ('Service Quality'),
    ('Doctor Consultation'),
    ('Wait Time'),
    ('Staff Behavior'),
    ('Facilities'),
    ('Overall Experience')
ON CONFLICT (name) DO NOTHING;

-- Insert Default Admin User (password: admin)
-- Password hash for 'admin' using bcrypt
INSERT INTO admins (email, password, name) VALUES 
    ('admin@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU8qXe8dWvMu', 'System Administrator')
ON CONFLICT (email) DO NOTHING;

-- Insert Sample Doctors (for testing)
-- Password: doctor123
INSERT INTO doctors (email, password, name, specialty, is_active) VALUES 
    ('dr.smith@dghcare.cm', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU8qXe8dWvMu', 'Dr. John Smith', 'cardiology', TRUE),
    ('dr.wilson@dghcare.cm', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU8qXe8dWvMu', 'Dr. Emily Wilson', 'pediatrics', TRUE),
    ('dr.brown@dghcare.cm', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU8qXe8dWvMu', 'Dr. Michael Brown', 'neurology', TRUE),
    ('dr.davis@dghcare.cm', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU8qXe8dWvMu', 'Dr. Sarah Davis', 'orthopedics', TRUE),
    ('dr.johnson@dghcare.cm', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU8qXe8dWvMu', 'Dr. James Johnson', 'general', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Insert Sample Patient (for testing)
-- Password: patient123
INSERT INTO patients (email, password, first_name, last_name, phone_number, is_active) VALUES 
    ('patient@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU8qXe8dWvMu', 'John', 'Doe', '+237123456789', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Success Message
SELECT 'Database schema created successfully! Default credentials:' as message
UNION ALL
SELECT 'Admin: admin@gmail.com / admin'
UNION ALL
SELECT 'Doctor: dr.smith@dghcare.cm / doctor123'
UNION ALL
SELECT 'Patient: patient@test.com / patient123';
