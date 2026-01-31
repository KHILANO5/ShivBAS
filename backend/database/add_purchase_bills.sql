-- Purchase Bills Table
CREATE TABLE IF NOT EXISTS purchase_bills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bill_number VARCHAR(50) UNIQUE NOT NULL,
    vendor_id INT,
    bill_date DATE NOT NULL,
    due_date DATE,
    total_amount DECIMAL(12, 2) DEFAULT 0,
    status ENUM('draft', 'posted', 'cancelled') DEFAULT 'draft',
    payment_status ENUM('not_paid', 'partial_paid', 'paid') DEFAULT 'not_paid',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES contacts(id) ON DELETE SET NULL
);

-- Insert sample data
INSERT INTO purchase_bills (bill_number, vendor_id, bill_date, due_date, total_amount, status, payment_status, notes) VALUES
('BILL-00001', 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 15000.00, 'posted', 'not_paid', 'Monthly supplies bill'),
('BILL-00002', 2, DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 25 DAY), 8500.00, 'posted', 'paid', 'Equipment maintenance'),
('BILL-00003', 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 15 DAY), 3200.00, 'draft', 'not_paid', 'Pending approval');
