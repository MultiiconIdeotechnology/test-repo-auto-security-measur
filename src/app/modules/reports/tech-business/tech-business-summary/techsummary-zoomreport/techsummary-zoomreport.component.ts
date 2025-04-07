import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { NgIf, NgFor, DatePipe, NgClass } from '@angular/common';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TechBusinessService } from 'app/services/tech-business.service';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Linq } from 'app/utils/linq';
import { Routes } from 'app/common/const';
import { IndianNumberPipe } from '@fuse/pipes/indianNumberFormat.pipe';

@Component({
  selector: 'app-techsummary-zoomreport',
  standalone: true,
  imports: [
    CommonModule,
    PrimeNgImportsModule,
    MatIconModule,
    NgIf, NgFor, DatePipe, NgClass,
    ReactiveFormsModule,
    MatButtonModule,
    IndianNumberPipe
  ],
  templateUrl: './techsummary-zoomreport.component.html',
  styleUrls: ['./techsummary-zoomreport.component.scss']
})
export class TechsummaryZoomreportComponent extends BaseListingComponent {
  dataList: any[] = [];
  sortColumn: string = "";
  record: any;
  reqData: any = {};
  originalDataList: any[] = [];
  totalSaleAmount: number = 0;
  isFilterShow: boolean = false;

  statusColors: { [key: string]: string } = {
    Delivered: '#4CAF50',   // Green
    Expired: '#F44336',     // Red
    Cancelled: '#F44336',   // Red (same as Expired)
    Pending: '#FFC107',     // Yellow (Brighter for better visibility)
    Blocked: '#B22222',     // Dark Red
    Confirmed: '#198754',   // Green
    "Sales Return": '#FF9800', // Orange
    Cancel: '#D32F2F',       // Dark Red (Distinct from Cancelled)
    Rejected: '#DC3545'      // Bright Red (Different from Expired/Cancelled)
};
  statusList:string[] = [];
  totalOldStatusList: string[] = ["Blocked", "Pending", "Delivered", "Cancel", "Sales Return", "Cancelled", "Expired"];
  newStatusList: string[] = ["Pending", "Confirmed", "Rejected"];

  constructor(
    public matDialogRef: MatDialogRef<TechsummaryZoomreportComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any = {},
    private techService: TechBusinessService,
  ) {
    super("");

  };

  ngOnInit() {
    if (this.data) {
      this.record = this.data;
      this.reqData = {
        rm_id: this.record.rm_id,
        from_date: this.record.from_date,
        to_date: this.record.to_date,
        type: this.record.type
      }

      if(this.record.type == 'total'){
        this.statusList = this.totalOldStatusList;
      } else if(this.record.type == 'new'){
        this.statusList = this.newStatusList;
      } else if(this.record.type == 'old'){
        this.statusList = this.totalOldStatusList;
      }
      this.refreshItems();
    }
  }

  refreshItems(event?: any): void {
    this.techService.onSummaryReport(this.reqData).subscribe({
      next: (resp: any) => {
        this.dataList = resp.data;
        this.totalSaleAmount = resp.total_sale_price || 0;
        this.originalDataList = resp.data;
        this.totalRecords = resp.total;
        this.isLoading = false;
      },
      error: (err) => {
        this.alertService.showToast('error', err);
        this.isLoading = false;
      }
    });
  }

  onGlobalFilterSearch(val: any) {
    this.dataList = this.originalDataList.filter((item: any) =>
      JSON.stringify(item).toLowerCase().includes(val.toLowerCase())
    );
  }

  getStatusColor(status: string): string {
    return this.statusColors[status];
  }

  onAgentDetail(element:any){
    if(element && element?.agent_id){
      Linq.recirect(Routes.customers.agent_entry_route + '/' + element.agent_id + '/readonly')
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
