'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { usuariosDB, parcelasDB, sensoresDB, alertasDB } from '@/lib/database';

interface DashboardData {
  totalUsuarios: number;
  totalParcelas: number;
  totalSensores: number;
  sensoresActivos: number;
  totalAlertas: number;
  alertasPendientes: number;
  alertasCriticas: number;
}

export const DashboardStats: React.FC = () => {
  const [data, setData] = useState<DashboardData>({
    totalUsuarios: 0,
    totalParcelas: 0,
    totalSensores: 0,
    sensoresActivos: 0,
    totalAlertas: 0,
    alertasPendientes: 0,
    alertasCriticas: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [usuarios, parcelas, sensores, alertas] = await Promise.all([
        usuariosDB.getAll(),
        parcelasDB.getAll(),
        sensoresDB.getAll(),
        alertasDB.getAll(),
      ]);

      const alertasPendientes = alertas.data?.filter(a => a.estado === 'pendiente') || [];
      const alertasCriticas = alertas.data?.filter(a => a.nivel_urgencia === 'critico') || [];
      const sensoresActivos = sensores.data?.filter(s => s.estado === 'activo') || [];

      setData({
        totalUsuarios: usuarios.data?.length || 0,
        totalParcelas: parcelas.data?.length || 0,
        totalSensores: sensores.data?.length || 0,
        sensoresActivos: sensoresActivos.length,
        totalAlertas: alertas.data?.length || 0,
        alertasPendientes: alertasPendientes.length,
        alertasCriticas: alertasCriticas.length,
      });
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(7)].map((_, i) => (
      <Card key={i} className="animate-pulse">
    <div className="h-16 bg-gray-200 rounded"></div>
      </Card>
  ))}
    </div>
  );
  }

  const stats = [
    {
      title: 'Total Usuarios',
      value: data.totalUsuarios,
      icon: '👥',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Parcelas',
      value: data.totalParcelas,
      icon: '🌱',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Sensores',
      value: data.totalSensores,
      icon: '📡',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Sensores Activos',
      value: data.sensoresActivos,
      icon: '✅',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Alertas',
      value: data.totalAlertas,
      icon: '⚠️',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Alertas Pendientes',
      value: data.alertasPendientes,
      icon: '⏳',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Alertas Críticas',
      value: data.alertasCriticas,
      icon: '🚨',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{stat.title}</p>
          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
      </div>
      <div className={`p-3 rounded-full ${stat.bgColor}`}>
  <span className="text-2xl">{stat.icon}</span>
    </div>
    </div>
    </Card>
))}
  </div>
);
};
