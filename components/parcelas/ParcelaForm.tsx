'use client';

import React, { useState, useEffect } from 'react';
import { Parcela, Usuario, ParcelaForm as ParcelaFormType } from '@/types/database';
import { parcelasDB } from '@/lib/database';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface ParcelaFormProps {
  parcela?: Parcela | null;
  usuarios: Usuario[];
  onSuccess: () => void;
  onCancel: () => void;
}

export const ParcelaForm: React.FC<ParcelaFormProps> = ({
                                                          parcela,
                                                          usuarios,
                                                          onSuccess,
                                                          onCancel,
                                                        }) => {
  const [formData, setFormData] = useState<ParcelaFormType>({
    nombre: '',
    ubicacion: '',
    area_m2: 0,
    tipo_cultivo: '',
    activa: true,
    id_usuario_responsable: 0,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (parcela) {
      setFormData({
        nombre: parcela.nombre,
        ubicacion: parcela.ubicacion,
        area_m2: parcela.area_m2,
        tipo_cultivo: parcela.tipo_cultivo,
        activa: parcela.activa,
        id_usuario_responsable: parcela.id_usuario_responsable,
      });
    }
  }, [parcela]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.ubicacion.trim()) {
      newErrors.ubicacion = 'La ubicación es requerida';
    }

    if (formData.area_m2 <= 0) {
      newErrors.area_m2 = 'El área debe ser mayor a 0';
    }

    if (!formData.tipo_cultivo.trim()) {
      newErrors.tipo_cultivo = 'El tipo de cultivo es requerido';
    }

    if (formData.id_usuario_responsable <= 0) {
      newErrors.id_usuario_responsable = 'Debe seleccionar un responsable';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      if (parcela) {
        await parcelasDB.update(parcela.id_parcela, formData);
      } else {
        await parcelasDB.create(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error al guardar parcela:', error);
      alert('Error al guardar la parcela');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ParcelaFormType, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const usuarioOptions = usuarios.map(u => ({
    value: u.id_usuario,
    label: `${u.nombre} (${u.rol})`,
  }));

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
        label="Ubicación"
        value={formData.ubicacion}
        onChange={(e) => handleInputChange('ubicacion', e.target.value)}
        required
        error={errors.ubicacion}
      />

      <Input
        label="Área (m²)"
        type="number"
        value={formData.area_m2}
        onChange={(e) => handleInputChange('area_m2', parseFloat(e.target.value) || 0)}
        required
        error={errors.area_m2}
      />

      <Input
        label="Tipo de Cultivo"
        value={formData.tipo_cultivo}
        onChange={(e) => handleInputChange('tipo_cultivo', e.target.value)}
        required
        error={errors.tipo_cultivo}
      />

      <Select
        label="Usuario Responsable"
        value={formData.id_usuario_responsable}
        onChange={(e) => handleInputChange('id_usuario_responsable', parseInt(e.target.value))}
        options={usuarioOptions}
        placeholder="Seleccionar responsable"
        required
        error={errors.id_usuario_responsable}
      />

      <Select
        label="Estado"
        value={formData.activa ? 'true' : 'false'}
        onChange={(e) => handleInputChange('activa', e.target.value === 'true')}
        options={[
          { value: 'true', label: 'Activa' },
          { value: 'false', label: 'Inactiva' },
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
          {loading ? 'Guardando...' : parcela ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
};
