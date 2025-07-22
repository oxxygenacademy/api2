-- إنشاء جدول منفصل للأكواد
CREATE TABLE subscription_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    type ENUM('monthly', 'permanent', 'custom') NOT NULL,
    duration_days INT NULL, -- عدد الأيام للأكواد المخصصة
    is_used BOOLEAN DEFAULT FALSE,
    used_by_user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP NULL
);

-- إدراج أكواد الاشتراك
INSERT INTO subscription_codes (code, type, duration_days) VALUES 
('MONTH30', 'monthly', 30),
('VIP2025', 'permanent', NULL),
('STUDENT', 'monthly', 30),
('PREMIUM', 'permanent', NULL),
('TRIAL60', 'custom', 60),
('GOLDEN', 'permanent', NULL),
('BASIC30', 'monthly', 30),
('DIAMOND', 'permanent', NULL),
('GIFT90', 'custom', 90),
('MASTER', 'permanent', NULL);