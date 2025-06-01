-- Insert subscription tiers for the faith sharing platform
INSERT INTO subscription_tiers (name, display_name, description, price_monthly, price_yearly, features, display_order, is_active, created_at, updated_at) VALUES 
('basic', 'Basic', 'Free tier with basic features', 0, 0,
 '["Up to 100 members", "Basic website builder", "Email support"]', 
 1, true, now(), now()),
('standard', 'Standard', 'Most popular plan for growing churches', 1999, 19990,
 '["Up to 500 members", "Advanced website builder", "Custom domain", "Priority support", "Event management", "Donation management"]', 
 2, true, now(), now()),
('premium', 'Premium', 'Full-featured plan for large organizations', 3999, 39990,
 '["Unlimited members", "Full website builder", "Multiple custom domains", "24/7 phone support", "Advanced analytics", "Multi-site management", "Custom integrations"]', 
 3, true, now(), now())
ON CONFLICT (name) DO UPDATE SET 
  display_name = EXCLUDED.display_name, 
  price_monthly = EXCLUDED.price_monthly, 
  price_yearly = EXCLUDED.price_yearly,
  description = EXCLUDED.description, 
  features = EXCLUDED.features, 
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();
