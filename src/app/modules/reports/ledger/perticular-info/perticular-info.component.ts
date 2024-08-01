import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ToasterService } from 'app/services/toaster.service';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
  selector: 'app-perticular-info',
  templateUrl: './perticular-info.component.html',
  styleUrls: ['./perticular-info.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    DatePipe,
    AsyncPipe,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    NgxMatSelectSearchModule,
    MatDatepickerModule,
    MatTooltipModule
  ]
})
export class PerticularInfoComponent {

  fieldList: {};
  record: any = {};

  constructor(
    public matDialogRef: MatDialogRef<PerticularInfoComponent>,
    private conformationService: FuseConfirmationService,
    private matDialog: MatDialog,
    private alertService: ToasterService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data;
  }

  ngOnInit() {
    if (this.record.id) {

          this.fieldList = [
            { name: 'Date', value: this.record.datetime ? DateTime.fromISO(this.record.datetime).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '', },
            { name: 'Reference Number', value: this.record.reference_number, },
            { name: 'Particular', value: this.record.particular, },
            { name: 'Debit', value: this.record.debit, },
            { name: 'Credit', value: this.record.credit, },
            { name: 'Balance', value: this.record.balance, },
            { name: 'Total Balance', value: this.record.countCredit, },
          ];
    }
  }

}
