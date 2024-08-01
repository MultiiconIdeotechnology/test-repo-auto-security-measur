import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AlertComponent } from 'app/modules/alert/alert.component';

@Injectable({ providedIn: 'root' })
export class AlertService {
    AlertDTO(arg0: string) {
      throw new Error('Method not implemented.');
    }
    error(err: any): void {
      throw new Error('Method not implemented.');
    }
    private _matDialog: MatDialog = inject(MatDialog);
    /**
     * Constructor
     */
    constructor() {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    open(config: AlertDTO): MatDialogRef<AlertComponent> {
        // Merge the user config with the default config
        const userConfig = config;

        // Open the dialog
        return this._matDialog.open(AlertComponent, {
            disableClose: true,
            data: userConfig,
            position: { right: '40px', top: '40px' },
            panelClass: ['dialog-alert']
        });
    }
}

export class AlertDTO {
    message: string;
    alert: 'error' | 'success';
}
