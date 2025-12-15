-- MilesManager Database Schema
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for encryption
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- USERS & ORGANIZATIONS (Multi-tenancy)
-- ============================================

-- Organizations table (each user/milheiro has their own organization)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization members (for future team functionality)
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'member'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- ============================================
-- MANAGED ACCOUNTS (CPF holders)
-- ============================================

CREATE TABLE managed_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) NOT NULL, -- Format: 000.000.000-00
  birth_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, cpf)
);

-- ============================================
-- LOYALTY PROGRAMS
-- ============================================

CREATE TYPE program_type AS ENUM ('LATAM', 'AZUL', 'SMILES', 'LIVELO', 'KM_PARCEIROS', 'OTHER');

CREATE TABLE loyalty_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  managed_account_id UUID NOT NULL REFERENCES managed_accounts(id) ON DELETE CASCADE,
  program_type program_type NOT NULL,
  account_number VARCHAR(100),
  current_balance INTEGER DEFAULT 0,
  -- Encrypted credentials (using pgcrypto)
  encrypted_credentials TEXT, -- JSON with login/password/rescue_code
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(managed_account_id, program_type)
);

-- ============================================
-- MILES INVENTORY (Estoque de Pontos)
-- ============================================

CREATE TYPE transaction_type AS ENUM ('PURCHASE', 'SALE', 'TRANSFER_IN', 'TRANSFER_OUT', 'EXPIRATION', 'ADJUSTMENT');

CREATE TABLE miles_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  loyalty_program_id UUID NOT NULL REFERENCES loyalty_programs(id) ON DELETE CASCADE,
  transaction_type transaction_type NOT NULL,
  amount INTEGER NOT NULL, -- Positive for additions, negative for subtractions
  cost_brl DECIMAL(10, 2), -- Cost in BRL (for purchases)
  price_brl DECIMAL(10, 2), -- Sale price in BRL (for sales)
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE, -- For installment payments or expiration dates
  notes TEXT,
  -- Link to financial records
  purchase_id UUID, -- Reference to purchases table
  sale_id UUID, -- Reference to sales table
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- BENEFICIARIES (Crucial for airline limits)
-- ============================================

CREATE TYPE beneficiary_status AS ENUM ('ACTIVE', 'INACTIVE', 'QUARANTINE');

CREATE TABLE beneficiaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  managed_account_id UUID NOT NULL REFERENCES managed_accounts(id) ON DELETE CASCADE,
  program_type program_type NOT NULL,
  name VARCHAR(255) NOT NULL,
  cpf VARCHAR(14),
  total_slots INTEGER NOT NULL, -- Total beneficiary slots
  used_slots INTEGER NOT NULL DEFAULT 0, -- Currently used slots
  status beneficiary_status NOT NULL DEFAULT 'ACTIVE',
  quarantine_until DATE, -- If in quarantine
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(managed_account_id, program_type)
);

-- Track individual beneficiary usage
CREATE TABLE beneficiary_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  beneficiary_id UUID NOT NULL REFERENCES beneficiaries(id) ON DELETE CASCADE,
  passenger_name VARCHAR(255) NOT NULL,
  passenger_cpf VARCHAR(14),
  used_date DATE NOT NULL,
  returned_date DATE, -- When slot becomes available again
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- FINANCIAL MANAGEMENT
-- ============================================

-- Credit cards for tracking purchases
CREATE TABLE credit_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL, -- e.g., "C6 BANK", "SANTANDER 6144"
  last_four_digits VARCHAR(4),
  bank_name VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchases (buying miles/points)
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  managed_account_id UUID NOT NULL REFERENCES managed_accounts(id) ON DELETE CASCADE,
  loyalty_program_id UUID NOT NULL REFERENCES loyalty_programs(id) ON DELETE CASCADE,
  credit_card_id UUID REFERENCES credit_cards(id),
  amount_miles INTEGER NOT NULL,
  total_cost_brl DECIMAL(10, 2) NOT NULL,
  cost_per_thousand DECIMAL(10, 2) NOT NULL, -- CPM
  installments INTEGER DEFAULT 1,
  installment_amount DECIMAL(10, 2),
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  first_due_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales channels
CREATE TYPE sale_channel AS ENUM ('HOTMILHAS', 'MAXMILHAS', 'DIRECT', 'OTHER');

-- Sales (selling miles)
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  loyalty_program_id UUID NOT NULL REFERENCES loyalty_programs(id) ON DELETE CASCADE,
  beneficiary_id UUID REFERENCES beneficiaries(id), -- Which beneficiary was used
  amount_miles INTEGER NOT NULL,
  price_per_thousand DECIMAL(10, 2) NOT NULL,
  total_price_brl DECIMAL(10, 2) NOT NULL,
  sale_channel sale_channel NOT NULL,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_payment_date DATE,
  actual_payment_date DATE,
  amount_paid DECIMAL(10, 2),
  customer_name VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cash flow projections
CREATE TABLE cash_flow_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  item_type VARCHAR(50) NOT NULL, -- 'INCOME', 'EXPENSE'
  category VARCHAR(100), -- 'SALE', 'CARD_PAYMENT', 'PURCHASE'
  amount_brl DECIMAL(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'PAID', 'OVERDUE'
  related_purchase_id UUID REFERENCES purchases(id),
  related_sale_id UUID REFERENCES sales(id),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_organizations_owner ON organizations(owner_id);
CREATE INDEX idx_managed_accounts_org ON managed_accounts(organization_id);
CREATE INDEX idx_loyalty_programs_org ON loyalty_programs(organization_id);
CREATE INDEX idx_loyalty_programs_account ON loyalty_programs(managed_account_id);
CREATE INDEX idx_miles_transactions_org ON miles_transactions(organization_id);
CREATE INDEX idx_miles_transactions_program ON miles_transactions(loyalty_program_id);
CREATE INDEX idx_miles_transactions_date ON miles_transactions(transaction_date);
CREATE INDEX idx_beneficiaries_org ON beneficiaries(organization_id);
CREATE INDEX idx_beneficiaries_account ON beneficiaries(managed_account_id);
CREATE INDEX idx_purchases_org ON purchases(organization_id);
CREATE INDEX idx_sales_org ON sales(organization_id);
CREATE INDEX idx_cash_flow_org ON cash_flow_items(organization_id);
CREATE INDEX idx_cash_flow_date ON cash_flow_items(due_date);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE managed_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE miles_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiary_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Users can view their own organizations" ON organizations
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can create their own organizations" ON organizations
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own organizations" ON organizations
  FOR UPDATE USING (owner_id = auth.uid());

-- Helper function to check organization membership
CREATE OR REPLACE FUNCTION is_organization_member(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organizations
    WHERE id = org_id AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for managed_accounts
CREATE POLICY "Members can view accounts in their org" ON managed_accounts
  FOR SELECT USING (is_organization_member(organization_id));

CREATE POLICY "Members can create accounts in their org" ON managed_accounts
  FOR INSERT WITH CHECK (is_organization_member(organization_id));

CREATE POLICY "Members can update accounts in their org" ON managed_accounts
  FOR UPDATE USING (is_organization_member(organization_id));

CREATE POLICY "Members can delete accounts in their org" ON managed_accounts
  FOR DELETE USING (is_organization_member(organization_id));

-- Apply similar policies to other tables
CREATE POLICY "Members can view loyalty programs" ON loyalty_programs
  FOR SELECT USING (is_organization_member(organization_id));

CREATE POLICY "Members can manage loyalty programs" ON loyalty_programs
  FOR ALL USING (is_organization_member(organization_id));

CREATE POLICY "Members can view miles transactions" ON miles_transactions
  FOR SELECT USING (is_organization_member(organization_id));

CREATE POLICY "Members can manage miles transactions" ON miles_transactions
  FOR ALL USING (is_organization_member(organization_id));

CREATE POLICY "Members can view beneficiaries" ON beneficiaries
  FOR SELECT USING (is_organization_member(organization_id));

CREATE POLICY "Members can manage beneficiaries" ON beneficiaries
  FOR ALL USING (is_organization_member(organization_id));

CREATE POLICY "Members can view beneficiary usage" ON beneficiary_usage
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM beneficiaries b
      WHERE b.id = beneficiary_usage.beneficiary_id
      AND is_organization_member(b.organization_id)
    )
  );

CREATE POLICY "Members can view credit cards" ON credit_cards
  FOR SELECT USING (is_organization_member(organization_id));

CREATE POLICY "Members can manage credit cards" ON credit_cards
  FOR ALL USING (is_organization_member(organization_id));

CREATE POLICY "Members can view purchases" ON purchases
  FOR SELECT USING (is_organization_member(organization_id));

CREATE POLICY "Members can manage purchases" ON purchases
  FOR ALL USING (is_organization_member(organization_id));

CREATE POLICY "Members can view sales" ON sales
  FOR SELECT USING (is_organization_member(organization_id));

CREATE POLICY "Members can manage sales" ON sales
  FOR ALL USING (is_organization_member(organization_id));

CREATE POLICY "Members can view cash flow" ON cash_flow_items
  FOR SELECT USING (is_organization_member(organization_id));

CREATE POLICY "Members can manage cash flow" ON cash_flow_items
  FOR ALL USING (is_organization_member(organization_id));

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to relevant tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_managed_accounts_updated_at BEFORE UPDATE ON managed_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loyalty_programs_updated_at BEFORE UPDATE ON loyalty_programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beneficiaries_updated_at BEFORE UPDATE ON beneficiaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update loyalty program balance
CREATE OR REPLACE FUNCTION update_loyalty_program_balance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE loyalty_programs
  SET current_balance = current_balance + NEW.amount
  WHERE id = NEW.loyalty_program_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_balance_on_transaction AFTER INSERT ON miles_transactions
  FOR EACH ROW EXECUTE FUNCTION update_loyalty_program_balance();

-- Function to update beneficiary slots
CREATE OR REPLACE FUNCTION update_beneficiary_slots()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE beneficiaries
    SET used_slots = used_slots + 1
    WHERE id = NEW.beneficiary_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.returned_date IS NOT NULL AND OLD.returned_date IS NULL THEN
    UPDATE beneficiaries
    SET used_slots = used_slots - 1
    WHERE id = NEW.beneficiary_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_slots_on_usage AFTER INSERT OR UPDATE ON beneficiary_usage
  FOR EACH ROW EXECUTE FUNCTION update_beneficiary_slots();

