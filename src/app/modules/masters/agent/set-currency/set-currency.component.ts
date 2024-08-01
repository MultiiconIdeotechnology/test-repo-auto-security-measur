import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CurrencyService } from 'app/services/currency.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
  selector: 'app-set-currency',
  templateUrl: './set-currency.component.html',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    NgClass,
    MatButtonModule,
    MatIconModule,
    DatePipe,
    AsyncPipe,
    NgxMatSelectSearchModule,
    MatSnackBarModule
  ]
})
export class SetCurrencyComponent {
  record: any = {};
  formGroup: any;
  CurrencyList: any[] = [];
  CurrencyListAll: any[] = [];

  constructor(
    public matDialogRef: MatDialogRef<SetCurrencyComponent>,
    private builder: FormBuilder,
    private currencyService:CurrencyService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    if(data){
      this.record = data
    }
  }


  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      base_currency_id: [''],
      currencyfilter: [""],
    });

    this.currencyService.getcurrencyCombo().subscribe({
      next: res => {
        this.CurrencyList = res;
        this.CurrencyListAll = res;
      }
    });

    this.formGroup.get('currencyfilter').valueChanges.subscribe(data => {
      this.CurrencyList = this.CurrencyListAll.filter(x => x.currency_short_code.toLowerCase().includes(data.toLowerCase()));
    })

    if(this.record.base_currency_id) {
      this.formGroup.get('currencyfilter').patchValue(this.record.base_currency);
      this.formGroup.get('base_currency_id').patchValue(this.record.base_currency_id);
    }
    
  }

  submit(): void {
    this.matDialogRef.close(this.formGroup.value);
  }
}
