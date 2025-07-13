'use client';

import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { RecentAlerts } from '@/components/dashboard/RecentAlerts';
import { SensorStatus } from '@/components/dashboard/SensorStatus';

export default function Dashboard() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Resumen general del sistema de gestión de huertas urbanas
          </p>
        </div>

        <DashboardStats />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentAlerts />
          <SensorStatus />
        </div>
      </div>
    </Layout>
  );
}
