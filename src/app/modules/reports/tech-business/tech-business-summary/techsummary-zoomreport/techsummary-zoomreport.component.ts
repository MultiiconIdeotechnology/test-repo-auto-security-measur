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

@Component({
  selector: 'app-techsummary-zoomreport',
  standalone: true,
  imports: [
    CommonModule,
    PrimeNgImportsModule,
    MatIconModule,
    NgIf, NgFor, DatePipe, NgClass,
    ReactiveFormsModule,
    MatButtonModule
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
  isFilterShow:boolean = false;

  statusColors: { [key: string]: string } = {
    Delivered: '#4CAF50',
    Expired: '#F44336',
    Pending: '#FFC107',
    Blocked: '#B22222',
    Confirmed: '#198754'
  };

  statusList: any[] = [
    { label: "Delivered", value: "Delivered" },
    { label: "Expired", value: "Expired" },
    { label: "Pending", value: "Pending" },
    { label: "Blocked", value: "Blocked" },
    { label: "Confirmed", value: "Confirmed" }
  ]

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

  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }
}
