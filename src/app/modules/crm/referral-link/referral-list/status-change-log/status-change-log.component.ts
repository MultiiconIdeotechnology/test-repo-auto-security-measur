import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RefferralService } from 'app/services/referral.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BaseListingComponent } from 'app/form-models/base-listing';

@Component({
  selector: 'app-status-change-log',
  standalone: true,
  imports: [
    CommonModule,
    PrimeNgImportsModule,
    MatIconModule,
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './status-change-log.component.html',
  styleUrls: ['./status-change-log.component.scss']
})
export class StatusChangeLogComponent  extends BaseListingComponent implements OnInit {
  isLoading: boolean = false;
  dataList: any[] = [];
  originalDataList: any[] = [];
  totalRecords: number = 0;
  isFilterShow:boolean = false;
  sortColumn: string = "entry_date_time";

   statusList: any = [
        { label: 'Live', value: 'Live' },
        { label: 'Pause', value: 'Pause' }
    ];

    statusColorMap: any = {
        'Live': 'text-green-600',
        'Pause': 'text-red-600'
    }

  constructor(
    private refferralService: RefferralService,
    public matDialogRef: MatDialogRef<StatusChangeLogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) { 
    super('')
  }

  ngOnInit(): void {
    this.refreshItems()
  }

   refreshItems(event?: any): void {
    this.isLoading = true;
    let payload = this.getNewFilterReq(event);
    payload.module_for_id = this.data.id,
    payload.module_for = 'Referral Link';

    this.refferralService.statusChange(payload).subscribe({
      next: data => {
        this.isLoading = false;
        this.dataList = data.data;
        this.originalDataList = data.data;
        this.dataList.forEach((item: any) => item.entry_date_time = new Date(item.entry_date_time))
        this.totalRecords = data.total;
      }, error: err => {
        this.isLoading = false;
      }
    })
   }

  onGlobalFilterSearch(val: any) {
    this.dataList = this.originalDataList.filter((item: any) =>
      JSON.stringify(item).toLowerCase().includes(val.toLowerCase())
    );
  }

  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }

}
