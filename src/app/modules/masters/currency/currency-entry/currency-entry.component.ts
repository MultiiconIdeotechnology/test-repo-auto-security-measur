import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgClass, DatePipe, AsyncPipe, NgFor } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { CurrencyService } from 'app/services/currency.service';
import { ToasterService } from 'app/services/toaster.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Linq } from 'app/utils/linq';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-currency-entry',
  templateUrl: './currency-entry.component.html',
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
    MatTooltipModule
  ]
})
export class CurrencyEntryComponent {
  disableBtn: boolean = false
  readonly: boolean = false;
  record: any = {};
  fieldList: {};

  constructor(
    public matDialogRef: MatDialogRef<CurrencyEntryComponent>,
    private builder: FormBuilder,
    private matSnackBar: MatSnackBar,
    private currencyService: CurrencyService,
    private alertService: ToasterService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data?.data ?? {}
  }

  formGroup: FormGroup;
  title = "Create Currency"
  btnLabel = "Create"

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      currency_short_code: [''],
      currency: [''],
      currency_symbol: [''],
    });

  //   this.formGroup.get('currency').valueChanges.subscribe(text => {
  //     this.formGroup.get('currency').patchValue(Linq.convertToTitleCase(text), { emitEvent: false });
  //  }) 

    if (this.record.id) {
      this.formGroup.patchValue(this.record)
      this.readonly = this.data.readonly;
      if (this.readonly) {
        this.fieldList = [
          { name: 'Currency', value: this.record.currency},
          { name: 'Short Code', value: this.record.currency_short_code },
          { name: 'Symbol', value: this.record.currency_symbol },
        ]
      }
      this.title = this.readonly ? ("Currency - " + this.record.currency) : 'Modify Currency';
      this.btnLabel = this.readonly ? "Close" : 'Save';
    }

  }

  submit(): void {
    if(!this.formGroup.valid){
      this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.formGroup.markAllAsTouched();
      return;
  }
  
    this.disableBtn = true;
    const json = this.formGroup.getRawValue();
    this.currencyService.create(json).subscribe({
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
