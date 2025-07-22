-- حذف البيانات الموجودة
DELETE FROM platform_subscriptions;

-- إعادة تعيين AUTO_INCREMENT
ALTER TABLE platform_subscriptions AUTO_INCREMENT = 1;

-- إدراج أكواد جديدة بدون user_id (الأكواد فقط)
INSERT INTO platform_subscriptions (user_id, type, expires_at, code, created_at) VALUES 
(999, 'monthly', '2025-08-22 12:47:41', 'MONTH30', '2025-07-22 12:47:41'),
(999, 'permanent', NULL, 'VIP2025', '2025-07-22 12:47:41'),
(999, 'monthly', '2025-08-22 12:47:41', 'STUDENT', '2025-07-22 12:47:41'),
(999, 'permanent', NULL, 'PREMIUM', '2025-07-22 12:47:41'),
(999, 'monthly', '2025-09-22 12:47:41', 'TRIAL60', '2025-07-22 12:47:41'),
(999, 'permanent', NULL, 'GOLDEN', '2025-07-22 12:47:41'),
(999, 'monthly', '2025-08-22 12:47:41', 'BASIC30', '2025-07-22 12:47:41'),
(999, 'permanent', NULL, 'DIAMOND', '2025-07-22 12:47:41'),
(999, 'monthly', '2025-10-22 12:47:41', 'GIFT90', '2025-07-22 12:47:41'),
(999, 'permanent', NULL, 'MASTER', '2025-07-22 12:47:41');