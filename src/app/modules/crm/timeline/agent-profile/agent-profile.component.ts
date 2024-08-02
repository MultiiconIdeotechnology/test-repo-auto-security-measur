import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe, CommonModule } from '@angular/common';
import { Component, Inject, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import { Security, agentsPermissions, messages, module_name } from 'app/security';
import { ToasterService } from 'app/services/toaster.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { CrmService } from 'app/services/crm.service';
import { KycInfoComponent } from 'app/modules/masters/agent/kyc-info/kyc-info.component';

@Component({
    selector: 'app-crm-agent-profile',
    templateUrl: './agent-profile.component.html',
    styleUrls: ['./agent-profile.component.scss'],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        DatePipe,
        AsyncPipe,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
        MatSlideToggleModule,
        NgxMatSelectSearchModule,
        MatTooltipModule,
        MatAutocompleteModule,
        RouterOutlet,
        MatOptionModule,
        MatDividerModule,
        MatSortModule,
        MatTableModule,
        MatPaginatorModule,
        MatMenuModule,
        MatDialogModule,
        CommonModule,
        MatTabsModule,
        MatCheckboxModule
    ]
})
export class CRMAgentProfileComponent {
    dataList: any;
    searchInputControl = new FormControl('');
    @ViewChild('tabGroup') tabGroup;

    title = "Agent Profile";
    Mainmodule: any;
    isLoading = false;
    public key: any;
    public sortColumn: any;
    public sortDirection: any;

    module_name = module_name.crmagent
    record: any = {};

    constructor(
        public alertService: ToasterService,
        public crmService: CrmService,
        private matDialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any = {}
    ) {
        this.key = this.module_name;
        this.sortColumn = '';
        this.sortDirection = '';
        this.Mainmodule = this
        this.record = data
    }

    ngOnInit(): void {
        this.refreshItems();
    }

    refreshItems(): void {
        this.crmService.getAgentProfile(this.record?.data?.agentid).subscribe({
            next: (data) => {
                this.isLoading = false;
                this.dataList = data;
            },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
                this.isLoading = false;
            },
        });
    }

    kycViewDetails(record): void {
        if (!Security.hasPermission(agentsPermissions.viewKYCPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(KycInfoComponent, {
            data: { record: record, agent: true, isKycViewDetail: true },
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
}
