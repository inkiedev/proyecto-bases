'use client';

import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { AlertasList } from '@/components/alertas/AlertasList';

export default function AlertasPage() {
  return (
    <Layout>
      <AlertasList />
    </Layout>
  );
}
