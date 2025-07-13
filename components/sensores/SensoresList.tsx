'use client';

import React, { useState, useEffect } from 'react';
import { Sensor, Parcela, FilterOptions } from '@/types/database';
import { sensoresDB, parcelasDB } from '@/lib/database';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { SearchFilter } from '@/components/ui/SearchFilter';
import { Badge } from '@/components/ui/Badge';
import { SensorForm } from './SensorForm';
import { Modal } from '@/components/ui/Modal';

export const SensoresList: React.FC = () => {
  const [sensores, setSensores] = useState<Sensor[]>([]);
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSensor, setEditingSensor] = useState<Sensor | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({});

  const filterFields = [
    {
      name: 'search',
      label: 'Buscar',
      type: 'text' as const,
      placeholder: 'Nombre o ubicación...',
    },
    {
      name: 'type',
      label: 'Tipo',
      type: 'select' as const,
      options: [
        { value: 'humedad', label: 'Humedad' },
        { value: 'temperatura', label: 'Temperatura' },
        { value: 'luz', label: 'Luz' },
      ],
      placeholder: 'Todos los tipos',
    },
    {
      name: 'status',
      label: 'Estado',
      type: 'select' as const,
      options: [
        { value: 'activo', label: 'Activo' },
        { value: 'inactivo', label: 'Inactivo' },
        { value: 'mantenimiento', label: 'Mantenimiento' },
      ],
      placeholder: 'Todos los estados',
    },
    {
      name: 'parcela',
      label: 'Parcela',
      type: 'select' as const,
      options: [],
      placeholder: 'Todas las parcelas',
    },
  ];

  const columns = [
    {
      key: 'id_sensor',
      header: 'ID',
    },
    {
      key: 'nombre',
      header: 'Nombre',
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
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Badge>
        );
      },
    },
    {
      key: 'ubicacion',
      header: 'Ubicación',
    },
    {
      key: 'parcela_nombre',
      header: 'Parcela',
      render: (value: string) => value || 'Sin asignar',
    },
    {
      key: 'total_mediciones',
      header: 'Mediciones',
      render: (value: number) => (
        <Badge variant="info">{value || 0}</Badge>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (value: string) => {
        const colorMap = {
          activo: 'success',
          inactivo: 'danger',
          mantenimiento: 'warning',
        };
        return (
          <Badge variant={colorMap[value as keyof typeof colorMap] as never}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Badge>
        );
      },
    },
    {
      key: 'fecha_instalacion',
      header: 'Fecha Instalación',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (_: string, sensor: Sensor) => (
        <div className="flex space-x-2">
          <Button
            size="small"
            variant="secondary"
            onClick={() => handleEdit(sensor)}
          >
            Editar
          </Button>
          <Button
            size="small"
            variant="danger"
            onClick={() => handleDelete(sensor.id_sensor)}
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
      const [sensoresResult, parcelasResult] = await Promise.all([
        sensoresDB.getAll(filters),
        parcelasDB.getAll()
      ]);

      setSensores(sensoresResult.data || []);
      setParcelas(parcelasResult.data || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (sensor: Sensor) => {
    setEditingSensor(sensor);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este sensor?')) {
      try {
        await sensoresDB.delete(id);
        loadData();
      } catch (error) {
        console.error('Error al eliminar sensor:', error);
        alert('Error al eliminar el sensor');
      }
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingSensor(null);
    loadData();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingSensor(null);
  };

  const resetFilters = () => {
    setFilters({});
  };

  // Actualizar opciones de parcelas en filterFields
  const updatedFilterFields = filterFields.map(field => {
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
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Sensores</h1>
        <Button onClick={() => setShowForm(true)}>
          Nuevo Sensor
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
        data={sensores}
        loading={loading}
        emptyMessage="No se encontraron sensores"
      />

      <Modal
        isOpen={showForm}
        onClose={handleFormCancel}
        title={editingSensor ? 'Editar Sensor' : 'Nuevo Sensor'}
      >
        <SensorForm
          sensor={editingSensor}
          parcelas={parcelas}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </Modal>
    </div>
  );
};
