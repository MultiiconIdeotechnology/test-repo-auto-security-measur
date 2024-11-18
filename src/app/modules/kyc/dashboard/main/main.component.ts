import { NgIf, NgFor, DatePipe, CommonModule } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { KycInfoComponent } from 'app/modules/masters/agent/kyc-info/kyc-info.component';
import { Security, kycDashboardPermissions, module_name } from 'app/security';
import { KycDashboardService } from 'app/services/kyc-dashboard.service';
import { AgentKycComponent } from "../agent-kyc/agent-kyc.component";
import { Router } from '@angular/router';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styles: [`
  .tbl-grid {
    grid-template-columns:  40px 200px 220px 150px 200px ;
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
        CommonModule,
        AgentKycComponent,
        MatTabsModule
    ]
})
export class MainComponent {

  @Input() activeTab: any;
  constructor(private router: Router) { }


  // public getTabsPermission(tab: string): boolean {
  //   if (tab == 'Agent')
  //     return Security.hasPermission(kycDashboardPermissions.agentKYCTabPermissions)
  //   if (tab == 'Supplier')
  //     return Security.hasPermission(kycDashboardPermissions.supplierKYCTabPermissions)
  //   if (tab == 'Employee')
  //     return Security.hasPermission(kycDashboardPermissions.employeeKYCTabPermissions)
  // }

  public tabChanged(event: any): void {
    if (event?.index == 0) {
        this.router.navigateByUrl('/kyc/dashboard');
    } else if (event?.index == 1) {
        this.router.navigateByUrl('/kyc/dashboard/supplier');
    } else {
        this.router.navigateByUrl('/kyc/dashboard');
    }
}

  
}