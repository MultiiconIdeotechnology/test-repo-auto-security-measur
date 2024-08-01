import { NgIf, NgFor, DatePipe, CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { KycInfoComponent } from 'app/modules/masters/agent/kyc-info/kyc-info.component';
import { LeadEntryComponent } from 'app/modules/masters/lead/lead-entry/lead-entry.component';
import { Security, kycDashboardPermissions, messages, module_name } from 'app/security';
import { KycDashboardService } from 'app/services/kyc-dashboard.service';
import { LeadsService } from 'app/services/leads.service';

@Component({
  selector: 'app-agent-kyc',
  templateUrl: './agent-kyc.component.html',
  styleUrls: ['./agent-kyc.component.scss'],
  styles: [`
  .tbl-grid {
    grid-template-columns:  40px 200px 200px 200px 220px 150px 200px 200px ;
  }
  `],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    DatePipe,
    ReactiveFormsModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatMenuModule,
    MatDialogModule,
    MatTooltipModule,
    MatDividerModule,
    CommonModule
  ]

})
export class AgentKycComponent extends BaseListingComponent implements OnDestroy  {

  total = 0;
  dataList = [];


  module_name = module_name.agentkyc
  columns = [
    { key: 'agency_name', name: 'Agent', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false,  align: '', indicator: false, tooltip: true },
    { key: 'kyc_profile', name: 'KYC Profile', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false,  align: '', indicator: false , tooltip: true},
    { key: 'relation_manager', name: 'RM', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false,  align: '', indicator: false , tooltip: true},
    { key: 'email_address', name: 'Email', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false,  align: '', indicator: false , tooltip: true},
    { key: 'mobile_number', name: 'Mobile', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false,  align: '', indicator: false },
    { key: 'city_name', name: 'City', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false,  align: '', indicator: false },
    { key: 'entry_date_time', name: 'Date', is_date: true, date_formate: 'dd-MM-yyyy HH:mm:ss', is_sortable: true, class: '', is_sticky: false,  align: '', indicator: false},

  ]
  cols = [];

  constructor(
    private kycDashboardService: KycDashboardService,
    private conformationService: FuseConfirmationService,
    private matDialog: MatDialog,
  ) {
    super(module_name.agentkyc)
    this.cols = this.columns.map(x => x.key);
    this.key = this.module_name;
    this.sortColumn = 'entry_date_time';
    this.sortDirection = 'desc';
    this.Mainmodule = this
  }

  viewInternal(record){
    this.matDialog.open(LeadEntryComponent, {
      data: { data: record, title: 'Agent Info', readonly: true },
      disableClose: true
    })
  }

  refreshItems(): void {
    this.isLoading = true;
    this.kycDashboardService.getAgentLeadKycList(this.getFilterReq()).subscribe({
      next: data => {
        this.isLoading = false;
        this.dataList = data.data;
        this._paginator.length = data.total;
        this.total = data.total;

      }, error: err => {
        this.isLoading = false;
      }
    })
  }

  setKYCVerify(record): void {
    if (!Security.hasPermission(kycDashboardPermissions.agentViewKYCPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }
    
    this.matDialog.open(KycInfoComponent, {
      data: {record:record,agent:true, isLead : 'Lead', isMaster : record.is_master_agent, send: 'agentKYC'},
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {
        // this.agentService.setMarkupProfile(record.id, res.transactionId).subscribe({
        //   next: () => {
        //     // record.is_blocked = !record.is_blocked;
        //     this.alertService.showToast('success', "The markup profile has been set", "top-right", true);
        //   }
        // })
      }
    })
  }

  leadConverter(record): void {
    if (!Security.hasPermission(kycDashboardPermissions.agentConvertToTAPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }
    
    const label: string = 'Convert to Travel Agent'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ?'
    }).afterClosed().subscribe(res => {
      if (res === 'confirmed') {
        this.kycDashboardService.leadConvert(record.id).subscribe({
          next: (res) => {
            // record.is_blocked = !record.is_blocked;
            this.alertService.showToast('success', "Lead has been Converted to travel agent!", "top-right", true);
            this.refreshItems();
          },error:(err) => {
            this.alertService.showToast('error', err, "top-right", true);
            
          },
        })
      }
    })
  }

  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }

  ngOnDestroy(): void {
    this.masterService.setData(this.key, this)
  }

}
