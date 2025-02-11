import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { NgIf, NgFor, DatePipe, NgClass } from '@angular/common';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TechBusinessService } from 'app/services/tech-business.service';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-sales-subreport',
  standalone: true,
  imports: [
    CommonModule,
    PrimeNgImportsModule,
    MatIconModule,
    NgIf, NgFor, DatePipe, NgClass,
    ReactiveFormsModule,
    MatButtonModule
  ],
  templateUrl: './sales-subreport.component.html',
  styleUrls: ['./sales-subreport.component.scss']
})
export class SalesSubreportComponent extends BaseListingComponent {
  dataList:any[] = [];
  sortColumn:string = "";
  record:any;
  reqData:any = {};
  // originalDataList:any[] = [];
  totalSaleAmount:number = 0;

  constructor(
     public matDialogRef: MatDialogRef<SalesSubreportComponent>,
     @Inject(MAT_DIALOG_DATA) public data: any = {},
     private techService: TechBusinessService,
  ){
    super("");
    if(data){
      this.record = data;
      this.reqData = {
        rm_id: this.record.rm_id,
        from_date: this.record.date,
      }
    }
  };
  
  refreshItems(event?:any): void {
    let oldModel = this.getNewFilterReq(event);
    let reqObj = this.reqData;
    let finalReq = {...reqObj, ...oldModel};

    this.techService.onSalesReport(finalReq).subscribe({
      next: (resp:any) => {
        this.dataList = resp.data;
        this.totalSaleAmount = resp.total_sale_price || 0;
        // this.originalDataList = resp.data;
        this.totalRecords = resp.total;
        this.isLoading = false;
      },
      error: (err) => {
        this.alertService.showToast('error', err);
        this.isLoading = false;
      }
    });
  }
  

  getStatusColor(status: string): string {
    if (status == 'Pending' || status == 'Offline Pending' || status == 'Confirmation Pending' || status == 'Partially Cancelled' || status == 'Hold Released') {
      return 'text-orange-600';
    } else if (status == 'Waiting for Payment' || status == 'Partial Payment Completed' || status == 'Assign To Refund' || status == 'Payment Completed') {
      return 'text-yellow-600';
    } else if (status == 'Confirmed') {
      return 'text-green-600';
    } else if (status == 'Payment Failed' || status == 'Booking Failed' || status == 'Cancelled' || status == 'Rejected' || status == 'Hold Failed') {
      return 'text-red-600';
    } else if (status == 'Hold') {
      return 'text-blue-600';
    } else {
      return '';
    }
  }

  getNodataText(): string {
    if (this.isLoading)
        return 'Loading...';
    else if (this.searchInputControl.value)
        return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }
}
