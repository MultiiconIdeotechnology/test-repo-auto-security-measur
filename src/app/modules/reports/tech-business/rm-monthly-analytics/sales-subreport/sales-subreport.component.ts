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
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { Linq } from 'app/utils/linq';
import { Routes } from 'app/common/const';
import { EntityService } from 'app/services/entity.service';
import { Router } from '@angular/router';

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
  dataList: any[] = [];
  sortColumn: string = "";
  record: any;
  reqData: any = {};
  // originalDataList:any[] = [];
  totalSaleAmount: number = 0;
  isFilterShow: boolean = false;
  mopList: any[] = ['Wallet', 'Online'];

  statusList = [
    { label: 'Pending', value: 'Pending' },
    { label: 'Rejected', value: 'Rejected' },
    { label: 'Waiting for Payment', value: 'Waiting for Payment' },
    { label: 'Confirmed', value: 'Confirmed' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Success', value: 'Success' },
    { label: 'Offline Pending', value: 'Offline Pending' },
    { label: 'Confirmation Pending', value: 'Confirmation Pending' },
    { label: 'Payment Failed', value: 'Payment Failed' },
    { label: 'Booking Failed', value: 'Booking Failed' },
    { label: 'Cancelled', value: 'Cancelled' },
    { label: 'Partially Cancelled', value: 'Partially Cancelled' },
    { label: 'Hold', value: 'Hold' },
    { label: 'Payment Completed', value: 'Payment Completed' },
    { label: 'Partial Payment Completed', value: 'Partial Payment Completed' },
    { label: 'Assign To Refund', value: 'Assign To Refund' },
    { label: 'Account Audit', value: 'Account Audit' },
  ];

  constructor(
    public matDialogRef: MatDialogRef<SalesSubreportComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any = {},
    private techService: TechBusinessService,
    public _filterService: CommonFilterService,
    private entityService: EntityService,
    private router: Router,
  ) {
    super("");
    if (data) {
      this.record = data;
      this.reqData = {
        rm_id: this.record.rm_id,
        from_date: this.record.date,
      }
    }
  };

  refreshItems(event?: any): void {
    let oldModel = this.getNewFilterReq(event);
    let reqObj = this.reqData;
    let finalReq = { ...reqObj, ...oldModel };

    this.techService.onSalesReport(finalReq).subscribe({
      next: (resp: any) => {
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
    } else if (status == 'Confirmed' || status == 'Completed' || status == 'Success') {
      return 'text-green-600';
    } else if (status == 'Payment Failed' || status == 'Booking Failed' || status == 'Cancelled' || status == 'Rejected' || status == 'Hold Failed') {
      return 'text-red-600';
    } else if (status == 'Hold' || status == "Account Audit") {
      return 'text-blue-600';
    } else {
      return '';
    }
  }

  onAgentDetail(element: any) {
    if (element && element?.agent_id) {
      Linq.recirect(Routes.customers.agent_entry_route + '/' + element.agent_id + '/readonly')
    }
  }

  onRefNoDetail(element: any) {
    if (element?.booking_id) {
      const refPrefix = element.refNo.slice(0, 3);

      switch (refPrefix) {
        case "FLT":
          Linq.recirect(`/booking/flight/details/${element.booking_id}`);
          break;
        case "BUS":
          Linq.recirect(`/booking/bus/details/${element.booking_id}`);
          break;
        case "VIS":
          Linq.recirect(`/booking/visa/details/${element.booking_id}`);
          break;
        case "INS":
          Linq.recirect(`/booking/insurance/details/${element.booking_id}`);
          break;
        case "AIR":
          this.entityService.raiseAmendmentInfoCall({ data: element });
          break;
        case "HTL":
          Linq.recirect(`/booking/hotel/details/${element.booking_id}`);
          break;
        case "PKG":
          Linq.recirect(`/booking/holiday-lead/details/${element.booking_id}`);
          break;
        case "AGI":
          Linq.recirect(`/booking/group-inquiry/details/${element.booking_id}`);
          break;
        case "OSB":
          Linq.recirect(`/booking/offline-service/entry/${element.booking_id}/readonly`);
          break;
        case "FRX":
          this.router.navigate(['/booking/forex'])
          setTimeout(() => {
            this.entityService.raiseForexEntityCall({ data: element.booking_id, global_withdraw: true })
          }, 300);
          break;
        case "CAB":
          Linq.recirect(`/booking/cab/details/${element.booking_id}`);
          break;
        // case "PL":
        //   Linq.recirect(`/booking/holiday-lead/details/${element.booking_id}`);
        //   break;
        default:
          console.warn("Unknown refNo prefix:", refPrefix);
      }
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
