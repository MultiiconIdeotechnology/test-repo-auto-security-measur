import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgClass, DatePipe, AsyncPipe, NgFor } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { CurrencyRoeService } from 'app/services/currency-roe.service';
import { ToasterService } from 'app/services/toaster.service';

@Component({
  selector: 'app-currency-roe-bulk-dialog',
  templateUrl: './currency-roe-bulk-dialog.component.html',
  styleUrls: ['./currency-roe-bulk-dialog.component.scss'],
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
  ]
})
export class CurrencyRoeBulkDialogComponent {
  disableBtn: boolean = false
  readonly: boolean = false;
  record: any = {};

  formGroup: FormGroup;
  title = "ROE Bulk Update"
  btnLabel = "Update"

  constructor(
    public matDialogRef: MatDialogRef<CurrencyRoeBulkDialogComponent>,
    private builder: FormBuilder,
    private matSnackBar: MatSnackBar,
    private currencyRoeService: CurrencyRoeService,
    private alertService: ToasterService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data?.data ?? {}
  }

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      actual_markup: ['0'],
      forex_actual_markup: ['0'],
    //   forex_purchase_markup: ['0'],
    //   forex_sale_markup: ['0'],
    });

    if (this.record.id) {
      this.readonly = this.data.readonly;
      this.formGroup.patchValue(this.record)

      this.title = this.readonly ? "Bulk ROE" : 'Update Bulk ROE';
      this.btnLabel = this.readonly ? "Close" : 'Save';
    }
  }

  submit(): void {
    this.disableBtn = true;
    const json = this.formGroup.getRawValue();
    this.currencyRoeService.updateROE(json).subscribe({
      next: () => {
        this.matDialogRef.close(true);
        this.disableBtn = false;
      }, error: (err) => {
        this.disableBtn = false;
        this.alertService.showToast('error', err, "top-right", true);
      }
    })
  }
}
