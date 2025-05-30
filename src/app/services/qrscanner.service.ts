import { Injectable } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

@Injectable({
  providedIn: 'root',
})
export class QrscannerService {
  async startScan(): Promise<string | null> {
    document.querySelector('body')?.classList.add('scanner-active');

    const permission = await BarcodeScanner.checkPermission({ force: true });
    if (!permission.granted) {
      return null;
    }

    await BarcodeScanner.hideBackground();

    const result = await BarcodeScanner.startScan();

    document.querySelector('body')?.classList.remove('scanner-active');

    if (result.hasContent) {
      return result.content;
    }

    return null;
  }

  stopScanner() {
    document.querySelector('body')?.classList.remove('scanner-active');
    BarcodeScanner.showBackground();
    BarcodeScanner.stopScan();
  }

  scanPrepare() {
    BarcodeScanner.prepare();
  }
}
