-- Migration: Add address fields and tags to contacts table
-- Created: 2026-01-31

USE shivbas_db;

-- Add new columns to contacts table
ALTER TABLE contacts 
ADD COLUMN street VARCHAR(255) COMMENT 'Street address' AFTER phone,
ADD COLUMN city VARCHAR(100) COMMENT 'City' AFTER street,
ADD COLUMN state VARCHAR(100) COMMENT 'State/Province' AFTER city,
ADD COLUMN country VARCHAR(100) COMMENT 'Country' AFTER state,
ADD COLUMN pincode VARCHAR(20) COMMENT 'Postal/ZIP code' AFTER country,
ADD COLUMN tags VARCHAR(500) COMMENT 'Comma-separated tags (e.g., B2B, MSME, Retailer, Local)' AFTER pincode,
ADD COLUMN image_url VARCHAR(500) COMMENT 'Contact image/logo URL' AFTER tags;

-- Verify the changes
DESCRIBE contacts;
