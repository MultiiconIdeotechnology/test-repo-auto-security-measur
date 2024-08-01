import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FlightTabService } from 'app/services/flight-tab.service';
import { ToasterService } from 'app/services/toaster.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
  selector: 'app-refundable',
  templateUrl: './refundable.component.html',
  styleUrls: ['./refundable.component.scss'],
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
        MatSlideToggleModule,
        MatChipsModule,
        NgxMatSelectSearchModule,
    ],
})
export class RefundableComponent {

  disableBtn: boolean = false;
    record: any = {};

    constructor(
        public matDialogRef: MatDialogRef<RefundableComponent>,
        private builder: FormBuilder,
        private flighttabService: FlightTabService,
        protected alertService: ToasterService,
        private matDialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any[] = []
    ) {
        this.record = data || {};
    }

    formGroup: FormGroup;
    title = "Change Refund Type"
    btnLabel = 'Create';

    ngOnInit(): void {

        this.formGroup = this.builder.group({
            id: [''],
            is_refundable: [''],
          });

      this.formGroup.get('is_refundable').patchValue(this.record.data.fareType);
    }

    submit(): void {
      this.disableBtn = true;
      const Fdata = {}
      Fdata['id'] = this.record.data.id
      Fdata['is_refundable']= this.formGroup.get('is_refundable').value == 'Non-Refundable' ? false : true

      this.flighttabService.setFareType(Fdata).subscribe({
          next: ( data:any) => {
              this.matDialogRef.close(true);
              this.disableBtn = false;
              this.alertService.showToast('success', 'Refund Type Changed');
          },
          error: (err) => {
              this.disableBtn = false;
              this.alertService.showToast('error', err);
          },
      });
  }


}
