'use client';

import React, { useState, useEffect } from 'react';
import { Parcela, Usuario, FilterOptions } from '@/types/database';
import { parcelasDB, usuariosDB } from '@/lib/database';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { SearchFilter } from '@/components/ui/SearchFilter';
import { Badge } from '@/components/ui/Badge';
import { ParcelaForm } from './ParcelaForm';
import { Modal } from '@/components/ui/Modal';

export const ParcelasList: React.FC = () => {
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingParcela, setEditingParcela] = useState<Parcela | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({});

  const filterFields = [
    {
      name: 'search',
      label: 'Buscar',
      type: 'text' as const,
      placeholder: 'Nombre, ubicación o cultivo...',
    },
    {
      name: 'status',
      label: 'Estado',
      type: 'select' as const,
      options: [
        { value: 'activa', label: 'Activa' },
        { value: 'inactiva', label: 'Inactiva' },
      ],
      placeholder: 'Todos los estados',
    },
  ];

  const columns = [
    {
      key: 'id_parcela',
      header: 'ID',
    },
    {
      key: 'nombre',
      header: 'Nombre',
    },
    {
      key: 'ubicacion',
      header: 'Ubicación',
    },
    {
      key: 'area_m2',
      header: 'Área (m²)',
      render: (value: number) => value.toFixed(2),
    },
    {
      key: 'tipo_cultivo',
      header: 'Tipo de Cultivo',
    },
    {
      key: 'usuario_nombre',
      header: 'Responsable',
      render: (value: string) => value || 'Sin asignar',
    },
    {
      key: 'total_sensores',
      header: 'Sensores',
      render: (value: number) => (
        <Badge variant="info">{value || 0}</Badge>
      ),
    },
    {
      key: 'activa',
      header: 'Estado',
      render: (value: boolean) => (
        <Badge variant={value ? 'success' : 'danger'}>
          {value ? 'Activa' : 'Inactiva'}
        </Badge>
      ),
    },
    {
      key: 'fecha_creacion',
      header: 'Fecha Creación',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (_:string, parcela: Parcela) => (
        <div className="flex space-x-2">
          <Button
            size="small"
            variant="secondary"
            onClick={() => handleEdit(parcela)}
          >
            Editar
          </Button>
          <Button
            size="small"
            variant="danger"
            onClick={() => handleDelete(parcela.id_parcela)}
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
      const [parcelasResult, usuariosResult] = await Promise.all([
        parcelasDB.getAll(filters),
        usuariosDB.getAll()
      ]);

      setParcelas(parcelasResult.data || []);
      setUsuarios(usuariosResult.data || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (parcela: Parcela) => {
    setEditingParcela(parcela);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta parcela?')) {
      try {
        await parcelasDB.delete(id);
        loadData();
      } catch (error) {
        console.error('Error al eliminar parcela:', error);
        alert('Error al eliminar la parcela');
      }
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingParcela(null);
    loadData();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingParcela(null);
  };

  const resetFilters = () => {
    setFilters({});
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Parcelas</h1>
        <Button onClick={() => setShowForm(true)}>
          Nueva Parcela
        </Button>
      </div>

      <SearchFilter
        fields={filterFields}
        filters={filters as Record<string, string>}
        onFilterChange={setFilters}
        onReset={resetFilters}
      />

      <Table
        columns={columns}
        // @ts-expect-error generalizar
        data={parcelas}
        loading={loading}
        emptyMessage="No se encontraron parcelas"
      />

      <Modal
        isOpen={showForm}
        onClose={handleFormCancel}
        title={editingParcela ? 'Editar Parcela' : 'Nueva Parcela'}
      >
        <ParcelaForm
          parcela={editingParcela}
          usuarios={usuarios}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </Modal>
    </div>
  );
};
