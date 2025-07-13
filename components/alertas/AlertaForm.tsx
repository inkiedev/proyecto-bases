'use client';

import React, { useState, useEffect } from 'react';
import { Alerta, Parcela, Sensor, AlertaForm as AlertaFormType } from '@/types/database';
import { alertasDB } from '@/lib/database';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface AlertaFormProps {
  alerta?: Alerta | null;
  parcelas: Parcela[];
  sensores: Sensor[];
  onSuccess: () => void;
  onCancel: () => void;
}

export const AlertaForm: React.FC<AlertaFormProps> = ({
                                                        alerta,
                                                        parcelas,
                                                        sensores,
                                                        onSuccess,
                                                        onCancel,
                                                      }) => {
  const [formData, setFormData] = useState<AlertaFormType>({
    tipo_alerta: '',
    mensaje: '',
    nivel_urgencia: 'medio',
    estado: 'pendiente',
    id_parcela: 0,
    id_sensor: 0,
  });
  const [filteredSensores, setFilteredSensores] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (alerta) {
      setFormData({
        tipo_alerta: alerta.tipo_alerta,
        mensaje: alerta.mensaje,
        nivel_urgencia: alerta.nivel_urgencia,
        estado: alerta.estado,
        id_parcela: alerta.id_parcela,
        id_sensor: alerta.id_sensor,
        fecha_resolucion: alerta.fecha_resolucion,
      });
    }
  }, [alerta]);

  useEffect(() => {
    // Filtrar sensores por parcela seleccionada
    if (formData.id_parcela) {
      const filtered = sensores.filter(s => s.id_parcela === formData.id_parcela);
      setFilteredSensores(filtered);

      // Si el sensor actual no pertenece a la parcela seleccionada, resetear
      if (formData.id_sensor && !filtered.find(s => s.id_sensor === formData.id_sensor)) {
        setFormData(prev => ({ ...prev, id_sensor: 0 }));
      }
    } else {
      setFilteredSensores(sensores);
    }
  }, [formData.id_parcela, sensores]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.tipo_alerta.trim()) {
      newErrors.tipo_alerta = 'El tipo de alerta es requerido';
    }

    if (!formData.mensaje.trim()) {
      newErrors.mensaje = 'El mensaje es requerido';
    }

    if (formData.id_parcela <= 0) {
      newErrors.id_parcela = 'Debe seleccionar una parcela';
    }

    if (formData.id_sensor <= 0) {
      newErrors.id_sensor = 'Debe seleccionar un sensor';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      if (alerta) {
        await alertasDB.update(alerta.id_alerta, formData);
      } else {
        await alertasDB.create(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error al guardar alerta:', error);
      alert('Error al guardar la alerta');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof AlertaFormType, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const parcelaOptions = parcelas.map(p => ({
    value: p.id_parcela,
    label: `${p.nombre} - ${p.ubicacion}`,
  }));

  const sensorOptions = filteredSensores.map(s => ({
    value: s.id_sensor,
    label: `${s.nombre} (${s.tipo_sensor})`,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Tipo de Alerta"
        value={formData.tipo_alerta}
        onChange={(e) => handleInputChange('tipo_alerta', e.target.value)}
        required
        error={errors.tipo_alerta}
        placeholder="Ej: Baja Humedad, Alta Temperatura"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mensaje <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.mensaje}
          onChange={(e) => handleInputChange('mensaje', e.target.value)}
          required
          rows={3}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.mensaje ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Descripción detallada de la alerta..."
        />
        {errors.mensaje && <p className="mt-1 text-sm text-red-600">{errors.mensaje}</p>}
      </div>

      <Select
        label="Nivel de Urgencia"
        value={formData.nivel_urgencia}
        onChange={(e) => handleInputChange('nivel_urgencia', e.target.value as 'bajo' | 'medio' | 'alto' | 'critico')}
        options={[
          { value: 'bajo', label: 'Bajo' },
          { value: 'medio', label: 'Medio' },
          { value: 'alto', label: 'Alto' },
          { value: 'critico', label: 'Crítico' },
        ]}
        required
      />

      <Select
        label="Estado"
        value={formData.estado}
        onChange={(e) => handleInputChange('estado', e.target.value as 'pendiente' | 'en_proceso' | 'resuelto')}
        options={[
          { value: 'pendiente', label: 'Pendiente' },
          { value: 'en_proceso', label: 'En Proceso' },
          { value: 'resuelto', label: 'Resuelto' },
        ]}
        required
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
        label="Sensor"
        value={formData.id_sensor}
        onChange={(e) => handleInputChange('id_sensor', parseInt(e.target.value))}
        options={sensorOptions}
        placeholder="Seleccionar sensor"
        required
        error={errors.id_sensor}
        disabled={!formData.id_parcela}
      />

      {formData.estado === 'resuelto' && (
        <Input
          label="Fecha de Resolución"
          type="datetime-local"
          value={formData.fecha_resolucion ? new Date(formData.fecha_resolucion).toISOString().slice(0, 16) : ''}
          onChange={(e) => handleInputChange('fecha_resolucion', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
        />
      )}

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
          {loading ? 'Guardando...' : alerta ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
};
