'use client';

import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { UsuariosList } from '@/components/usuarios/UsuariosList';

export default function UsuariosPage() {
  return (
    <Layout>
      <UsuariosList />
    </Layout>
  );
}
