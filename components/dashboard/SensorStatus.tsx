'use client';

import React, { useState, useEffect } from 'react';
import { Sensor } from '@/types/database';
import { sensoresDB } from '@/lib/database';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const SensorStatus: React.FC = () => {
  const [sensores, setSensores] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSensors();
  }, []);

  const loadSensors = async () => {
    try {
      const { data } = await sensoresDB.getAll();
      setSensores(data || []);
    } catch (error) {
      console.error('Error al cargar sensores:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card title="Estado de Sensores">
        <div className="animate-pulse space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  const sensoresPorTipo = sensores.reduce((acc, sensor) => {
    if (!acc[sensor.tipo_sensor]) {
      acc[sensor.tipo_sensor] = { total: 0, activos: 0, inactivos: 0, mantenimiento: 0 };
    }
    acc[sensor.tipo_sensor].total++;
    acc[sensor.tipo_sensor][sensor.estado]++;
    return acc;
  }, {} as Record<string, any>);

  return (
    <Card title="Estado de Sensores por Tipo">
      <div className="space-y-4">
        {Object.entries(sensoresPorTipo).map(([tipo, stats]) => (
          <div key={tipo} className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium capitalize">{tipo}</h4>
              <Badge variant="info">{stats.total} total</Badge>
            </div>
            <div className="flex space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Activos: {stats.activos || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Inactivos: {stats.inactivos || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Mantenimiento: {stats.mantenimiento || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
