import { NgIf, NgFor, DatePipe, CommonModule, NgClass } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import { dateRange } from 'app/common/const';
import { CommonUtils } from 'app/utils/commonutils';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ReceiptListComponent } from '../receipt-list/receipt-list.component';
import { PspSettingService } from 'app/services/psp-setting.service';


@Component({
  selector: 'app-payment-filter',
  templateUrl: './payment-filter.component.html',
  styleUrls: ['./payment-filter.component.scss'],
  standalone   : true,
  imports      : [
    NgIf,
    NgFor,
    DatePipe,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    NgClass,
    RouterOutlet,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    NgxMatSelectSearchModule,
    MatTabsModule,
    ReceiptListComponent
  ],
})
export class PaymentFilterComponent {

filterForm: FormGroup;
// public DR = dateRange;
// public dateRanges = [];
// public endDate: any;
// public startDate: any;
DR = dateRange;
public fromDate: any;
public toDate: any;
public dateRanges = [];
readonly: boolean;
title = "Filter Criteria"
module_name: any = {};
record: any = {};
providerList: any[] = [];



  constructor(
    public matDialogRef: MatDialogRef<PaymentFilterComponent>,
    private pspsettingService: PspSettingService,
    private builder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) private data: any = {},
  ) {
    this.module_name = data.name;
    if(data)
    this.record = data.data;
    this.dateRanges = CommonUtils.valuesArray(dateRange);
  }


  ngOnInit(): void {
    this.filterForm = this.builder.group({
      status: new FormControl(''),
      date: [''],
      fromDate : new FormControl(''),
      toDate : new FormControl(''),
      // payment_gateway : new FormControl(''),
    });

    this.filterForm.get('date').patchValue(dateRange.lastMonth);
    // this.filterForm.get('payment_gateway').patchValue('All');
    this.updateDate(dateRange.lastMonth)

    this.filterForm.patchValue(this.data);
    this.filterForm.patchValue(this.record)

    // /*************Payment Gateway combo**************/
    // this.pspsettingService.getPaymentGatewayTypes({}).subscribe({
    //   next: (data) => {
    //     this.providerList = data
    //     this.providerList = [];
    //     this.providerList.push( "All" )
    //     this.providerList.push(...data)
    //     // this.filterForm.get("payment_gateway").patchValue(this.providerList[0]);
    //   }
    // })

  }

  ngSubmit(): void {
    const json = this.filterForm.getRawValue()
    json.fromDate =  new Date(this.filterForm.get('fromDate').value)
    json.toDate =  new Date(this.filterForm.get('toDate').value)
      this.matDialogRef.close(json);
  }

  // public updateDate(event: any): void {

  //   if (event === dateRange.setCustomDate) {
  //     this.startDate = new Date();
  //     this.endDate = new Date();
  //     this.filterForm.get('fromDate').patchValue(this.startDate);
  //     this.filterForm.get('toDate').patchValue(this.endDate);
  //   }
  // }


  public updateDate(event: any): void {

    if (event === dateRange.today) {
      this.fromDate = new Date();
      this.toDate = new Date();
      this.fromDate.setDate(this.fromDate.getDate());
      this.filterForm.get('fromDate').patchValue(this.fromDate);
      this.filterForm.get('toDate').patchValue(this.toDate);
    }
    else if (event === dateRange.last3Days) {
      this.fromDate = new Date();
      this.toDate = new Date();
      this.fromDate.setDate(this.fromDate.getDate() - 3);
      this.filterForm.get('fromDate').patchValue(this.fromDate);
      this.filterForm.get('toDate').patchValue(this.toDate);
    }
    else if (event === dateRange.lastWeek) {
      this.fromDate = new Date();
      this.toDate = new Date();
      const dt = new Date(); // current date of week
      const currentWeekDay = dt.getDay();
      const lessDays = currentWeekDay === 0 ? 6 : currentWeekDay - 1;
      const wkStart = new Date(new Date(dt).setDate(dt.getDate() - lessDays));
      const wkEnd = new Date(new Date(wkStart).setDate(wkStart.getDate() + 6));

      this.fromDate = wkStart;
      this.toDate = new Date();
      this.filterForm.get('fromDate').patchValue(this.fromDate);
      this.filterForm.get('toDate').patchValue(this.toDate);
    }
    else if (event === dateRange.lastMonth) {
      this.fromDate = new Date();
      this.toDate = new Date();
      this.fromDate.setDate(1);
      this.fromDate.setMonth(this.fromDate.getMonth());
      this.filterForm.get('fromDate').patchValue(this.fromDate);
      this.filterForm.get('toDate').patchValue(this.toDate);
    }
    else if (event === dateRange.last3Month) {
      this.fromDate = new Date();
      this.toDate = new Date();
      this.fromDate.setDate(1);
      this.fromDate.setMonth(this.fromDate.getMonth() - 3);
      this.filterForm.get('fromDate').patchValue(this.fromDate);
      this.filterForm.get('toDate').patchValue(this.toDate);
    }
    else if (event === dateRange.last6Month) {
      this.fromDate = new Date();
      this.toDate = new Date();
      this.fromDate.setDate(1);
      this.fromDate.setMonth(this.fromDate.getMonth() - 6);
      this.filterForm.get('fromDate').patchValue(this.fromDate);
      this.filterForm.get('toDate').patchValue(this.toDate);
    }
    else if (event === dateRange.setCustomDate) {
      this.fromDate = new Date();
      this.toDate = new Date();
      this.filterForm.get('fromDate').patchValue(this.fromDate);
      this.filterForm.get('toDate').patchValue(this.toDate);
    }
  }

}
