'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'

// Definimos qué datos queremos compartir con toda la aplicación
type Theme = 'dark' | 'light'
type Usuario = 'Gabriel' | 'Adri' | null

interface GlobalContextProps {
  tema: Theme;
  setTema: (tema: Theme) => void;
  usuarioActivo: Usuario;
  setUsuarioActivo: (usuario: Usuario) => void;
  clienteGlobal: string;
  setClienteGlobal: (cliente: string) => void;
}

// Creamos el contexto
const GlobalContext = createContext<GlobalContextProps | undefined>(undefined)

// Este Provider envolverá a toda tu app
export function GlobalProvider({ children }: { children: React.ReactNode }) {
  // Inicializamos los estados
  const [tema, setTema] = useState<Theme>('dark')
  const [usuarioActivo, setUsuarioActivo] = useState<Usuario>(null)
  const [clienteGlobal, setClienteGlobal] = useState<string>('CHAR')

  // Opcional: Persistir el cliente y tema en localStorage para que no se pierda al recargar la página
  useEffect(() => {
    const savedTheme = localStorage.getItem('char_theme') as Theme
    const savedClient = localStorage.getItem('char_client')
    const savedUser = localStorage.getItem('char_user') as Usuario

    if (savedTheme) setTema(savedTheme)
    if (savedClient) setClienteGlobal(savedClient)
    if (savedUser) setUsuarioActivo(savedUser)
  }, [])

  // Guardar en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem('char_theme', tema)
  }, [tema])
  
  useEffect(() => {
    localStorage.setItem('char_client', clienteGlobal)
  }, [clienteGlobal])

  useEffect(() => {
    if(usuarioActivo) localStorage.setItem('char_user', usuarioActivo)
  }, [usuarioActivo])

  return (
    <GlobalContext.Provider 
      value={{ tema, setTema, usuarioActivo, setUsuarioActivo, clienteGlobal, setClienteGlobal }}
    >
      {children}
    </GlobalContext.Provider>
  )
}

// Hook personalizado para usar en cualquier componente
export function useGlobal() {
  const context = useContext(GlobalContext)
  if (!context) {
    throw new Error('useGlobal debe usarse dentro de un GlobalProvider')
  }
  return context
}
