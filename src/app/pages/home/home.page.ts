import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonIcon,
  IonFab,
  IonFabButton,
  IonFabList,
  IonModal,
  IonText,
  ToastController,
} from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { DatabaseService } from 'src/app/services/database.service';
import { QrscannerService } from 'src/app/services/qrscanner.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonText,
    IonFabList,
    IonFabButton,
    IonFab,
    IonIcon,
    IonContent,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
  ],
})
export class HomePage {
  authService = inject(AuthService);
  databaseService = inject(DatabaseService);
  qrScanner = inject(QrscannerService);
  toastController = inject(ToastController);

  router = inject(Router);
  // user: any = null;
  usuarioActual: any = null;

  pressedButton: boolean = false;
  currentScan: any;
  credit: number = 0;
  qr10: string = '8c95def646b6127282ed50454b73240300dccabc';
  qr50: string = 'ae338e4e0cbb4e4bcffaf9ce5b409feb8edd5172';
  qr100: string = '2786f4877b9091dcad7f35751bfcf5d5ea712b2f';

  scanActive: boolean = false;

  constructor() {}

  ngOnInit() {
    this.pressedButton = true;

    this.authService.getCurrentUser().then(async (user) => {
      if (user) {
        // this.user = user;

        const { data, error } = await this.databaseService.supabase
          .from('creditos')
          .select('email, credito, qrs')
          .eq('email', user.email)
          .single();

        if (error) {
          console.error('Error al obtener datos del usuario:', error.message);
          this.pressedButton = false;
          return;
        }

        this.usuarioActual = data;
        this.usuarioActual.qrs = Array.isArray(this.usuarioActual.qrs)
          ? this.usuarioActual.qrs
          : [];

        this.credit = Number(data.credito);

        this.qrScanner.scanPrepare();
      } else {
        console.warn('No hay usuario logueado');
      }

      this.pressedButton = false;
      console.log('Contenido de usuarioActual:', this.usuarioActual);
    });
  }

  cerrarSesion() {
    if (this.authService.currentUser()) {
      console.log(this.authService.currentUser()?.username);
      this.authService.logout();

      this.router.navigateByUrl('/login');
    }
  }

  confirmarEliminarSaldo() {
    Swal.fire({
      title: '¿Desea eliminar el saldo?',
      text: 'No es posible recuperar el saldo una vez que se elimina!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      heightAuto: false,
      customClass: {
        popup: 'swal2-custom',
        confirmButton: 'swal2-confirm',
        cancelButton: 'swal2-cancel',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.restartCredit();
      }
    });
  }

  restartCredit() {
    this.pressedButton = true;
    setTimeout(() => {
      this.credit = 0;
      this.usuarioActual.credito = 0;
      this.usuarioActual.qrs = [];
      this.updateUser();
      this.pressedButton = false;
      this.presentToast('El saldo fue eliminado', 'success');
    }, 2000);
  }

  startScan() {
    this.pressedButton = true;
    setTimeout(() => {
      this.pressedButton = false;
      this.scanActive = true;
      this.qrScanner.startScan().then((result) => {
        this.currentScan = result!.trim();
        this.scanActive = false;
        this.checkCreditCharge(this.currentScan);
      });
    }, 1000);
  } // end of startScan

  stopScan() {
    this.pressedButton = true;
    setTimeout(() => {
      this.pressedButton = false;
      this.scanActive = false;
      this.qrScanner.stopScanner();
    }, 2000);
  } // end of stopScan

  async updateUser() {
    const { error, data } = await this.databaseService.supabase
      .from('creditos')
      .update({
        credito: this.credit,
        qrs: this.usuarioActual.qrs,
      })
      .eq('email', this.usuarioActual.email)
      .select();

    if (error) {
      console.error(
        'Error al actualizar usuario:',
        error.message,
        error.details
      );
    } else {
      console.log('Usuario actualizado ok:', data);
    }
  }

  checkCreditCharge(qrCode: string) {
    if (this.usuarioActual.email.startsWith('admin')) {
      if (this.checkUserQrCode(qrCode) < 2) {
        if (qrCode === this.qr10) {
          this.usuarioActual.credito += 10;
          this.credit = this.usuarioActual.credito;
          this.usuarioActual.qrs.push(qrCode);
          this.updateUser();
          this.presentToast('Cargaste $10 con éxito', 'success');
        } else if (qrCode === this.qr50) {
          this.usuarioActual.credito += 50;
          this.credit = this.usuarioActual.credito;
          this.usuarioActual.qrs.push(qrCode);
          this.updateUser();
          this.presentToast('Cargaste $50 con éxito', 'success');
        } else if (qrCode === this.qr100) {
          this.usuarioActual.credito += 100;
          this.credit = this.usuarioActual.credito;
          this.usuarioActual.qrs.push(qrCode);
          this.updateUser();
          this.presentToast('Cargaste $100 con éxito', 'success');
        }
      } else {
        this.presentToast(
          'No es posible cargar más de 2 veces el código',
          'danger'
        );
      }
    } else {
      if (this.checkUserQrCode(qrCode) < 1) {
        if (qrCode === this.qr10) {
          this.usuarioActual.credito += 10;
          this.credit = this.usuarioActual.credito;
          this.usuarioActual.qrs.push(qrCode);
          this.updateUser();
          this.presentToast('Cargaste $10 con éxito', 'success');
        } else if (qrCode === this.qr50) {
          this.usuarioActual.credito += 50;
          this.credit = this.usuarioActual.credito;
          this.usuarioActual.qrs.push(qrCode);
          this.updateUser();
          this.presentToast('Cargaste $50 con éxito', 'success');
        } else if (qrCode === this.qr100) {
          this.usuarioActual.credito += 100;
          this.credit = this.usuarioActual.credito;
          this.usuarioActual.qrs.push(qrCode);
          this.updateUser();
          this.presentToast('Cargaste $100 con éxito', 'success');
        }
      } else {
        this.presentToast(
          'No es posible cargar más de una vez el código',
          'danger'
        );
      }
    }
  } // end of checkCreditCharge

  checkUserQrCode(qrCode: string) {
    return this.usuarioActual.qrs.filter((qr: string) => qr == qrCode).length;
  } // end of checkUserQrCode

  async presentToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom',
      cssClass: 'toast-nbz',
    });
    await toast.present();
  }
}
