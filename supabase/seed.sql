-- Seed data for subscription tiers
INSERT INTO "public"."subscription_tiers" ("name", "display_name", "description", "price_monthly", "price_yearly", "features", "display_order", "is_active") VALUES 
('basic', 'Basic Plan', 'Perfect for small churches starting out', 0, 0, '["Website hosting", "Basic templates", "5GB storage", "Email support"]', 1, true),
('standard', 'Standard Plan', 'Great for growing churches', 1999, 19992, '["Everything in Basic", "Custom domains", "50GB storage", "Priority support", "Advanced templates"]', 2, true),
('premium', 'Premium Plan', 'For large churches with advanced needs', 3999, 39992, '["Everything in Standard", "Unlimited storage", "Custom integrations", "Dedicated support", "Advanced analytics"]', 3, true)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  features = EXCLUDED.features,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active; 