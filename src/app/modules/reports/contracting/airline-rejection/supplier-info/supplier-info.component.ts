import { Component, Inject, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterOutlet } from '@angular/router';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { module_name } from 'app/security';
import { AirlineSummaryService } from 'app/services/airline-summary.service';
import { DateTime } from 'luxon';
import { FailedConfirmedInfoComponent } from '../failed-confirmed-info/failed-confirmed-info.component';

@Component({
  selector: 'app-supplier-info',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    DatePipe,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
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
    PrimeNgImportsModule
  ],
  templateUrl: './supplier-info.component.html',
  styleUrls: ['./supplier-info.component.scss']
})
export class SupplierInfoComponent extends BaseListingComponent implements OnDestroy{

  dataList = [];
  record: any = {};
  title: any;

  constructor(
    public matDialogRef: MatDialogRef<SupplierInfoComponent>,
    private confirmService: FuseConfirmationService,
    private router: Router,
    private airlineSummaryService: AirlineSummaryService,
    private matDialog: MatDialog,
    public _filterService: CommonFilterService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}

  ) {
    super(module_name.airline_rejection)
    this.key = 'carrier';
    this.sortColumn = 'carrier';
    this.sortDirection = 'desc';
    this.Mainmodule = this;
 
    this.record = data
    this.title = this.record.supplier
    console.log("this.record", this.record);
  }

  ngOnInit(): void {
  }

  refreshItems(event?:any): void {
    this.isLoading = true;

    const request = this.getNewFilterReq(event);
    request['supplier'] = this.record.supplier;
    request['From_Date'] = this.record.From_Date;
    request['To_Date'] = this.record.To_Date;

    this.airlineSummaryService.airlineRejectionCarrierWiseAnalysis(request).subscribe({
      next: (data) => {
        this.dataList = data.data;
        this.totalRecords = data.total;
        this.isLoading = false;
      }, error: (err) => {
        this.alertService.showToast('error', err)
        this.isLoading = false
      }
    });
  }

  supplierInfo(data: any, key: any){

    console.log("106 key", key);
    console.log("106 data", data, );

    this.matDialog.open(FailedConfirmedInfoComponent,
      { data: {
        supplier: this.record.supplier,
        From_Date: this.record.From_Date,
        To_Date: this.record.To_Date,
        filterArea: key,
        carrier: data.carrier
      },
       disableClose: true, })
      .afterClosed()
      .subscribe((res) => {
          
      });

  }

  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }

}
