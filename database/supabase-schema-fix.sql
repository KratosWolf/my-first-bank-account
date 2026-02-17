-- Supabase Schema Fixes for My First Bank Account
-- Run these commands in Supabase SQL Editor

-- Fix 1: Add missing parent_avatar column to families table
ALTER TABLE families ADD COLUMN IF NOT EXISTS parent_avatar TEXT;

-- Fix 2: Create missing purchase_requests table
CREATE TABLE IF NOT EXISTS purchase_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    parent_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fix 3: Create updated_at trigger for purchase_requests
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_purchase_requests_updated_at 
    BEFORE UPDATE ON purchase_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fix 4: Add RLS policies for purchase_requests
ALTER TABLE purchase_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see purchase requests from their family's children
CREATE POLICY "Users can view their family's purchase requests" ON purchase_requests
FOR SELECT USING (
    child_id IN (
        SELECT id FROM children 
        WHERE family_id = auth.uid()::text
    )
);

-- Policy: Users can insert purchase requests for their family's children  
CREATE POLICY "Users can create purchase requests for their children" ON purchase_requests
FOR INSERT WITH CHECK (
    child_id IN (
        SELECT id FROM children 
        WHERE family_id = auth.uid()::text
    )
);

-- Policy: Users can update purchase requests from their family
CREATE POLICY "Users can update their family's purchase requests" ON purchase_requests
FOR UPDATE USING (
    child_id IN (
        SELECT id FROM children 
        WHERE family_id = auth.uid()::text
    )
);

-- Fix 5: Ensure families table has correct RLS policies
ALTER TABLE families ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own family
CREATE POLICY "Users can view own family" ON families
FOR SELECT USING (auth.uid()::text = id);

-- Policy: Users can insert their own family
CREATE POLICY "Users can insert own family" ON families
FOR INSERT WITH CHECK (auth.uid()::text = id);

-- Policy: Users can update their own family
CREATE POLICY "Users can update own family" ON families  
FOR UPDATE USING (auth.uid()::text = id);

-- Fix 6: Ensure children table has correct RLS policies
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their family's children
CREATE POLICY "Users can view their children" ON children
FOR SELECT USING (family_id = auth.uid()::text);

-- Policy: Users can insert children for their family
CREATE POLICY "Users can insert children" ON children
FOR INSERT WITH CHECK (family_id = auth.uid()::text);

-- Policy: Users can update their children
CREATE POLICY "Users can update their children" ON children
FOR UPDATE USING (family_id = auth.uid()::text);

-- Policy: Users can delete their children
CREATE POLICY "Users can delete their children" ON children
FOR DELETE USING (family_id = auth.uid()::text);

-- Verification queries (run these to check if everything is working)
/*
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('families', 'children', 'purchase_requests')
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

SELECT schemaname, tablename, policyname, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('families', 'children', 'purchase_requests');
*/