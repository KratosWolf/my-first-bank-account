import Link from 'next/link';

const containerStyle = {
  maxWidth: '80rem',
  margin: '0 auto',
  padding: '2rem 1rem'
};

const mainStyle = {
  display: 'flex',
  flexDirection: 'column' as 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '80vh',
  textAlign: 'center' as 'center'
};

const titleStyle = {
  fontSize: '4rem',
  fontWeight: 'bold',
  color: '#1e40af',
  marginBottom: '1.5rem'
};

const subtitleStyle = {
  fontSize: '1.25rem',
  color: '#6b7280',
  maxWidth: '32rem',
  marginBottom: '2rem',
  lineHeight: '1.6'
};

const btnStyle = {
  padding: '0.75rem 2rem',
  borderRadius: '0.5rem',
  textDecoration: 'none',
  fontWeight: '600',
  display: 'inline-block',
  cursor: 'pointer',
  border: 'none',
  fontSize: '1rem'
};

const primaryBtnStyle = {
  ...btnStyle,
  background: '#3b82f6',
  color: 'white'
};

const outlineBtnStyle = {
  ...btnStyle,
  background: 'white',
  color: '#374151',
  border: '2px solid #d1d5db'
};

const buttonsStyle = {
  display: 'flex',
  gap: '1rem',
  flexDirection: 'column' as 'column',
  alignItems: 'center'
};

const gridStyle = {
  marginTop: '3rem',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '1.5rem',
  maxWidth: '64rem'
};

const cardStyle = {
  textAlign: 'center' as 'center',
  padding: '2rem',
  borderRadius: '0.5rem',
  border: '2px solid #e5e7eb',
  background: 'white',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
};

const cardEmojiStyle = {
  fontSize: '3rem',
  marginBottom: '1rem'
};

const cardTitleStyle = {
  fontWeight: '600',
  marginBottom: '0.5rem',
  fontSize: '1.25rem',
  color: '#374151'
};

const cardTextStyle = {
  fontSize: '0.875rem',
  color: '#6b7280',
  lineHeight: '1.5'
};

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
      padding: '1rem'
    }}>
      <div style={containerStyle}>
        <main style={mainStyle}>
          <div style={{marginBottom: '2rem'}}>
            <h1 style={{fontSize: '4rem', marginBottom: '1rem'}}>🏦</h1>
            <h1 style={titleStyle}>
              My First Bank Account
            </h1>
            <p style={subtitleStyle}>
              Aprenda a poupar, criar metas e gerenciar dinheiro de forma divertida!
            </p>
          </div>
          
          <div style={buttonsStyle}>
            <Link href="/auth/signin" style={primaryBtnStyle}>
              🔐 Entrar no Sistema
            </Link>
            <Link href="/api/health" style={outlineBtnStyle}>
              📊 Status da API
            </Link>
          </div>

          <div style={gridStyle}>
            <div style={cardStyle}>
              <div style={cardEmojiStyle}>👶</div>
              <h3 style={cardTitleStyle}>Para as Crianças</h3>
              <p style={cardTextStyle}>
                Interface amigável com gamificação, metas e controle de gastos
              </p>
            </div>
            
            <div style={cardStyle}>
              <div style={cardEmojiStyle}>👨‍👩‍👧‍👦</div>
              <h3 style={cardTitleStyle}>Para os Pais</h3>
              <p style={cardTextStyle}>
                Controle total, aprovação de pedidos e relatórios educativos
              </p>
            </div>
            
            <div style={cardStyle}>
              <div style={cardEmojiStyle}>🏆</div>
              <h3 style={cardTitleStyle}>Gamificação</h3>
              <p style={cardTextStyle}>
                Níveis, badges e recompensas para incentivar bons hábitos
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}