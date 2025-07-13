// types/database.ts
export interface Usuario {
  id_usuario: number;
  nombre: string;
  email: string;
  password_hash: string;
  rol: 'administrador' | 'tecnico';
  fecha_creacion: string;
  activo: boolean;
}

export interface Parcela {
  id_parcela: number;
  nombre: string;
  ubicacion: string;
  area_m2: number;
  tipo_cultivo: string;
  fecha_creacion: string;
  activa: boolean;
  id_usuario_responsable: number;
  usuario_responsable?: Usuario;
}

export interface Sensor {
  id_sensor: number;
  nombre: string;
  tipo_sensor: 'humedad' | 'temperatura' | 'luz';
  ubicacion: string;
  estado: 'activo' | 'inactivo' | 'mantenimiento';
  fecha_instalacion: string;
  id_parcela: number;
  parcela?: Parcela;
}

export interface Medicion {
  id_medicion: number;
  valor: number;
  unidad: string;
  fecha_medicion: string;
  id_sensor: number;
  sensor?: Sensor;
}

export interface Alerta {
  id_alerta: number;
  tipo_alerta: string;
  mensaje: string;
  nivel_urgencia: 'bajo' | 'medio' | 'alto' | 'critico';
  fecha_generacion: string;
  fecha_resolucion?: string;
  estado: 'pendiente' | 'en_proceso' | 'resuelto';
  id_parcela: number;
  id_sensor: number;
  parcela?: Parcela;
  sensor?: Sensor;
}

export interface DatabaseResponse<T> {
  data: T[] | null;
  error: any;
}

export interface SingleDatabaseResponse<T> {
  data: T | null;
  error: any;
}

export interface UsuarioForm {
  nombre: string;
  email: string;
  password_hash: string;
  rol: 'administrador' | 'tecnico';
  activo: boolean;
}

export interface ParcelaForm {
  nombre: string;
  ubicacion: string;
  area_m2: number;
  tipo_cultivo: string;
  activa: boolean;
  id_usuario_responsable: number;
}

export interface SensorForm {
  nombre: string;
  tipo_sensor: 'humedad' | 'temperatura' | 'luz';
  ubicacion: string;
  estado: 'activo' | 'inactivo' | 'mantenimiento';
  id_parcela: number;
}

export interface MedicionForm {
  valor: number;
  unidad: string;
  id_sensor: number;
}

export interface AlertaForm {
  tipo_alerta: string;
  mensaje: string;
  nivel_urgencia: 'bajo' | 'medio' | 'alto' | 'critico';
  estado: 'pendiente' | 'en_proceso' | 'resuelto';
  id_parcela: number;
  id_sensor: number;
  fecha_resolucion?: string;
}

export interface FilterOptions {
  search?: string;
  status?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  parcela?: number;
  sensor?: number;
  rol?: string;
  nivel_urgencia?: string;
}
