import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CHAR CORE',
  description: 'Sistema Operativo para Agencias de Marketing',
  icons: {
    icon: '/fonts/logo-char.png',
    apple: '/fonts/logo-char.png',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}
