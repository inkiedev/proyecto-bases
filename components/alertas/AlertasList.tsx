'use client';

import React, { useState, useEffect } from 'react';
import { Alerta, Parcela, Sensor, FilterOptions } from '@/types/database';
import { alertasDB, parcelasDB, sensoresDB } from '@/lib/database';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { SearchFilter } from '@/components/ui/SearchFilter';
import { Badge } from '@/components/ui/Badge';
import { AlertaForm } from './AlertaForm';
import { Modal } from '@/components/ui/Modal';

export const AlertasList: React.FC = () => {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [sensores, setSensores] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAlerta, setEditingAlerta] = useState<Alerta | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({});

  const filterFields = [
    {
      name: 'search',
      label: 'Buscar',
      type: 'text' as const,
      placeholder: 'Tipo de alerta o mensaje...',
    },
    {
      name: 'status',
      label: 'Estado',
      type: 'select' as const,
      options: [
        { value: 'pendiente', label: 'Pendiente' },
        { value: 'en_proceso', label: 'En Proceso' },
        { value: 'resuelto', label: 'Resuelto' },
      ],
      placeholder: 'Todos los estados',
    },
    {
      name: 'nivel_urgencia',
      label: 'Nivel de Urgencia',
      type: 'select' as const,
      options: [
        { value: 'bajo', label: 'Bajo' },
        { value: 'medio', label: 'Medio' },
        { value: 'alto', label: 'Alto' },
        { value: 'critico', label: 'Crítico' },
      ],
      placeholder: 'Todos los niveles',
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
      key: 'id_alerta',
      header: 'ID',
    },
    {
      key: 'tipo_alerta',
      header: 'Tipo',
    },
    {
      key: 'mensaje',
      header: 'Mensaje',
      render: (value: string) => (
        <div className="max-w-xs truncate" title={value}>
      {value}
      </div>
),
},
  {
    key: 'nivel_urgencia',
      header: 'Urgencia',
    render: (value: string) => {
    const colorMap = {
      bajo: 'default',
      medio: 'warning',
      alto: 'danger',
      critico: 'danger',
    };
    return (
      <Badge variant={colorMap[value as keyof typeof colorMap] as never}>
        {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
    );
  },
  },
  {
    key: 'estado',
      header: 'Estado',
    render: (value: string) => {
    const colorMap = {
      pendiente: 'warning',
      en_proceso: 'info',
      resuelto: 'success',
    };
    const labelMap = {
      pendiente: 'Pendiente',
      en_proceso: 'En Proceso',
      resuelto: 'Resuelto',
    };
    return (
      <Badge variant={colorMap[value as keyof typeof colorMap] as never}>
        {labelMap[value as keyof typeof labelMap]}
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
    key: 'sensor_nombre',
      header: 'Sensor',
    render: (value: string) => value || 'Sin asignar',
  },
  {
    key: 'fecha_generacion',
      header: 'Fecha Generación',
    render: (value: string) => {
    const date = new Date(value);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  },
  },
  {
    key: 'fecha_resolucion',
      header: 'Fecha Resolución',
    render: (value: string) => {
    if (!value) return '-';
    const date = new Date(value);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  },
  },
  {
    key: 'acciones',
      header: 'Acciones',
    render: (_: string, alerta: Alerta) => (
    <div className="flex space-x-2">
      {alerta.estado !== 'resuelto' && (
          <Button
            size="small"
        variant="info"
        onClick={() => handleResolve(alerta.id_alerta)}
  >
    Resolver
    </Button>
  )}
    <Button
      size="small"
    variant="secondary"
    onClick={() => handleEdit(alerta)}
  >
    Editar
    </Button>
    <Button
    size="small"
    variant="danger"
    onClick={() => handleDelete(alerta.id_alerta)}
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
      const [alertasResult, parcelasResult, sensoresResult] = await Promise.all([
        alertasDB.getAll(filters),
        parcelasDB.getAll(),
        sensoresDB.getAll()
      ]);

      setAlertas(alertasResult.data || []);
      setParcelas(parcelasResult.data || []);
      setSensores(sensoresResult.data || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (alerta: Alerta) => {
    setEditingAlerta(alerta);
    setShowForm(true);
  };

  const handleResolve = async (id: number) => {
    try {
      await alertasDB.update(id, {
        estado: 'resuelto',
        fecha_resolucion: new Date().toISOString(),
      });
      loadData();
    } catch (error) {
      console.error('Error al resolver alerta:', error);
      alert('Error al resolver la alerta');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta alerta?')) {
      try {
        await alertasDB.delete(id);
        loadData();
      } catch (error) {
        console.error('Error al eliminar alerta:', error);
        alert('Error al eliminar la alerta');
      }
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingAlerta(null);
    loadData();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAlerta(null);
  };

  const resetFilters = () => {
    setFilters({});
  };

  // Actualizar opciones en filterFields
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
    <h1 className="text-2xl font-bold text-gray-900">Gestión de Alertas</h1>
  <Button onClick={() => setShowForm(true)}>
  Nueva Alerta
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
  data={alertas}
  loading={loading}
  emptyMessage="No se encontraron alertas"
  />

  <Modal
    isOpen={showForm}
  onClose={handleFormCancel}
  title={editingAlerta ? 'Editar Alerta' : 'Nueva Alerta'}
  size="large"
  >
  <AlertaForm
    alerta={editingAlerta}
  parcelas={parcelas}
  sensores={sensores}
  onSuccess={handleFormSuccess}
  onCancel={handleFormCancel}
  />
  </Modal>
  </div>
);
};
