import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { DatePipe } from '@angular/common';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { WalletService } from 'app/services/wallet-credit.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-credit-logs',
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
  templateUrl: './credit-logs.component.html',
  styleUrls: ['./credit-logs.component.scss']
})
export class CreditLogsComponent extends BaseListingComponent {

  dataList: any[] = [];
  sortColumn: string = "activity_date_time";
  record: any;
  originalDataList: any[] = [];
  isFilterShow: boolean = false;

  constructor(
    public matDialogRef: MatDialogRef<CreditLogsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any = {},
    private walletCreditService: WalletService,
  ) {
    super("");
  };

  ngOnInit(): void {
    if (this.data) {
      this.record = this.data;
      this.refreshItems();
    }
  }

  refreshItems(event?: any): void {
  
      this.walletCreditService.getCreditActivity({Id: this.record?.id}).subscribe({
        next: (resp: any) => {
          this.dataList = resp;
          this.dataList.forEach((item: any) => item.activity_date_time = new Date(item.activity_date_time))
          this.originalDataList = resp;
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

  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }

}
