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
import { Security, leadPermissions, leadRegisterPermissions, messages, module_name } from 'app/security';
import { LeadsRegisterService } from 'app/services/leads-register.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { FilterComponent } from './filter/filter.component';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { RmdialogComponent } from './rmdialog/rmdialog.component';
import { CallHistoryComponent } from 'app/modules/crm/lead/call-history/call-history.component';
import { ReshuffleComponent } from 'app/modules/masters/agent/reshuffle/reshuffle.component';
import { RMLogsComponent } from './rmlogs/rmlogs.component';
import { Excel } from 'app/utils/export/excel';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-lead-register',
  templateUrl: './lead-register.component.html',
  styleUrls: ['./lead-register.component.scss'],
  styles: [`
  .tbl-grid {
    grid-template-columns: 40px 50px 110px 80px 190px 160px 130px 110px 180px 210px 120px 130px 120px 130px 120px 120px;
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
export class LeadRegisterComponent extends BaseListingComponent implements OnDestroy {

  dataList = [];
  total = 0;
  module_name = module_name.leads_register
  leadFilter: any;

  constructor(
    private confirmService: FuseConfirmationService,
    private router: Router,
    private leadsRegisterService: LeadsRegisterService,
    private matDialog: MatDialog,

    // private clipboard: Clipboard
  ) {
    super(module_name.leads_register)
    this.cols = this.columns.map(x => x.key);
    this.key = this.module_name;
    this.sortColumn = 'leadDate';
    this.sortDirection = 'desc';
    this.Mainmodule = this;

    this.leadFilter = {
      lead_type: 'All',
      lead_status: 'All',
      priority_text: 'All',
      relationship_manager_id: '',
      KYC_Status: 'All',
      lead_source: '',
    };
  }

  columns = [
    { key: 'calls', name: 'Calls', callAction: true, tocalls: true, is_date: false, date_formate: '', is_sortable: false, class: '', is_sticky: false, indicator: true, is_boolean: false, tooltip: true },
    { key: 'status', name: 'Status', toColor: true, is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'priority_text', name: 'Priority', toColorP: true, is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false, iscolor: false },
    { key: 'agency_name', name: 'Agency', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'rmName', name: 'RM', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'lead_type', name: 'Type', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false, isamount: true },
    { key: 'lead_source', name: 'Source', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
    { key: 'contact_person_name', name: 'Contact Person', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'contact_person_email', name: 'Email', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'contact_person_mobile', name: 'Mobile', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
    { key: 'cityName', name: 'City', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'kycStarted', name: 'KYC Started', isLive: true, is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
    { key: 'lastCallFeedback', name: 'Last Feedback', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
    { key: 'lastCall', name: 'Last Call', isDate: true, is_date: true, date_formate: 'dd-MM-yyyy', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
    { key: 'leadDate', name: 'Lead Date', is_date: true, date_formate: 'dd-MM-yyyy', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
  ]
  cols = [];

  getFilter(): any {
    const filterReq = GridUtils.GetFilterReq(
      this._paginator,
      this._sort,
      this.searchInputControl.value
    );

    filterReq['lead_type'] = this.leadFilter?.lead_type == 'All' ? '' : this.leadFilter?.lead_type;
    filterReq['priority_text'] = this.leadFilter?.priority_text == 'All' ? '' : this.leadFilter?.priority_text;
    filterReq['relationship_manager_id'] = this.leadFilter?.relationship_manager_id?.id || '';
    filterReq['lead_status'] = this.leadFilter?.lead_status == 'All' ? '' : this.leadFilter?.lead_status;
    filterReq['lead_source'] = this.leadFilter?.lead_source.lead_source == 'All' ? '' : this.leadFilter?.lead_source.lead_source || '';
    filterReq['KYC_Status'] = this.leadFilter?.KYC_Status == 'All' ? '' : this.leadFilter?.KYC_Status;
    return filterReq;
  }

  refreshItems(): void {
    this.isLoading = true;
    this.leadsRegisterService.leadMasterRegisterList(this.getFilter()).subscribe({
      next: (data) => {
        this.dataList = data.data;
        this.total = data.total;
        this._paginator.length = data.total
        this.isLoading = false;
      }, error: (err) => {
        this.alertService.showToast('error', err)
        this.isLoading = false
      }
    });
  }

  filter() {
    this.matDialog
      .open(FilterComponent, {
        data: this.leadFilter,
        disableClose: true,
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.leadFilter = res;
          this.refreshItems();
        }
      });
  }

  callHistory(record): void {
    if (!Security.hasPermission(leadRegisterPermissions.callHistoryPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }
    if (record?.calls > 0) {
      this.matDialog.open(CallHistoryComponent, {
        data: { data: record, readonly: true },
        disableClose: true
      });
    }
  }

  reShuffle() {
    if (!Security.hasPermission(leadRegisterPermissions.reshufflePermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    this.matDialog.open(ReshuffleComponent, {
      data: 'Lead',
      disableClose: true,
    }).afterClosed().subscribe(res => {
      if (res) {
        // this.agentFilter = res;
        // this.refreshItems();
      }
    })
  }

  getStatusColor(status: string): string {
    if (status == 'Converted' || status == 'Live') {
      return 'text-green-600';
    } else if (status == 'Dead') {
      return 'text-red-600';
    } else if (status == 'New') {
      return 'text-yellow-600';
    } else {
      return '';
    }
  }

  getStatusColorP(status: string): string {
    if (status == 'Low') {
      return 'text-pink-600';
    } else if (status == 'High') {
      return 'text-red-600';
    } else if (status == 'Medium') {
      return 'text-yellow-600';
    } else {
      return '';
    }
  }

  relationahipManager(record): void {
    if (!Security.hasPermission(leadRegisterPermissions.relationshipManagerPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    this.matDialog.open(RmdialogComponent, {
      data: record,
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {

        const json = {
          id: record.id,
          relationship_manager_id: res.empId
        }
        this.leadsRegisterService.leadRMChange(json).subscribe({
          next: () => {
            this.alertService.showToast('success', "Relationship Manager Changed!");
            this.refreshItems()
          },
          error: (err) => {
            this.alertService.showToast('error', err, 'top-right', true);
          },
        })
      }
    })
  }

  relationahipManagerLog(record): void {
    if (!Security.hasPermission(leadRegisterPermissions.relationshipManagerLogsPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    this.matDialog.open(RMLogsComponent, {
      data: record,
      disableClose: true
    });
  }

  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }

  exportExcel(): void {
    if (!Security.hasExportDataPermission(module_name.leads_register)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    const filterReq = GridUtils.GetFilterReq(this._paginator, this._sort, this.searchInputControl.value,'leadDate',1);
    filterReq['take'] = this._paginator.length;
    filterReq['lead_type'] = this.leadFilter?.lead_type == 'All' ? '' : this.leadFilter?.lead_type;
    filterReq['priority_text'] = this.leadFilter?.priority_text == 'All' ? '' : this.leadFilter?.priority_text;
    filterReq['relationship_manager_id'] = this.leadFilter?.relationship_manager_id?.id || '';
    filterReq['lead_status'] = this.leadFilter?.lead_status == 'All' ? '' : this.leadFilter?.lead_status;
    filterReq['lead_source'] = this.leadFilter?.lead_source.lead_source == 'All' ? '' : this.leadFilter?.lead_source.lead_source || '';
    filterReq['KYC_Status'] = this.leadFilter?.KYC_Status == 'All' ? '' : this.leadFilter?.KYC_Status;

    this.leadsRegisterService.leadMasterRegisterList(filterReq).subscribe(data => {
      for (var dt of data.data) {
        dt.lastCall = DateTime.fromISO(dt.lastCall).toFormat('dd-MM-yyyy')
        dt.leadDate = DateTime.fromISO(dt.leadDate).toFormat('dd-MM-yyyy')
        dt.kycStarted = dt.kycStarted? 'Yes' : 'No'
      }
      Excel.export(
        'Leads Register',
        [
          { header: 'Calls', property: 'calls' },
          { header: 'Status', property: 'status' },
          { header: 'Priority', property: 'priority_text' },
          { header: 'Agency', property: 'agency_name' },
          { header: 'RM', property: 'rmName' },
          { header: 'Type', property: 'lead_type' },
          { header: 'Source', property: 'lead_source' },
          { header: 'Contact Person', property: 'contact_person_name' },
          { header: 'Email', property: 'contact_person_email' },
          { header: 'Mobile', property: 'contact_person_mobile' },
          { header: 'City', property: 'cityName' },
          { header: 'KYC Started', property: 'kycStarted' },
          { header: 'Last Feedback', property: 'lastCallFeedback' },
          { header: 'Last Call', property: 'lastCall' },
          { header: 'Lead Date', property: 'leadDate' },
          
        ],
        data.data, "Leads Register", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 14 } }]);
    });
  }
}
