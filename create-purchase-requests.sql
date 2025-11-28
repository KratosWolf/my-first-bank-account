-- Tabela de pedidos de compra das crianças
CREATE TABLE IF NOT EXISTS public.purchase_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_by UUID REFERENCES public.families(id),
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_purchase_requests_family_id ON public.purchase_requests(family_id);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_child_id ON public.purchase_requests(child_id);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_status ON public.purchase_requests(status);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_created_at ON public.purchase_requests(created_at DESC);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_purchase_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_purchase_requests_updated_at_trigger
  BEFORE UPDATE ON public.purchase_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_purchase_requests_updated_at();

-- Row Level Security (RLS)
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Famílias podem ver seus próprios pedidos
CREATE POLICY "Families can view own purchase requests"
  ON public.purchase_requests
  FOR SELECT
  USING (family_id = auth.uid());

-- Policy: Famílias podem inserir pedidos
CREATE POLICY "Families can insert purchase requests"
  ON public.purchase_requests
  FOR INSERT
  WITH CHECK (family_id = auth.uid());

-- Policy: Famílias podem atualizar seus próprios pedidos
CREATE POLICY "Families can update own purchase requests"
  ON public.purchase_requests
  FOR UPDATE
  USING (family_id = auth.uid());

-- Policy: Famílias podem deletar seus próprios pedidos
CREATE POLICY "Families can delete own purchase requests"
  ON public.purchase_requests
  FOR DELETE
  USING (family_id = auth.uid());

-- Comentários na tabela
COMMENT ON TABLE public.purchase_requests IS 'Pedidos de compra feitos pelas crianças que aguardam aprovação dos pais';
COMMENT ON COLUMN public.purchase_requests.status IS 'Status do pedido: pending, approved, rejected';
COMMENT ON COLUMN public.purchase_requests.category IS 'Categoria do pedido: Jogos, Brinquedos, Roupas, Eletrônicos, Livros, Outros';
