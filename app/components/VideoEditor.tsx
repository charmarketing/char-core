'use client'
import { useState, useRef, useCallback } from 'react'

// ── TIPOS ──────────────────────────────────────────────────────────────────
interface Clip {
  numero: number
  titulo: string
  gancho: string
  timestamp_inicio: string
  timestamp_fin: string
  duracion_seg: number
  por_que_viral: string
  red_recomendada: string
  copy_caption: string
  subtitulos: string[]
  score_viral: number
}
interface Cliente { id: string; nombre: string }
interface Props {
  theme?: 'dark' | 'light'
  clientes?: Cliente[]
  onUpload?: (file: File) => Promise<{ url: string }>
}
