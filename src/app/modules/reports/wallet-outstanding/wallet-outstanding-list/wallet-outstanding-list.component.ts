import { NgIf, NgFor, DatePipe, CommonModule, NgClass } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
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
import { RouterOutlet, Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { module_name } from 'app/security';
import { WalletOutstandingService } from 'app/services/wallet-outstanding.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
  selector: 'app-wallet-outstanding-list',
  templateUrl: './wallet-outstanding-list.component.html',
  styleUrls: ['./wallet-outstanding-list.component.scss'],
  styles: [`
  .tbl-grid {
    grid-template-columns: 40px 240px 200px 110px 210px 120px 140px 150px 180px 130px 150px;
  }
  `],
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
  ],
})
export class WalletOutstandingListComponent extends BaseListingComponent implements OnDestroy{

  dataList = [];
  total = 0;
  module_name = module_name.walletOutstanding


  constructor(
    private confirmService: FuseConfirmationService,
    private router: Router,
    private walletOutstandingService: WalletOutstandingService,
    private matDialog: MatDialog,
    // private clipboard: Clipboard
  ) {
    super(module_name.walletOutstanding)
    this.cols = this.columns.map(x => x.key);
    this.key = 'payment_request_date';
    this.sortColumn = 'due_date';
    this.sortDirection = 'asc';
    this.Mainmodule = this;
  }

  columns = [
    { key: 'agency_name', name: 'Agent', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: true, is_boolean: false, tooltip: true },
    { key: 'employee_name', name: 'RM', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'mobile_number', name: 'Mobile', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false, iscolor: false },
    { key: 'email_address', name: 'Email', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'credit_balance', name: 'Credit', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
    { key: 'payment_cycle_policy', name: 'Payment Cycle', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false, isamount: true },
    { key: 'payment_cycle_policy_type', name: 'Payment Policy', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
    { key: 'due_date', name: 'Due Date', is_date: true, date_formate: 'dd-MM-yyyy HH:mm:ss', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
    { key: 'outstanding_on_due_date', name: 'Outstanding', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
    { key: 'over_due_count', name: 'Over Due Count', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
  ]
  cols = [];

  refreshItems(): void {
    this.isLoading = true;
    this.walletOutstandingService.getWalletOutstanding(this.getFilterReq()).subscribe({
      next: (data) => {
        this.dataList = data.data;
        this.total = data.total;
        this.isLoading = false;
      }, error: (err) => {
        this.alertService.showToast('error', err)
        this.isLoading = false}
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
