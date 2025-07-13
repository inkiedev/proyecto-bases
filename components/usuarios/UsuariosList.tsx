// components/usuarios/UsuariosList.tsx - CORREGIDO
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
  console.log('UsuariosList componente iniciado');

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | undefined>(undefined);
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
      render: (_ : string, usuario: Usuario) => (
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
    console.log('UsuariosList - useEffect para cargar datos ejecutado');
    loadUsuarios();
  }, [filters]);

  const loadUsuarios = async () => {
    console.log('Iniciando carga de usuarios con filtros:', filters);
    setLoading(true);
    try {
      const result = await usuariosDB.getAll(filters);
      console.log('Resultado completo de usuariosDB.getAll:', result);

      if (result.error) {
        console.error('Error en la consulta:', result.error);
        alert('Error al cargar usuarios: ' + (result.error));
        setUsuarios([]);
      } else {
        console.log('Usuarios cargados exitosamente:', result.data);
        setUsuarios(result.data || []);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error al cargar usuarios:', error.message);
        alert('Error al cargar usuarios: ' + error.message);
      } else {
        console.error('Error desconocido al cargar usuarios:', error);
        alert('Error desconocido al cargar usuarios');
      }
      setUsuarios([]);
    } finally {
      setLoading(false);
      console.log('Carga de usuarios finalizada');
    }
  };

  const handleEdit = (usuario: Usuario) => {
    console.log('Iniciando edición de usuario:', usuario);
    setEditingUsuario(usuario);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    console.log('Intentando eliminar usuario con ID:', id);
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        const result = await usuariosDB.delete(id);
        if (result.error) {
          console.error('Error al eliminar usuario:', result.error);
          alert('Error al eliminar el usuario: ' + (result.error.message || result.error));
        } else {
          console.log('Usuario eliminado exitosamente');
          loadUsuarios(); // Recargar la lista
        }
      } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Excepción al eliminar usuario:', error.message);
        alert('Error al eliminar el usuario: ' + error.message);
        }
      }
    }
  };

  const handleFormSuccess = () => {
    console.log('Formulario completado exitosamente');
    setShowForm(false);
    setEditingUsuario(undefined);
    loadUsuarios(); // Recargar la lista
  };

  const handleFormCancel = () => {
    console.log('Formulario cancelado por el usuario');
    setShowForm(false);
    setEditingUsuario(undefined);
  };

  const resetFilters = () => {
    console.log('Reseteando filtros');
    setFilters({});
  };

  const handleNewUser = () => {
    console.log('Iniciando creación de nuevo usuario');
    setEditingUsuario(undefined); // IMPORTANTE: undefined, no null
    setShowForm(true);
  };

  console.log('UsuariosList renderizando con estado:', {
    usuariosCount: usuarios.length,
    loading,
    showForm,
    editingUsuario: editingUsuario ? `${editingUsuario.nombre} (${editingUsuario.id_usuario})` : 'undefined'
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <Button onClick={handleNewUser}>
          Nuevo Usuario
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
        data={usuarios}
        loading={loading}
        emptyMessage="No se encontraron usuarios"
      />

      {/* Modal con renderizado condicional mejorado */}
      <Modal
        isOpen={showForm}
        onClose={handleFormCancel}
        title={editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
      >
        {showForm && (
          <UsuarioForm
            usuario={editingUsuario}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        )}
      </Modal>
    </div>
  );
};
