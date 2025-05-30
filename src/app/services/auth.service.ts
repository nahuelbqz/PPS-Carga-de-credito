import { Injectable, signal } from '@angular/core';
import { AuthResponse, createClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { from, Observable } from 'rxjs';
import { LoadingController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  currentUser = signal<{ email: string; username: string } | null>(null);

  constructor(private toastController: ToastController) {}

  async isLoggedIn(): Promise<boolean> {
    const { data, error } = await this.supabase.auth.getSession();
    return !!data.session;
  }

  register(
    username: string,
    email: string,
    password: string
  ): Observable<AuthResponse> {
    const promise = this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    return from(promise);
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const promise = this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    return from(promise);
  }

  logout(): void {
    this.supabase.auth.signOut();
    console.log('Logout exitoso');
  }

  async getCurrentUser(): Promise<User | null> {
    const { data, error } = await this.supabase.auth.getUser();
    if (error) {
      console.error('Error obteniendo el usuario actual:', error.message);
      return null;
    }
    return data.user;
  }

  async toast(message: string, status: string) {
    try {
      const toast = await this.toastController.create({
        message: message,
        color: status,
        position: 'top',
        duration: 2000,
      });
      toast.present();
    } catch (error) {
      console.log((error as Error).message);
    }
  } // end of toast
}
