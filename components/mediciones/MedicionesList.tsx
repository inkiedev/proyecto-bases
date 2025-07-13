'use client';

import React, { useState, useEffect } from 'react';
import { Medicion, Sensor, Parcela, FilterOptions } from '@/types/database';
import { medicionesDB, sensoresDB, parcelasDB } from '@/lib/database';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { SearchFilter } from '@/components/ui/SearchFilter';
import { Badge } from '@/components/ui/Badge';
import { MedicionForm } from './MedicionForm';
import { Modal } from '@/components/ui/Modal';

export const MedicionesList: React.FC = () => {
  const [mediciones, setMediciones] = useState<Medicion[]>([]);
  const [sensores, setSensores] = useState<Sensor[]>([]);
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMedicion, setEditingMedicion] = useState<Medicion | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({});

  const filterFields = [
    {
      name: 'sensor',
      label: 'Sensor',
      type: 'select' as const,
      options: [],
      placeholder: 'Todos los sensores',
    },
    {
      name: 'parcela',
      label: 'Parcela',
      type: 'select' as const,
      options: [],
      placeholder: 'Todas las parcelas',
    },
    {
      name: 'dateFrom',
      label: 'Fecha Desde',
      type: 'date' as const,
    },
    {
      name: 'dateTo',
      label: 'Fecha Hasta',
      type: 'date' as const,
    },
  ];

  const columns = [
    {
      key: 'id_medicion',
      header: 'ID',
    },
    {
      key: 'valor',
      header: 'Valor',
      render: (value: number) => value.toFixed(2),
    },
    {
      key: 'unidad',
      header: 'Unidad',
    },
    {
      key: 'sensor_nombre',
      header: 'Sensor',
      render: (value: string) => value || 'Sin asignar',
    },
    {
      key: 'tipo_sensor',
      header: 'Tipo',
      render: (value: string) => {
        const colorMap = {
          humedad: 'info',
          temperatura: 'warning',
          luz: 'default',
        };
        return (
          <Badge variant={colorMap[value as keyof typeof colorMap] as never}>
            {value?.charAt(0).toUpperCase() + value?.slice(1)}
          </Badge>
        );
      },
    },
    {
      key: 'parcela_nombre',
      header: 'Parcela',
      render: (value: string) => value || 'Sin asignar',
    },
    {
      key: 'fecha_medicion',
      header: 'Fecha y Hora',
      render: (value: string) => {
        const date = new Date(value);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
      },
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (_: string, medicion: Medicion) => (
        <div className="flex space-x-2">
          <Button
            size="small"
            variant="secondary"
            onClick={() => handleEdit(medicion)}
          >
            Editar
          </Button>
          <Button
            size="small"
            variant="danger"
            onClick={() => handleDelete(medicion.id_medicion)}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [medicionesResult, sensoresResult, parcelasResult] = await Promise.all([
        medicionesDB.getAll(filters),
        sensoresDB.getAll(),
        parcelasDB.getAll()
      ]);

      setMediciones(medicionesResult.data || []);
      setSensores(sensoresResult.data || []);
      setParcelas(parcelasResult.data || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (medicion: Medicion) => {
    setEditingMedicion(medicion);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta medición?')) {
      try {
        await medicionesDB.delete(id);
        loadData();
      } catch (error) {
        console.error('Error al eliminar medición:', error);
        alert('Error al eliminar la medición');
      }
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingMedicion(null);
    loadData();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingMedicion(null);
  };

  const resetFilters = () => {
    setFilters({});
  };

  // Actualizar opciones en filterFields
  const updatedFilterFields = filterFields.map(field => {
    if (field.name === 'sensor') {
      return {
        ...field,
        options: sensores.map(s => ({
          value: s.id_sensor.toString(),
          label: `${s.nombre} (${s.tipo_sensor})`,
        })),
      };
    }
    if (field.name === 'parcela') {
      return {
        ...field,
        options: parcelas.map(p => ({
          value: p.id_parcela.toString(),
          label: p.nombre,
        })),
      };
    }
    return field;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Mediciones</h1>
        <Button onClick={() => setShowForm(true)}>
          Nueva Medición
        </Button>
      </div>

      <SearchFilter
        fields={updatedFilterFields}
        filters={filters as Record<string, string>}
        onFilterChange={setFilters}
        onReset={resetFilters}
      />

      <Table
        columns={columns}
        // @ts-expect-error generalizar
        data={mediciones}
        loading={loading}
        emptyMessage="No se encontraron mediciones"
      />

      <Modal
        isOpen={showForm}
        onClose={handleFormCancel}
        title={editingMedicion ? 'Editar Medición' : 'Nueva Medición'}
      >
        <MedicionForm
          medicion={editingMedicion}
          sensores={sensores}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </Modal>
    </div>
  );
};
