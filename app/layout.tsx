import './globals.css'
import { Inter } from 'next/font/google'
// 1. Importamos el Provider que acabamos de crear
import { GlobalProvider } from './context/GlobalContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'CHAR CORE | Sistema Operativo',
  description: 'Sistema de gestión interna y automatización para Agencia CHAR',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        {/* Aquí puedes agregar las Google Fonts (Rajdhani) si no están en globals.css */}
        <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        {/* 2. Envolvemos a los hijos con el Provider */}
        <GlobalProvider>
          <div className="char-app-container">
            {children}
          </div>
        </GlobalProvider>
      </body>
    </html>
  )
}
