'use client';

import React, { useState, useEffect } from 'react';
import { Sensor, Parcela, SensorForm as SensorFormType } from '@/types/database';
import { sensoresDB } from '@/lib/database';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface SensorFormProps {
  sensor?: Sensor | null;
  parcelas: Parcela[];
  onSuccess: () => void;
  onCancel: () => void;
}

export const SensorForm: React.FC<SensorFormProps> = ({
                                                        sensor,
                                                        parcelas,
                                                        onSuccess,
                                                        onCancel,
                                                      }) => {
  const [formData, setFormData] = useState<SensorFormType>({
    nombre: '',
    tipo_sensor: 'humedad',
    ubicacion: '',
    estado: 'activo',
    id_parcela: 0,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (sensor) {
      setFormData({
        nombre: sensor.nombre,
        tipo_sensor: sensor.tipo_sensor,
        ubicacion: sensor.ubicacion,
        estado: sensor.estado,
        id_parcela: sensor.id_parcela,
      });
    }
  }, [sensor]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.ubicacion.trim()) {
      newErrors.ubicacion = 'La ubicación es requerida';
    }

    if (formData.id_parcela <= 0) {
      newErrors.id_parcela = 'Debe seleccionar una parcela';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      if (sensor) {
        await sensoresDB.update(sensor.id_sensor, formData);
      } else {
        await sensoresDB.create(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error al guardar sensor:', error);
      alert('Error al guardar el sensor');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof SensorFormType, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const parcelaOptions = parcelas.map(p => ({
    value: p.id_parcela,
    label: `${p.nombre} - ${p.ubicacion}`,
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

      <Select
        label="Tipo de Sensor"
        value={formData.tipo_sensor}
        onChange={(e) => handleInputChange('tipo_sensor', e.target.value as 'humedad' | 'temperatura' | 'luz')}
        options={[
          { value: 'humedad', label: 'Humedad' },
          { value: 'temperatura', label: 'Temperatura' },
          { value: 'luz', label: 'Luz' },
        ]}
        required
      />

      <Input
        label="Ubicación"
        value={formData.ubicacion}
        onChange={(e) => handleInputChange('ubicacion', e.target.value)}
        required
        error={errors.ubicacion}
      />

      <Select
        label="Parcela"
        value={formData.id_parcela}
        onChange={(e) => handleInputChange('id_parcela', parseInt(e.target.value))}
        options={parcelaOptions}
        placeholder="Seleccionar parcela"
        required
        error={errors.id_parcela}
      />

      <Select
        label="Estado"
        value={formData.estado}
        onChange={(e) => handleInputChange('estado', e.target.value as 'activo' | 'inactivo' | 'mantenimiento')}
        options={[
          { value: 'activo', label: 'Activo' },
          { value: 'inactivo', label: 'Inactivo' },
          { value: 'mantenimiento', label: 'Mantenimiento' },
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
          {loading ? 'Guardando...' : sensor ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
};
