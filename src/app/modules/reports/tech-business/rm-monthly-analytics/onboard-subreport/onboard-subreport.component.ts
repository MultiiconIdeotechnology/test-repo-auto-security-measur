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
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { Linq } from 'app/utils/linq';
import { Routes } from 'app/common/const';

@Component({
  selector: 'app-onboard-subreport',
  standalone: true,
  imports: [
    CommonModule,
    PrimeNgImportsModule,
    MatIconModule,
    NgIf, NgFor, DatePipe, NgClass,
    ReactiveFormsModule,
    MatButtonModule
  ],
  templateUrl: './onboard-subreport.component.html',
  styleUrls: ['./onboard-subreport.component.scss']
})
export class OnboardSubreportComponent extends BaseListingComponent {

  dataList: any[] = [];
  sortColumn: string = "";
  record: any;
  reqData: any = {};
  originalDataList: any[] = [];
  isFilterShow: boolean = false;

  statusList: any[] = ["Active", "New", "Inactive", "Dormant"];
  statusColors: { [key: string]: string } = {
    Active: '#28a745',
    New: '#007bff',
    Inactive: '#B22222',
    Dormant: '#C4A484'
  };

  constructor(
    public matDialogRef: MatDialogRef<OnboardSubreportComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any = {},
    private techService: TechBusinessService,
    public _filterService: CommonFilterService,
  ) {
    super("");
  };

  ngOnInit(): void {
    if (this.data) {
      this.record = this.data;

      if (this.record.type == 'onboard' || this.record.type == 'activation') {
        this.reqData = {
          rm_id: this.record.rm_id,
          from_date: this.record.date,
          type: this.record.type,
          columeFilters: {},
          Filter: ""
        }
      } else {
        this.reqData = {
          rm_id: this.record.rm_id,
          from_date: this.record.from_date,
          to_date: this.record.to_date,
          type: this.record.type
        }
      }
      this.refreshItems();
    }
  }

  refreshItems(event?: any): void {
    if (this.record.type == 'onboard' || this.record.type == 'activation') {
      this.techService.onboardReport(this.reqData).subscribe({
        next: (resp: any) => {
          this.dataList = resp.data;
          this.dataList.forEach((item: any) => item.signup = new Date(item.signup))
          this.originalDataList = resp.data;
          this.totalRecords = resp.total;
          this.isLoading = false;
        },
        error: (err) => {
          this.alertService.showToast('error', err);
          this.isLoading = false;
        }
      });
    } else if (this.record.type == 'new_partner' || this.record.type == 'first_partner' || this.record.type == 'activated') {
      this.techService.onSummaryReport(this.reqData).subscribe({
        next: (resp: any) => {
          this.dataList = resp.data;
          this.dataList.forEach((item: any) => item.signup = new Date(item.signup))
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
  }

  onGlobalFilterSearch(val: any) {
    this.dataList = this.originalDataList.filter((item: any) =>
      JSON.stringify(item).toLowerCase().includes(val.toLowerCase())
    );
  }

  getStatusColor(status: string): string {
    return this.statusColors[status];
  }

  onAgentDetail(element: any) {
    if (element && element?.agent_id) {
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
