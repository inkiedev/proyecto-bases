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
      console.log('Cargando sensores para dashboard...');
      const { data, error } = await sensoresDB.getAll();

      if (error) {
        console.error('Error al cargar sensores:', error);
      } else {
        console.log('Sensores cargados:', data);
        setSensores(data || []);
      }
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

  // CORREGIDO: Agrupar sensores por tipo con conteo correcto
  const sensoresPorTipo = sensores.reduce((acc, sensor) => {
    console.log('Procesando sensor:', sensor);

    const tipo = sensor.tipo_sensor;
    const estado = sensor.estado;

    if (!acc[tipo]) {
      acc[tipo] = {
        total: 0,
        activo: 0,
        inactivo: 0,
        mantenimiento: 0
      };
    }

    // Incrementar total
    acc[tipo].total++;

    // Incrementar contador específico del estado
    if (estado === 'activo') {
      acc[tipo].activo++;
    } else if (estado === 'inactivo') {
      acc[tipo].inactivo++;
    } else if (estado === 'mantenimiento') {
      acc[tipo].mantenimiento++;
    }

    console.log(`Sensor ${sensor.nombre} (${tipo}) - Estado: ${estado}`);
    console.log('Conteo actualizado para', tipo, ':', acc[tipo]);

    return acc;
  }, {} as Record<string, { total: number; activo: number; inactivo: number; mantenimiento: number }>);

  console.log('Agrupación final de sensores:', sensoresPorTipo);

  return (
    <Card title="Estado de Sensores por Tipo">
      <div className="space-y-4">
        {Object.keys(sensoresPorTipo).length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay sensores registrados</p>
        ) : (
          Object.entries(sensoresPorTipo).map(([tipo, stats]) => (
            <div key={tipo} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium capitalize">{tipo}</h4>
                <Badge variant="info">{stats.total} total</Badge>
              </div>
              <div className="flex space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Activos: {stats.activo}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Inactivos: {stats.inactivo}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Mantenimiento: {stats.mantenimiento}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
