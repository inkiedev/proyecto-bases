'use client';

import React, { useState, useEffect } from 'react';
import { Usuario, FilterOptions } from '@/types/database';
import { usuariosDB } from '@/lib/database';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { SearchFilter } from '@/components/ui/SearchFilter';
import { Badge } from '@/components/ui/Badge';
import { UsuarioForm } from './UsuarioForm';
import { Modal } from '@/components/ui/Modal';

export const UsuariosList: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({});

  const filterFields = [
    {
      name: 'search',
      label: 'Buscar',
      type: 'text' as const,
      placeholder: 'Nombre o email...',
    },
    {
      name: 'rol',
      label: 'Rol',
      type: 'select' as const,
      options: [
        { value: 'administrador', label: 'Administrador' },
        { value: 'tecnico', label: 'Técnico' },
      ],
      placeholder: 'Todos los roles',
    },
    {
      name: 'status',
      label: 'Estado',
      type: 'select' as const,
      options: [
        { value: 'activo', label: 'Activo' },
        { value: 'inactivo', label: 'Inactivo' },
      ],
      placeholder: 'Todos los estados',
    },
  ];

  const columns = [
    {
      key: 'id_usuario',
      header: 'ID',
    },
    {
      key: 'nombre',
      header: 'Nombre',
    },
    {
      key: 'email',
      header: 'Email',
    },
    {
      key: 'rol',
      header: 'Rol',
      render: (value: string) => (
        <Badge variant={value === 'administrador' ? 'info' : 'default'}>
    {value === 'administrador' ? 'Administrador' : 'Técnico'}
  </Badge>
),
},
  {
    key: 'activo',
      header: 'Estado',
    render: (value: boolean) => (
    <Badge variant={value ? 'success' : 'danger'}>
      {value ? 'Activo' : 'Inactivo'}
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
    render: (_, usuario: Usuario) => (
    <div className="flex space-x-2">
    <Button
      size="small"
    variant="secondary"
    onClick={() => handleEdit(usuario)}
  >
    Editar
    </Button>
    <Button
    size="small"
    variant="danger"
    onClick={() => handleDelete(usuario.id_usuario)}
  >
    Eliminar
    </Button>
    </div>
  ),
  },
];

  useEffect(() => {
    loadUsuarios();
  }, [filters]);

  const loadUsuarios = async () => {
    setLoading(true);
    try {
      const { data } = await usuariosDB.getAll(filters);
      setUsuarios(data || []);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setEditingUsuario(usuario);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await usuariosDB.delete(id);
        loadUsuarios();
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        alert('Error al eliminar el usuario');
      }
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingUsuario(null);
    loadUsuarios();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingUsuario(null);
  };

  const resetFilters = () => {
    setFilters({});
  };

  return (
    <div className="space-y-6">
    <div className="flex justify-between items-center">
    <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
  <Button onClick={() => setShowForm(true)}>
  Nuevo Usuario
  </Button>
  </div>

  <SearchFilter
  fields={filterFields}
  filters={filters}
  onFilterChange={setFilters}
  onReset={resetFilters}
  />

  <Table
  columns={columns}
  data={usuarios}
  loading={loading}
  emptyMessage="No se encontraron usuarios"
  />

  <Modal
    isOpen={showForm}
  onClose={handleFormCancel}
  title={editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
  >
  <UsuarioForm
    usuario={editingUsuario}
  onSuccess={handleFormSuccess}
  onCancel={handleFormCancel}
  />
  </Modal>
  </div>
);
};
