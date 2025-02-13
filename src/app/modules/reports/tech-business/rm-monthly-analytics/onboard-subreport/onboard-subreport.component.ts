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

  dataList:any[] = [];
  sortColumn:string = "";
  record:any;
  reqData:any = {};
  originalDataList:any[] = [];

  constructor(
     public matDialogRef: MatDialogRef<OnboardSubreportComponent>,
     @Inject(MAT_DIALOG_DATA) public data: any = {},
     private techService: TechBusinessService,
  ){
    super("");

  };

  ngOnInit(): void {
    if(this.data){
      this.record = this.data;
      this.reqData = {
        rm_id:  this.record.rm_id,
        from_date: this.record.date,
        type: this.record.type,
        columeFilters: {},
        Filter:""
      }

      this.refreshItems()
    }
  }
  
  refreshItems(event?:any): void {
    this.techService.onboardReport(this.reqData).subscribe({
      next: (resp:any) => {
        this.dataList = resp.data;
        this.originalDataList = resp.data;
        this.totalRecords = this.dataList.length;
        this.isLoading = false;
      },
      error: (err) => {
        this.alertService.showToast('error', err);
        this.isLoading = false;
      }
    });
  }

  onGlobalFilterSearch(val:any){
    this.dataList = this.originalDataList.filter((item:any) =>
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
