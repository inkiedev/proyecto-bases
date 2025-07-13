'use client';

import React, { useState, useEffect } from 'react';
import { Usuario, UsuarioForm as UsuarioFormType } from '@/types/database';
import { usuariosDB } from '@/lib/database';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface UsuarioFormProps {
  usuario?: Usuario | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const UsuarioForm: React.FC<UsuarioFormProps> = ({
                                                          usuario,
                                                          onSuccess,
                                                          onCancel,
                                                        }) => {
  console.log('UsuarioForm renderizado con usuario:', usuario);

  const [formData, setFormData] = useState<UsuarioFormType>({
    nombre: '',
    email: '',
    password_hash: '',
    rol: 'tecnico',
    activo: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // CORREGIDO: Inicializar el formulario correctamente
  useEffect(() => {
    console.log('UsuarioForm useEffect ejecutado con:', usuario);

    if (usuario && usuario !== null) {
      // Editando usuario existente
      console.log('Inicializando formulario para editar usuario:', usuario.nombre);
      setFormData({
        nombre: usuario.nombre || '',
        email: usuario.email || '',
        password_hash: '',
        rol: usuario.rol || 'tecnico',
        activo: usuario.activo !== undefined ? usuario.activo : true,
      });
    } else {
      // Creando nuevo usuario
      console.log('Inicializando formulario para nuevo usuario');
      setFormData({
        nombre: '',
        email: '',
        password_hash: '',
        rol: 'tecnico',
        activo: true,
      });
    }
  }, [usuario]);

  const validateForm = (): boolean => {
    console.log('Validando formulario:', formData);
    const newErrors: Record<string, string> = {};

    if (!formData.nombre || !formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.email || !formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    // Solo requerir contraseña para usuarios nuevos
    if (!usuario && (!formData.password_hash || !formData.password_hash.trim())) {
      newErrors.password_hash = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    console.log('Errores de validación:', newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Formulario enviado:', formData);

    if (!validateForm()) {
      console.log('Formulario no válido, deteniendo envío');
      return;
    }

    setLoading(true);
    try {
      if (usuario && usuario !== null) {
        console.log('Actualizando usuario existente:', usuario.id_usuario);
        const updateData: Partial<UsuarioFormType> = {
          nombre: formData.nombre,
          email: formData.email,
          rol: formData.rol,
          activo: formData.activo,
        };

        // Solo incluir contraseña si se proporcionó una nueva
        if (formData.password_hash && formData.password_hash.trim()) {
          updateData.password_hash = formData.password_hash;
        }

        const result = await usuariosDB.update(usuario.id_usuario, updateData);
        console.log('Resultado actualización:', result);

        if (result.error) {
          console.log('Error al actualizar usuario:');
        }
      } else {
        console.log('Creando nuevo usuario');
        const result = await usuariosDB.create(formData);
        console.log('Resultado creación:', result);

        if (result.error) {
          console.log('Error al crear usuario:');
        }
      }

      console.log('Operación exitosa, llamando onSuccess');
      onSuccess();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error al guardar usuario:', error);
        alert('Error al guardar el usuario: ' + (error.message || error));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UsuarioFormType, value: string | number | boolean) => {
    console.log('Campo cambiado:', field, '=', value);
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      console.log('Nuevo formData:', newData);
      return newData;
    });

    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCancel = () => {
    console.log('Formulario cancelado');
    onCancel();
  };

  console.log('Renderizando UsuarioForm - Estado actual:', {
    formData,
    loading,
    errors,
    isEditing: !!usuario
  });

  return (
    <div className="space-y-4">
      <div className="border-b pb-2 mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          {usuario ? `Editando: ${usuario.nombre}` : 'Crear Nuevo Usuario'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre"
          value={formData.nombre}
          onChange={(e) => handleInputChange('nombre', e.target.value)}
          required
          error={errors.nombre}
          placeholder="Ingrese el nombre completo"
        />

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          required
          error={errors.email}
          placeholder="usuario@ejemplo.com"
        />

        <Input
          label={usuario ? "Nueva Contraseña (dejar vacío para mantener actual)" : "Contraseña"}
          type="password"
          value={formData.password_hash}
          onChange={(e) => handleInputChange('password_hash', e.target.value)}
          required={!usuario}
          error={errors.password_hash}
          placeholder={usuario ? "Opcional" : "Ingrese contraseña"}
        />

        <Select
          label="Rol"
          value={formData.rol}
          onChange={(e) => handleInputChange('rol', e.target.value as 'administrador' | 'tecnico')}
          options={[
            { value: 'administrador', label: 'Administrador' },
            { value: 'tecnico', label: 'Técnico' },
          ]}
          required
        />

        <Select
          label="Estado"
          value={formData.activo ? 'true' : 'false'}
          onChange={(e) => handleInputChange('activo', e.target.value === 'true')}
          options={[
            { value: 'true', label: 'Activo' },
            { value: 'false', label: 'Inactivo' },
          ]}
          required
        />

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Guardando...' : usuario ? 'Actualizar Usuario' : 'Crear Usuario'}
          </Button>
        </div>
      </form>
    </div>
  );
};
