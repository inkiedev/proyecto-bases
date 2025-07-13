'use client';

import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { MedicionesList } from '@/components/mediciones/MedicionesList';

export default function MedicionesPage() {
  return (
    <Layout>
      <MedicionesList />
    </Layout>
  );
}
