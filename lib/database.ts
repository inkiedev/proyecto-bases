import { supabase } from './supabase';
import {
  Usuario,
  Parcela,
  Sensor,
  Medicion,
  Alerta,
  DatabaseResponse,
  SingleDatabaseResponse,
  UsuarioForm,
  ParcelaForm,
  SensorForm,
  MedicionForm,
  AlertaForm,
  FilterOptions
} from '@/types/database';
import {PostgrestError} from "@supabase/supabase-js";

// CRUD para Usuarios - CORREGIDO
export const usuariosDB = {
  async getAll(filters?: FilterOptions): Promise<DatabaseResponse<Usuario>> {
    try {
      console.log('Ejecutando consulta SQL cruda para usuarios...');

      let sqlQuery = `
        SELECT u.id_usuario, u.nombre, u.email, u.rol, u.fecha_creacion, u.activo,
               COUNT(p.id_parcela) as total_parcelas
        FROM usuarios u
        LEFT JOIN parcelas p ON u.id_usuario = p.id_usuario_responsable
      `;

      const conditions = [];

      if (filters?.search) {
        conditions.push(`(u.nombre ILIKE '%${filters.search}%' OR u.email ILIKE '%${filters.search}%')`);
      }

      if (filters?.rol) {
        conditions.push(`u.rol = '${filters.rol}'`);
      }

      if (filters?.status) {
        conditions.push(`u.activo = ${filters.status === 'activo' ? 'true' : 'false'}`);
      }

      if (conditions.length > 0) {
        sqlQuery += ` WHERE ` + conditions.join(' AND ');
      }

      sqlQuery += ` GROUP BY u.id_usuario, u.nombre, u.email, u.rol, u.fecha_creacion, u.activo
                    ORDER BY u.fecha_creacion DESC`;

      console.log('SQL Query:', sqlQuery);

      // Usar cliente Supabase estándar
      let query = supabase
        .from('usuarios')
        .select(`
          id_usuario,
          nombre,
          email,
          password_hash,
          rol,
          fecha_creacion,
          activo
        `);

      if (filters?.search) {
        query = query.or(`nombre.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      if (filters?.rol) {
        query = query.eq('rol', filters.rol);
      }

      if (filters?.status) {
        query = query.eq('activo', filters.status === 'activo');
      }

      query = query.order('fecha_creacion', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error en usuariosDB.getAll:', error);
        return { data: [], error };
      }

      // Obtener conteo de parcelas para cada usuario
      const usuariosConParcelas = await Promise.all(
        (data || []).map(async (usuario) => {
          const { count } = await supabase
            .from('parcelas')
            .select('*', { count: 'exact', head: true })
            .eq('id_usuario_responsable', usuario.id_usuario);

          return {
            ...usuario,
            total_parcelas: count || 0
          };
        })
      );

      console.log('Datos obtenidos:', usuariosConParcelas);
      return { data: usuariosConParcelas, error: null };

    } catch (err) {
      console.error('Exception en usuariosDB.getAll:', err);
      return { data: [], error: err };
    }
  },

  async getById(id: number): Promise<SingleDatabaseResponse<Usuario>> {
    try {
      console.log(`Ejecutando SQL crudo: SELECT * FROM usuarios WHERE id_usuario = ${id}`);

      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id_usuario', id)
        .single();

      if (error) {
        console.error('Error en usuariosDB.getById:', error);
        return { data: null, error };
      }

      // Obtener conteo de parcelas
      const { count } = await supabase
        .from('parcelas')
        .select('*', { count: 'exact', head: true })
        .eq('id_usuario_responsable', id);

      const usuarioConDatos = {
        ...data,
        total_parcelas: count || 0
      };

      return { data: usuarioConDatos, error: null };
    } catch (err) {
      console.error('Exception en usuariosDB.getById:', err);
      return { data: null, error: err };
    }
  },

  async create(usuario: UsuarioForm): Promise<SingleDatabaseResponse<Usuario>> {
    try {
      const sqlQuery = `
        INSERT INTO usuarios (nombre, email, password_hash, rol, activo)
        VALUES ('${usuario.nombre}', '${usuario.email}', '${usuario.password_hash}', '${usuario.rol}', ${usuario.activo})
        RETURNING *
      `;

      console.log('SQL Query:', sqlQuery);

      const { data, error } = await supabase
        .from('usuarios')
        .insert({
          nombre: usuario.nombre,
          email: usuario.email,
          password_hash: usuario.password_hash,
          rol: usuario.rol,
          activo: usuario.activo
        })
        .select()
        .single();

      if (error) {
        console.error('Error en usuariosDB.create:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Exception en usuariosDB.create:', err);
      return { data: null, error: err };
    }
  },

  async update(id: number, usuario: Partial<UsuarioForm>): Promise<SingleDatabaseResponse<Usuario>> {
    try {
      const updates = Object.entries(usuario)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => `${key} = '${value}'`)
        .join(', ');

      const sqlQuery = `
        UPDATE usuarios 
        SET ${updates}
        WHERE id_usuario = ${id}
        RETURNING *
      `;

      console.log('SQL Query:', sqlQuery);

      const { data, error } = await supabase
        .from('usuarios')
        .update(usuario)
        .eq('id_usuario', id)
        .select()
        .single();

      if (error) {
        console.error('Error en usuariosDB.update:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Exception en usuariosDB.update:', err);
      return { data: null, error: err };
    }
  },

  async delete(id: number): Promise<{ error: PostgrestError | null }> {
    try {
      const sqlQuery = `DELETE FROM usuarios WHERE id_usuario = ${id}`;
      console.log('SQL Query:', sqlQuery);

      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id_usuario', id);

      if (error) {
        console.error('Error en usuariosDB.delete:', error);
      }

      return { error };
    } catch (err) {
      if (err instanceof PostgrestError) {
        console.error('PostgrestError en usuariosDB.delete:', err.message);
        return { error: err };
      }
      return { error: { message: 'Error desconocido al eliminar usuario' } as PostgrestError };
    }
  }
};

// CRUD para Parcelas - CORREGIDO
export const parcelasDB = {
  async getAll(filters?: FilterOptions): Promise<DatabaseResponse<Parcela>> {
    try {
      console.log('Ejecutando consulta SQL cruda para parcelas...');

      let sqlQuery = `
          SELECT p.*, u.nombre as usuario_nombre,
                 COUNT(s.id_sensor) as total_sensores
          FROM parcelas p
                   LEFT JOIN usuarios u ON p.id_usuario_responsable = u.id_usuario
                   LEFT JOIN sensores s ON p.id_parcela = s.id_parcela
      `;

      const conditions = [];

      if (filters?.search) {
        conditions.push(`(p.nombre ILIKE '%${filters.search}%' OR p.ubicacion ILIKE '%${filters.search}%' OR p.tipo_cultivo ILIKE '%${filters.search}%')`);
      }

      if (filters?.status) {
        conditions.push(`p.activa = ${filters.status === 'activa' ? 'true' : 'false'}`);
      }

      if (conditions.length > 0) {
        sqlQuery += ` WHERE ` + conditions.join(' AND ');
      }

      sqlQuery += ` GROUP BY p.id_parcela, u.nombre ORDER BY p.fecha_creacion DESC`;

      console.log('SQL Query:', sqlQuery);

      // Usar cliente Supabase estándar
      let query = supabase
        .from('parcelas')
        .select(`
          *,
          usuarios!id_usuario_responsable(nombre)
        `);

      if (filters?.search) {
        query = query.or(`nombre.ilike.%${filters.search}%,ubicacion.ilike.%${filters.search}%,tipo_cultivo.ilike.%${filters.search}%`);
      }

      if (filters?.status) {
        query = query.eq('activa', filters.status === 'activa');
      }

      query = query.order('fecha_creacion', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error en parcelasDB.getAll:', error);
        return { data: [], error };
      }

      // Obtener conteo de sensores para cada parcela
      const parcelasConSensores = await Promise.all(
        (data || []).map(async (parcela) => {
          const { count } = await supabase
            .from('sensores')
            .select('*', { count: 'exact', head: true })
            .eq('id_parcela', parcela.id_parcela);

          return {
            ...parcela,
            usuario_nombre: parcela.usuarios?.nombre || 'Sin asignar',
            total_sensores: count || 0
          };
        })
      );

      return { data: parcelasConSensores, error: null };

    } catch (err) {
      console.error('Exception en parcelasDB.getAll:', err);
      return { data: [], error: err };
    }
  },

  async getById(id: number): Promise<SingleDatabaseResponse<Parcela>> {
    try {
      console.log(`SQL: SELECT p.*, u.nombre as usuario_nombre FROM parcelas p LEFT JOIN usuarios u ON p.id_usuario_responsable = u.id_usuario WHERE p.id_parcela = ${id}`);

      const { data, error } = await supabase
        .from('parcelas')
        .select(`
          *,
          usuarios!id_usuario_responsable(nombre)
        `)
        .eq('id_parcela', id)
        .single();

      if (error) {
        return { data: null, error };
      }

      // Obtener conteo de sensores
      const { count } = await supabase
        .from('sensores')
        .select('*', { count: 'exact', head: true })
        .eq('id_parcela', id);

      const parcelaConDatos = {
        ...data,
        usuario_nombre: data.usuarios?.nombre || 'Sin asignar',
        total_sensores: count || 0
      };

      return { data: parcelaConDatos, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  async create(parcela: ParcelaForm): Promise<SingleDatabaseResponse<Parcela>> {
    try {
      const sqlQuery = `
          INSERT INTO parcelas (nombre, ubicacion, area_m2, tipo_cultivo, activa, id_usuario_responsable)
          VALUES ('${parcela.nombre}', '${parcela.ubicacion}', ${parcela.area_m2}, '${parcela.tipo_cultivo}', ${parcela.activa}, ${parcela.id_usuario_responsable})
              RETURNING *
      `;

      console.log('SQL Query:', sqlQuery);

      const { data, error } = await supabase
        .from('parcelas')
        .insert(parcela)
        .select()
        .single();

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  async update(id: number, parcela: Partial<ParcelaForm>): Promise<SingleDatabaseResponse<Parcela>> {
    try {
      const updates = Object.entries(parcela)

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => `${key} = '${value}'`)
        .join(', ');

      console.log(`SQL: UPDATE parcelas SET ${updates} WHERE id_parcela = ${id}`);

      const { data, error } = await supabase
        .from('parcelas')
        .update(parcela)
        .eq('id_parcela', id)
        .select()
        .single();

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  async delete(id: number): Promise<{ error: PostgrestError | null }> {
    try {
      console.log(`SQL: DELETE FROM parcelas WHERE id_parcela = ${id}`);

      const { error } = await supabase
        .from('parcelas')
        .delete()
        .eq('id_parcela', id);

      return { error };
    } catch (err) {
      if (err instanceof PostgrestError) {
        console.error('PostgrestError en usuariosDB.delete:', err.message);
        return { error: err };
      }
      return { error: { message: 'Error desconocido al eliminar usuario' } as PostgrestError };
    }
  }
};

// CRUD para Sensores - CORREGIDO
export const sensoresDB = {
  async getAll(filters?: FilterOptions): Promise<DatabaseResponse<Sensor>> {
    try {
      console.log('Ejecutando consulta SQL cruda para sensores...');

      let query = supabase
        .from('sensores')
        .select(`
          *,
          parcelas!id_parcela(nombre)
        `);

      if (filters?.search) {
        query = query.or(`nombre.ilike.%${filters.search}%,ubicacion.ilike.%${filters.search}%`);
      }

      if (filters?.status) {
        query = query.eq('estado', filters.status);
      }

      if (filters?.type) {
        query = query.eq('tipo_sensor', filters.type);
      }

      if (filters?.parcela) {
        query = query.eq('id_parcela', filters.parcela);
      }

      query = query.order('fecha_instalacion', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error en sensoresDB.getAll:', error);
        return { data: [], error };
      }

      // Obtener conteo de mediciones
      const sensoresConMediciones = await Promise.all(
        (data || []).map(async (sensor) => {
          const { count } = await supabase
            .from('mediciones')
            .select('*', { count: 'exact', head: true })
            .eq('id_sensor', sensor.id_sensor);

          return {
            ...sensor,
            parcela_nombre: sensor.parcelas?.nombre || 'Sin asignar',
            total_mediciones: count || 0
          };
        })
      );

      return { data: sensoresConMediciones, error: null };

    } catch (err) {
      console.error('Exception en sensoresDB.getAll:', err);
      return { data: [], error: err };
    }
  },

  async getById(id: number): Promise<SingleDatabaseResponse<Sensor>> {
    try {
      const { data, error } = await supabase
        .from('sensores')
        .select(`
          *,
          parcelas!id_parcela(nombre)
        `)
        .eq('id_sensor', id)
        .single();

      if (error) {
        return { data: null, error };
      }

      const { count } = await supabase
        .from('mediciones')
        .select('*', { count: 'exact', head: true })
        .eq('id_sensor', id);

      const sensorConDatos = {
        ...data,
        parcela_nombre: data.parcelas?.nombre || 'Sin asignar',
        total_mediciones: count || 0
      };

      return { data: sensorConDatos, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  async create(sensor: SensorForm): Promise<SingleDatabaseResponse<Sensor>> {
    try {
      console.log(`SQL: INSERT INTO sensores (nombre, tipo_sensor, ubicacion, estado, id_parcela) VALUES ('${sensor.nombre}', '${sensor.tipo_sensor}', '${sensor.ubicacion}', '${sensor.estado}', ${sensor.id_parcela})`);

      const { data, error } = await supabase
        .from('sensores')
        .insert(sensor)
        .select()
        .single();

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  async update(id: number, sensor: Partial<SensorForm>): Promise<SingleDatabaseResponse<Sensor>> {
    try {
      const { data, error } = await supabase
        .from('sensores')
        .update(sensor)
        .eq('id_sensor', id)
        .select()
        .single();

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  async delete(id: number): Promise<{ error: PostgrestError | null }> {
    try {
      console.log(`SQL: DELETE FROM sensores WHERE id_sensor = ${id}`);

      const { error } = await supabase
        .from('sensores')
        .delete()
        .eq('id_sensor', id);

      return { error };
    } catch (err) {
      if (err instanceof PostgrestError) {
        console.error('PostgrestError en usuariosDB.delete:', err.message);
        return { error: err };
      }
      return { error: { message: 'Error desconocido al eliminar usuario' } as PostgrestError };
    }
  }
};

// CRUD para Mediciones - CORREGIDO
export const medicionesDB = {
  async getAll(filters?: FilterOptions): Promise<DatabaseResponse<Medicion>> {
    try {
      console.log('Ejecutando consulta SQL cruda para mediciones...');

      let query = supabase
        .from('mediciones')
        .select(`
          *,
          sensores!id_sensor(
            nombre,
            tipo_sensor,
            parcelas!id_parcela(nombre)
          )
        `);

      if (filters?.sensor) {
        query = query.eq('id_sensor', filters.sensor);
      }

      if (filters?.dateFrom) {
        query = query.gte('fecha_medicion', filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte('fecha_medicion', filters.dateTo);
      }

      query = query.order('fecha_medicion', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error en medicionesDB.getAll:', error);
        return { data: [], error };
      }

      const medicionesConDatos = (data || []).map(medicion => ({
        ...medicion,
        sensor_nombre: medicion.sensores?.nombre || 'Sin asignar',
        tipo_sensor: medicion.sensores?.tipo_sensor || '',
        parcela_nombre: medicion.sensores?.parcelas?.nombre || 'Sin asignar'
      }));

      return { data: medicionesConDatos, error: null };

    } catch (err) {
      console.error('Exception en medicionesDB.getAll:', err);
      return { data: [], error: err };
    }
  },

  async getById(id: number): Promise<SingleDatabaseResponse<Medicion>> {
    try {
      const { data, error } = await supabase
        .from('mediciones')
        .select(`
          *,
          sensores!id_sensor(
            nombre,
            tipo_sensor,
            parcelas!id_parcela(nombre)
          )
        `)
        .eq('id_medicion', id)
        .single();

      if (error) {
        return { data: null, error };
      }

      const medicionConDatos = {
        ...data,
        sensor_nombre: data.sensores?.nombre || 'Sin asignar',
        tipo_sensor: data.sensores?.tipo_sensor || '',
        parcela_nombre: data.sensores?.parcelas?.nombre || 'Sin asignar'
      };

      return { data: medicionConDatos, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  async create(medicion: MedicionForm): Promise<SingleDatabaseResponse<Medicion>> {
    try {
      console.log(`SQL: INSERT INTO mediciones (valor, unidad, id_sensor) VALUES (${medicion.valor}, '${medicion.unidad}', ${medicion.id_sensor})`);

      const { data, error } = await supabase
        .from('mediciones')
        .insert(medicion)
        .select()
        .single();

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  async update(id: number, medicion: Partial<MedicionForm>): Promise<SingleDatabaseResponse<Medicion>> {
    try {
      const { data, error } = await supabase
        .from('mediciones')
        .update(medicion)
        .eq('id_medicion', id)
        .select()
        .single();

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  async delete(id: number): Promise<{ error: PostgrestError | null }> {
    try {
      console.log(`SQL: DELETE FROM mediciones WHERE id_medicion = ${id}`);

      const { error } = await supabase
        .from('mediciones')
        .delete()
        .eq('id_medicion', id);

      return { error };
    } catch (err) {
      if (err instanceof PostgrestError) {
        console.error('PostgrestError en usuariosDB.delete:', err.message);
        return { error: err };
      }
      return { error: { message: 'Error desconocido al eliminar usuario' } as PostgrestError };
    }
  }
};

// CRUD para Alertas - CORREGIDO
export const alertasDB = {
  async getAll(filters?: FilterOptions): Promise<DatabaseResponse<Alerta>> {
    try {
      console.log('Ejecutando consulta SQL cruda para alertas...');

      let query = supabase
        .from('alertas')
        .select(`
          *,
          parcelas!id_parcela(nombre),
          sensores!id_sensor(nombre, tipo_sensor)
        `);

      if (filters?.search) {
        query = query.or(`tipo_alerta.ilike.%${filters.search}%,mensaje.ilike.%${filters.search}%`);
      }

      if (filters?.status) {
        query = query.eq('estado', filters.status);
      }

      if (filters?.nivel_urgencia) {
        query = query.eq('nivel_urgencia', filters.nivel_urgencia);
      }

      if (filters?.parcela) {
        query = query.eq('id_parcela', filters.parcela);
      }

      if (filters?.dateFrom) {
        query = query.gte('fecha_generacion', filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte('fecha_generacion', filters.dateTo);
      }

      query = query.order('fecha_generacion', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error en alertasDB.getAll:', error);
        return { data: [], error };
      }

      const alertasConDatos = (data || []).map(alerta => ({
        ...alerta,
        parcela_nombre: alerta.parcelas?.nombre || 'Sin asignar',
        sensor_nombre: alerta.sensores?.nombre || 'Sin asignar',
        tipo_sensor: alerta.sensores?.tipo_sensor || ''
      }));

      return { data: alertasConDatos, error: null };

    } catch (err) {
      console.error('Exception en alertasDB.getAll:', err);
      return { data: [], error: err };
    }
  },

  async getById(id: number): Promise<SingleDatabaseResponse<Alerta>> {
    try {
      const { data, error } = await supabase
        .from('alertas')
        .select(`
          *,
          parcelas!id_parcela(nombre),
          sensores!id_sensor(nombre, tipo_sensor)
        `)
        .eq('id_alerta', id)
        .single();

      if (error) {
        return { data: null, error };
      }

      const alertaConDatos = {
        ...data,
        parcela_nombre: data.parcelas?.nombre || 'Sin asignar',
        sensor_nombre: data.sensores?.nombre || 'Sin asignar',
        tipo_sensor: data.sensores?.tipo_sensor || ''
      };

      return { data: alertaConDatos, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  async create(alerta: AlertaForm): Promise<SingleDatabaseResponse<Alerta>> {
    try {
      console.log(`SQL: INSERT INTO alertas (tipo_alerta, mensaje, nivel_urgencia, estado, id_parcela, id_sensor) VALUES ('${alerta.tipo_alerta}', '${alerta.mensaje}', '${alerta.nivel_urgencia}', '${alerta.estado}', ${alerta.id_parcela}, ${alerta.id_sensor})`);

      const { data, error } = await supabase
        .from('alertas')
        .insert(alerta)
        .select()
        .single();

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  async update(id: number, alerta: Partial<AlertaForm>): Promise<SingleDatabaseResponse<Alerta>> {
    try {
      const { data, error } = await supabase
        .from('alertas')
        .update(alerta)
        .eq('id_alerta', id)
        .select()
        .single();

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  async delete(id: number): Promise<{ error: PostgrestError  | null }> {
    try {
      console.log(`SQL: DELETE FROM alertas WHERE id_alerta = ${id}`);

      const { error } = await supabase
        .from('alertas')
        .delete()
        .eq('id_alerta', id);

      return { error };
    } catch (err) {
      if (err instanceof PostgrestError) {
        console.error('PostgrestError en usuariosDB.delete:', err.message);
        return { error: err };
      }
      return { error: { message: 'Error desconocido al eliminar usuario' } as PostgrestError };
    }
  }
};
