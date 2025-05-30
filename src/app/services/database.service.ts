import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

  constructor() {}

  async consultarCreditos(email: string) {
    try {
      const { data, error } = await this.supabase
        .from('creditos')
        .select('credito')
        .eq('email', email)
        .single();

      if (error) {
        console.error('Error al consultar créditos:', error);
        return 0;
      }

      return data?.credito ?? 0;
    } catch (err) {
      console.error('Error inesperado al consultar créditos:', err);
      return 0;
    }
  }

  // async checkUserQrCode(email: string, qrCode: string): Promise<number> {
  //   const { data, error } = await this.supabase
  //     .from('creditos')
  //     .select('qrs')
  //     .eq('email', email)
  //     .single();

  //   if (error) {
  //     console.error('Error al verificar QR:', error.message);
  //     return 0;
  //   }

  //   const qrs = data.qrs || [];
  //   const usos = qrs.filter((qr: string) => qr === qrCode).length;
  //   console.log(`El QR "${qrCode}" fue escaneado ${usos} veces`);
  //   return usos;
  // }

}
