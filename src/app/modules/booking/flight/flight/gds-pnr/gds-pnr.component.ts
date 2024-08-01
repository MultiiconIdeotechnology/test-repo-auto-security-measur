import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
  selector: 'app-gds-pnr',
  templateUrl: './gds-pnr.component.html',
  styleUrls: ['./gds-pnr.component.scss'],
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
export class GdsPnrComponent {

  disableBtn: boolean = false;
    record: any = {};

    constructor(
        public matDialogRef: MatDialogRef<GdsPnrComponent>,
        private builder: FormBuilder,
        private flighttabService: FlightTabService,
        protected alertService: ToasterService,
        private matDialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any[] = []
    ) {
        this.record = data || {};
    }

    formGroup: FormGroup;
    title: any
    btnLabel = 'Create';

    ngOnInit(): void {
     this.title = this.record.title

        this.formGroup = this.builder.group({
            id: [''],
            pnr: [''],
            gds_pnr: [''],
            supplier_ref_no: [''],
          });
      if(this.title === "PNR")
      this.formGroup.get('pnr').patchValue(this.record.data.pnr);

      if(this.title === "GDS PNR")
      this.formGroup.get('gds_pnr').patchValue(this.record.data.gds_pnr);
    
      if(this.title === "Supplier Ref. No.")
      this.formGroup.get('supplier_ref_no').patchValue(this.record.data.supplier_ref_no);
    }

    submit(): void {
      this.disableBtn = true;
      const Fdata = {}
      Fdata['id'] = this.record.data.id
      Fdata['pnr']= this.formGroup.get('pnr').value == '' ? '' : this.formGroup.get('pnr').value
      Fdata['gds_pnr']= this.formGroup.get('gds_pnr').value == '' ? '' : this.formGroup.get('gds_pnr').value
      Fdata['supplier_ref_no']= this.formGroup.get('supplier_ref_no').value == '' ? '' : this.formGroup.get('supplier_ref_no').value

      this.flighttabService.setPnr(Fdata).subscribe({
          next: ( data:any) => {
              this.matDialogRef.close(true);
              this.disableBtn = false;
              this.alertService.showToast('success', this.title + ' Changed');
          },
          error: (err) => {
              this.disableBtn = false;
              this.alertService.showToast('error', err);
          },
      });
  }

}
