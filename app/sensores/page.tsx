'use client';

import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { SensoresList } from '@/components/sensores/SensoresList';

export default function SensoresPage() {
  return (
    <Layout>
      <SensoresList />
    </Layout>
  );
}
