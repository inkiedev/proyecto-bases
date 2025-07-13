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
  const [formData, setFormData] = useState<UsuarioFormType>({
    nombre: '',
    email: '',
    password_hash: '',
    rol: 'tecnico',
    activo: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (usuario) {
      setFormData({
        nombre: usuario.nombre,
        email: usuario.email,
        password_hash: '',
        rol: usuario.rol,
        activo: usuario.activo,
      });
    }
  }, [usuario]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!usuario && !formData.password_hash.trim()) {
      newErrors.password_hash = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      if (usuario) {
        // Actualizar
        const updateData: Partial<UsuarioFormType> = {
          nombre: formData.nombre,
          email: formData.email,
          rol: formData.rol,
          activo: formData.activo,
        };

        if (formData.password_hash.trim()) {
          updateData.password_hash = formData.password_hash;
        }

        await usuariosDB.update(usuario.id_usuario, updateData);
      } else {
        // Crear
        await usuariosDB.create(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      alert('Error al guardar el usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UsuarioFormType, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre"
        value={formData.nombre}
        onChange={(e) => handleInputChange('nombre', e.target.value)}
        required
        error={errors.nombre}
      />

      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => handleInputChange('email', e.target.value)}
        required
        error={errors.email}
      />

      <Input
        label={usuario ? "Nueva Contraseña (opcional)" : "Contraseña"}
        type="password"
        value={formData.password_hash}
        onChange={(e) => handleInputChange('password_hash', e.target.value)}
        required={!usuario}
        error={errors.password_hash}
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

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Guardando...' : usuario ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
};
