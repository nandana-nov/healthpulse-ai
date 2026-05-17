USE metafit;

INSERT INTO users (name,email,password_hash,role,credits) VALUES
('Admin','admin@example.com','$2y$10$examplehash', 'admin', 1000),
('Demo User','demo@example.com','$2y$10$examplehash','user',50);

-- Example BMI record
INSERT INTO bmi_records (user_id,height_cm,weight_kg,bmi,category) VALUES
(2,180,80,24.69,'Normal');
