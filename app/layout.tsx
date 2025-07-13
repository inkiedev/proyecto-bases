import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Huertas Urbanas - Sistema de Gestión IoT',
  description: 'Sistema de gestión para huertas urbanas con sensores IoT',
}

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
    <body>{children}</body>
    </html>
  )
}
