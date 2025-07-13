'use client';

import React, { useState, useEffect } from 'react';
import { Alerta } from '@/types/database';
import { alertasDB } from '@/lib/database';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const RecentAlerts: React.FC = () => {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentAlerts();
  }, []);

  const loadRecentAlerts = async () => {
    try {
      const { data } = await alertasDB.getAll({
        status: 'pendiente',
      });

      // Mostrar solo las 5 más recientes
      setAlertas(data?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error al cargar alertas recientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: number) => {
    try {
      await alertasDB.update(id, {
        estado: 'resuelto',
        fecha_resolucion: new Date().toISOString(),
      });
      loadRecentAlerts();
    } catch (error) {
      console.error('Error al resolver alerta:', error);
    }
  };

  if (loading) {
    return (
      <Card title="Alertas Recientes">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card title="Alertas Recientes">
      {alertas.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No hay alertas pendientes</p>
      ) : (
        <div className="space-y-4">
          {alertas.map((alerta: Alerta) => (
            <div key={alerta.id_alerta} className="border-l-4 border-red-400 pl-4 py-2">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-gray-900">{alerta.tipo_alerta}</h4>
                    <Badge variant={
                      alerta.nivel_urgencia === 'critico' ? 'danger' :
                        alerta.nivel_urgencia === 'alto' ? 'danger' :
                          alerta.nivel_urgencia === 'medio' ? 'warning' : 'default'
                    }>
                      {alerta.nivel_urgencia}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{alerta.mensaje}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Parcela: {alerta.parcela_nombre}</span>
                    <span>Sensor: {alerta.sensor_nombre}</span>
                    <span>{new Date(alerta.fecha_generacion).toLocaleString()}</span>
                  </div>
                </div>
                <Button
                  size="small"
                  onClick={() => handleResolve(alerta.id_alerta)}
                >
                  Resolver
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
