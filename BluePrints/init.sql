-- Initialization script for blueprints_db
-- This script is automatically executed when the container starts for the first time

-- Create the database (if not exists - Docker already creates it)
-- The database 'blueprints_db' is created by Docker Compose

-- Enable extensions if needed
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Note: JPA with ddl-auto: update will create the tables automatically
-- This file is optional and left here for manual schema management if needed

-- Example manual schema (optional - JPA creates this automatically):
/*
CREATE TABLE IF NOT EXISTS blueprints (
    id BIGSERIAL PRIMARY KEY,
    author VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    UNIQUE(author, name)
);

CREATE TABLE IF NOT EXISTS blueprint_points (
    blueprint_id BIGINT NOT NULL,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    FOREIGN KEY (blueprint_id) REFERENCES blueprints(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_blueprints_author ON blueprints(author);
CREATE INDEX IF NOT EXISTS idx_blueprints_author_name ON blueprints(author, name);
*/

-- Sample data (optional)
-- You can uncomment this if you want initial test data
/*
INSERT INTO blueprints (author, name) VALUES 
    ('john', 'house'),
    ('john', 'garage'),
    ('jane', 'garden')
ON CONFLICT (author, name) DO NOTHING;
*/
