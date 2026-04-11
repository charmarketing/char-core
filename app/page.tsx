export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          ⚡ CHAR CORE
        </h1>
        <p style={{ color: '#888', fontSize: '1.2rem' }}>
          Sistema Operativo de la Agencia — En construcción
        </p>
      </div>
    </main>
  )
}
