-- Create purchase_orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    po_number VARCHAR(50) NOT NULL UNIQUE,
    vendor_id INT NOT NULL,
    order_date DATE NOT NULL,
    expected_date DATE,
    total_amount DECIMAL(15,2) DEFAULT 0,
    status ENUM('draft','sent','received','cancelled') DEFAULT 'draft',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES contacts(id)
);

-- Insert sample data
INSERT INTO purchase_orders (po_number, vendor_id, order_date, expected_date, total_amount, status) VALUES
('PO-2026-001', 3, '2026-01-20', '2026-02-01', 15000.00, 'sent'),
('PO-2026-002', 4, '2026-01-25', '2026-02-05', 5000.00, 'draft');
