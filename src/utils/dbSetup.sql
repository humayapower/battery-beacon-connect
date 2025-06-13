-- EMI Table
CREATE TABLE IF NOT EXISTS emis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL,
    emi_number INTEGER NOT NULL,
    total_emi_count INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'due',
    paid_amount DECIMAL(10,2) DEFAULT 0,
    remaining_amount DECIMAL(10,2) NOT NULL,
    overdue_days INTEGER DEFAULT 0,
    assignment_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Monthly Rents Table
CREATE TABLE IF NOT EXISTS monthly_rents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL,
    rent_month DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'due',
    paid_amount DECIMAL(10,2) DEFAULT 0,
    remaining_amount DECIMAL(10,2) NOT NULL,
    overdue_days INTEGER DEFAULT 0,
    is_prorated BOOLEAN DEFAULT FALSE,
    prorated_days INTEGER,
    daily_rate DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Ledger Table
CREATE TABLE IF NOT EXISTS payment_ledger (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL,
    transaction_id UUID NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_mode VARCHAR(20) NOT NULL,
    payment_status VARCHAR(20) NOT NULL,
    remaining_balance DECIMAL(10,2) NOT NULL,
    applicable_month DATE,
    emi_number INTEGER,
    emi_id UUID,
    rent_id UUID,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer Credits Table
CREATE TABLE IF NOT EXISTS customer_credits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL UNIQUE,
    credit_balance DECIMAL(10,2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_emis_customer_id ON emis(customer_id);
CREATE INDEX IF NOT EXISTS idx_emis_payment_status ON emis(payment_status);
CREATE INDEX IF NOT EXISTS idx_monthly_rents_customer_id ON monthly_rents(customer_id);
CREATE INDEX IF NOT EXISTS idx_monthly_rents_payment_status ON monthly_rents(payment_status);
CREATE INDEX IF NOT EXISTS idx_payment_ledger_customer_id ON payment_ledger(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON transactions(customer_id);