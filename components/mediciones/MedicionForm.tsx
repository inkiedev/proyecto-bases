'use client';

import React, { useState, useEffect } from 'react';
import { Medicion, Sensor, MedicionForm as MedicionFormType } from '@/types/database';
import { medicionesDB } from '@/lib/database';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface MedicionFormProps {
  medicion?: Medicion | null;
  sensores: Sensor[];
  onSuccess: () => void;
  onCancel: () => void;
}

export const MedicionForm: React.FC<MedicionFormProps> = ({
                                                            medicion,
                                                            sensores,
                                                            onSuccess,
                                                            onCancel,
                                                          }) => {
  const [formData, setFormData] = useState<MedicionFormType>({
    valor: 0,
    unidad: '',
    id_sensor: 0,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (medicion) {
      setFormData({
        valor: medicion.valor,
        unidad: medicion.unidad,
        id_sensor: medicion.id_sensor,
      });
    }
  }, [medicion]);

  // Obtener la unidad predeterminada según el tipo de sensor
  const getDefaultUnit = (tipoSensor: string): string => {
    const unitMap: Record<string, string> = {
      humedad: '%',
      temperatura: '°C',
      luz: 'lux',
    };
    return unitMap[tipoSensor] || '';
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.valor === undefined || formData.valor === null) {
      newErrors.valor = 'El valor es requerido';
    }

    if (!formData.unidad.trim()) {
      newErrors.unidad = 'La unidad es requerida';
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
      if (medicion) {
        await medicionesDB.update(medicion.id_medicion, formData);
      } else {
        await medicionesDB.create(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error al guardar medición:', error);
      alert('Error al guardar la medición');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof MedicionFormType, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSensorChange = (sensorId: number) => {
    const selectedSensor = sensores.find(s => s.id_sensor === sensorId);
    if (selectedSensor) {
      const defaultUnit = getDefaultUnit(selectedSensor.tipo_sensor);
      setFormData(prev => ({
        ...prev,
        id_sensor: sensorId,
        unidad: defaultUnit
      }));
    } else {
      handleInputChange('id_sensor', sensorId);
    }
  };

  const sensorOptions = sensores.map(s => ({
    value: s.id_sensor,
    label: `${s.nombre} (${s.tipo_sensor}) - ${s.parcela?.nombre || 'Sin parcela'}`,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Sensor"
        value={formData.id_sensor}
        onChange={(e) => handleSensorChange(parseInt(e.target.value))}
        options={sensorOptions}
        placeholder="Seleccionar sensor"
        required
        error={errors.id_sensor}
      />

      <Input
        label="Valor"
        type="number"
        step="0.01"
        value={formData.valor}
        onChange={(e) => handleInputChange('valor', parseFloat(e.target.value) || 0)}
        required
        error={errors.valor}
      />

      <Input
        label="Unidad"
        value={formData.unidad}
        onChange={(e) => handleInputChange('unidad', e.target.value)}
        required
        error={errors.unidad}
        placeholder="Ej: %, °C, lux"
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
          {loading ? 'Guardando...' : medicion ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
};
