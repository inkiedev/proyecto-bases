'use client';

import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { ParcelasList } from '@/components/parcelas/ParcelasList';

export default function ParcelasPage() {
  return (
    <Layout>
      <ParcelasList />
    </Layout>
  );
}
