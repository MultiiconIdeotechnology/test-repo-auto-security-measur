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
import { Router, RouterOutlet } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { module_name } from 'app/security';
import { AgentService } from 'app/services/agent-balance.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
  selector: 'app-agent-balance',
  templateUrl: './agent-balance.component.html',
  styleUrls: ['./agent-balance.component.scss'],
  styles: [`
  .tbl-grid {
    grid-template-columns: 40px 240px 100px 110px 110px 180px 130px 200px 180px;
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
export class AgentBalanceComponent extends BaseListingComponent implements OnDestroy {

  dataList = [];
  total = 0;
  module_name = module_name.agentBalance


  constructor(
    private AgentService: AgentService,
    private confirmService: FuseConfirmationService,
    private router: Router,
    private matDialog: MatDialog,
    // private clipboard: Clipboard
  ) {
    super(module_name.agentBalance)
    this.cols = this.columns.map(x => x.key);
    this.key = 'payment_request_date';
    this.sortColumn = 'last_top_up';
    this.sortDirection = 'desc';
    this.Mainmodule = this;
  }

  columns = [
    { key: 'agent_name', name: 'Agent', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: true, is_boolean: false, tooltip: true, isview: true },
    { key: 'currency', name: 'Currency', is_date: false, date_formate: '', is_sortable: true, class: 'header-center-view', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'balance', name: 'Balance', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true, iscolor: false, isFix: true },
    { key: 'credit', name: 'Credit', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true, isFix: true },
    { key: 'rm', name: 'RM', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'mobile', name: 'Mobile', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false, isamount: true },
    { key: 'email', name: 'Email', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'last_top_up', name: 'Last Top-up', is_date: true, date_formate: 'dd-MM-yyyy HH:mm:ss', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
  ]
  cols = [];

  refreshItems(): void {
    this.isLoading = true;
    this.AgentService.getWalletReportList(this.getFilterReq()).subscribe({
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
