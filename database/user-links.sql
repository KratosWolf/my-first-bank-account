-- ============================================
-- TABELA DE VINCULAÇÃO DE USUÁRIOS GOOGLE
-- Sistema: My First Bank Account
-- Família: Fernandes
-- ============================================

-- Criar tabela user_links
CREATE TABLE IF NOT EXISTS user_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('parent', 'child')),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    avatar VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_child_role CHECK (
        (role = 'child' AND child_id IS NOT NULL) OR
        (role = 'parent' AND child_id IS NULL)
    )
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_links_email ON user_links(email);
CREATE INDEX IF NOT EXISTS idx_user_links_family_id ON user_links(family_id);
CREATE INDEX IF NOT EXISTS idx_user_links_child_id ON user_links(child_id);

-- Comentários nas colunas
COMMENT ON TABLE user_links IS 'Vinculação de emails Google OAuth aos perfis da família';
COMMENT ON COLUMN user_links.email IS 'Email do Google OAuth (único no sistema)';
COMMENT ON COLUMN user_links.role IS 'Papel do usuário: parent ou child';
COMMENT ON COLUMN user_links.family_id IS 'ID da família à qual o usuário pertence';
COMMENT ON COLUMN user_links.child_id IS 'ID da criança (NULL para pais)';
COMMENT ON COLUMN user_links.name IS 'Nome para exibição na interface';
COMMENT ON COLUMN user_links.avatar IS 'Emoji ou avatar do usuário';

-- ============================================
-- INSERIR MEMBROS DA FAMÍLIA FERNANDES
-- Family ID: 2303cb6b-3c0e-4529-9397-dabcd088dbbe
-- Rafael ID: 317b190a-5e93-42ed-a923-c8769bcec196
-- Gabriel ID: 3a4fb20b-f56e-43b9-a194-c9cf37f0ac6b
-- ============================================

-- Tiago (Pai)
INSERT INTO user_links (email, role, family_id, child_id, name, avatar)
VALUES (
    'tifernandes@gmail.com',
    'parent',
    '2303cb6b-3c0e-4529-9397-dabcd088dbbe',
    NULL,
    'Tiago',
    '👨'
);

-- Helena (Mãe)
INSERT INTO user_links (email, role, family_id, child_id, name, avatar)
VALUES (
    'lemarinhofernandes@gmail.com',
    'parent',
    '2303cb6b-3c0e-4529-9397-dabcd088dbbe',
    NULL,
    'Helena',
    '👩'
);

-- Rafael (Filho)
INSERT INTO user_links (email, role, family_id, child_id, name, avatar)
VALUES (
    'rafamfernandes12@gmail.com',
    'child',
    '2303cb6b-3c0e-4529-9397-dabcd088dbbe',
    '317b190a-5e93-42ed-a923-c8769bcec196',
    'Rafael',
    '👦'
);

-- Gabriel (Filho)
INSERT INTO user_links (email, role, family_id, child_id, name, avatar)
VALUES (
    'gabrielmfernandes27@gmail.com',
    'child',
    '2303cb6b-3c0e-4529-9397-dabcd088dbbe',
    '3a4fb20b-f56e-43b9-a194-c9cf37f0ac6b',
    'Gabriel',
    '👦'
);

-- ============================================
-- VERIFICAÇÃO DOS DADOS INSERIDOS
-- ============================================

-- Ver todos os links de usuários
SELECT * FROM user_links ORDER BY role, name;

-- Ver links da família Fernandes com detalhes das crianças
SELECT
    ul.email,
    ul.role,
    ul.name AS user_name,
    ul.avatar,
    c.name AS child_name,
    c.balance,
    c.pin,
    f.parent_name AS family_name
FROM user_links ul
LEFT JOIN children c ON ul.child_id = c.id
LEFT JOIN families f ON ul.family_id = f.id
WHERE ul.family_id = '2303cb6b-3c0e-4529-9397-dabcd088dbbe'
ORDER BY ul.role, ul.name;

-- ============================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================

-- Habilitar RLS na tabela
ALTER TABLE user_links ENABLE ROW LEVEL SECURITY;

-- Política: Pais podem ver todos os membros da sua família
CREATE POLICY "Parents can view all family members"
ON user_links
FOR SELECT
USING (
    family_id IN (
        SELECT family_id
        FROM user_links
        WHERE email = auth.jwt() ->> 'email'
        AND role = 'parent'
    )
);

-- Política: Crianças podem ver apenas seu próprio registro
CREATE POLICY "Children can view their own record"
ON user_links
FOR SELECT
USING (
    email = auth.jwt() ->> 'email'
);

-- Política: Pais podem atualizar membros da família
CREATE POLICY "Parents can update family members"
ON user_links
FOR UPDATE
USING (
    family_id IN (
        SELECT family_id
        FROM user_links
        WHERE email = auth.jwt() ->> 'email'
        AND role = 'parent'
    )
);

-- Política: Pais podem inserir novos membros na família
CREATE POLICY "Parents can insert family members"
ON user_links
FOR INSERT
WITH CHECK (
    family_id IN (
        SELECT family_id
        FROM user_links
        WHERE email = auth.jwt() ->> 'email'
        AND role = 'parent'
    )
);

-- ============================================
-- FUNCTION: Buscar usuário por email
-- ============================================

CREATE OR REPLACE FUNCTION get_user_by_email(user_email VARCHAR)
RETURNS TABLE (
    id UUID,
    email VARCHAR,
    role VARCHAR,
    family_id UUID,
    child_id UUID,
    name VARCHAR,
    avatar VARCHAR,
    child_name VARCHAR,
    child_balance DECIMAL,
    child_pin VARCHAR,
    family_name VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ul.id,
        ul.email,
        ul.role,
        ul.family_id,
        ul.child_id,
        ul.name,
        ul.avatar,
        c.name AS child_name,
        c.balance AS child_balance,
        c.pin AS child_pin,
        f.parent_name AS family_name
    FROM user_links ul
    LEFT JOIN children c ON ul.child_id = c.id
    LEFT JOIN families f ON ul.family_id = f.id
    WHERE ul.email = user_email;
END;
$$;

-- ============================================
-- EXEMPLOS DE USO
-- ============================================

-- Buscar dados do Tiago
SELECT * FROM get_user_by_email('tifernandes@gmail.com');

-- Buscar dados do Rafael
SELECT * FROM get_user_by_email('rafamfernandes12@gmail.com');

-- Listar todos os pais
SELECT * FROM user_links WHERE role = 'parent';

-- Listar todas as crianças com seus dados financeiros
SELECT
    ul.email,
    ul.name,
    c.balance,
    c.total_earned,
    c.total_spent,
    c.level,
    c.xp
FROM user_links ul
INNER JOIN children c ON ul.child_id = c.id
WHERE ul.role = 'child'
ORDER BY ul.name;
