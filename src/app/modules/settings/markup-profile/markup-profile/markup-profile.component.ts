import { Routes } from 'app/common/const';
import { Router } from '@angular/router';
import { Security, filter_module_name, markupProfilePermissions, messages, module_name } from 'app/security';
import { Component, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { AgentListDialogComponent } from '../agent-list-dialog/agent-list-dialog.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ToasterService } from 'app/services/toaster.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MarkupprofileService } from 'app/services/markupprofile.service';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { EntityService } from 'app/services/entity.service';
import { PspSettingService } from 'app/services/psp-setting.service';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-markup-profile',
    templateUrl: './markup-profile.component.html',
    styles: [
        `
            .tbl-grid {
                grid-template-columns: 40px 260px 280px 160px;
            }
        `,
    ],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        DatePipe,
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatProgressBarModule,
        MatTableModule,
        MatMenuModule,
        MatDialogModule,
        MatTooltipModule,
        MatDividerModule,
        PrimeNgImportsModule,
        AgentListDialogComponent
    ],
})
export class MarkupProfileComponent
    extends BaseListingComponent
    implements OnDestroy {


    companyList: any[] = [];
    module_name = module_name.markupprofile;
    filter_table_name = filter_module_name.markup_profile;
    private settingsUpdatedSubscription: Subscription;
    dataList = [];
    total = 0;
    isFilterShow: boolean = false;
    columns = [
        {
            key: 'profile_name',
            name: 'Profile Name',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: true,
            applied: false,
            tooltip: true
        },
        {
            key: 'company_name',
            name: 'Company',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            applied: false,
            tooltip: true
        },
        {
            key: 'assigned_to_length',
            name: 'Applied On',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            applied: true,
            tooltip: true
        },


    ];
    cols = [];
    selectedCompany: any;

    constructor(
        private markupprofileService: MarkupprofileService,
        private conformationService: FuseConfirmationService,
        private router: Router,
        public toasterService: ToasterService,
        public entityService: EntityService,
        private pspsettingService: PspSettingService,
        private matDialog: MatDialog,
        public _filterService: CommonFilterService
    ) {
        super(module_name.markupprofile);
        this.cols = this.columns.map((x) => x.key);
        this.key = this.module_name;
        this.sortColumn = 'profile_name';
        this.sortDirection = 'asc';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);
    }

    ngOnInit() {
        this.getCompanyList("");
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
            this.sortColumn = resp['sortColumn'];
            this.primengTable['_sortField'] = resp['sortColumn'];
            if(resp['table_config']['company_name']){
                this.selectedCompany = resp['table_config'].company_name?.value;
            }
            this.primengTable['filters'] = resp['table_config'];
            this.isFilterShow = true;
            this.primengTable._filter();
        });
    }

    ngAfterViewInit(){
        // Defult Active filter show
        if(this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
            this.isFilterShow = true;
            let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
            if(filterData['table_config']['company_name']){
                this.selectedCompany = filterData['table_config'].company_name?.value;
            }
            this.primengTable['filters'] = filterData['table_config'];
        }
      }

    getCompanyList(value) {
        this.pspsettingService.getCompanyCombo(value).subscribe((data) => {
            this.companyList = data;
            for (let i in this.companyList) {
                this.companyList[i].id_by_value = this.companyList[i].company_name
            }
        })
    }

    refreshItems(event?: any): void {
        this.isLoading = true;
        this.markupprofileService
            .getMarkupProfileList(this.getNewFilterReq(event))
            .subscribe({
                next: (data) => {
                    this.isLoading = false;
                    this.dataList = data.data;
                    this.totalRecords = data.total;

                    this.dataList.forEach((row) => {
                        row['assigned_to_length'] = row['assigned_to'].length;
                    });
                },
                error: (err) => {
                    this.toasterService.showToast('error', err)
                    this.isLoading = false;
                },
            });
    }

    createInternal(model): void {
        this.router.navigate([Routes.settings.markupprofile_entry_route]);
    }

    editInternal(record): void {
        this.router.navigate([
            Routes.settings.markupprofile_entry_route + '/' + record.id,
        ]);
    }

    viewInternal(record): void {
        this.router.navigate([
            Routes.settings.markupprofile_entry_route +
            '/' +
            record.id +
            '/readonly',
        ]);
    }

    deleteInternal(record): void {
        const label: string = 'Delete Markup Profile';
        this.conformationService
            .open({
                title: label,
                message:
                    'Are you sure to ' +
                    label.toLowerCase() +
                    ' ' +
                    record.profile_name +
                    ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.markupprofileService.delete(record.id).subscribe({
                        next: () => {
                            this.refreshItems();
                            this.toasterService.showToast(
                                'success',
                                'Markup Profile has been Deleted!'
                            );
                        },
                        error: (err) => {
                            this.toasterService.showToast('error', err)
                            this.isLoading = false;
                        },
                    });
                }
            });
    }

    getNodataText(): string {
        if (this.isLoading) return 'Loading...';
        else if (this.searchInputControl.value)
            return `no search results found for \'${this.searchInputControl.value}\'.`;
        else return 'No data to display';
    }

    opanAgentsListDialog(rowData: any) {
        const assignedToList = rowData['assigned_to'];
        if (assignedToList.length <= 0) return;
        this.entityService.raiseappliedOnCall({ data: assignedToList })
        // this.matDialog.open(AgentListDialogComponent, {
        //     disableClose: true,
        //     data: assignedToList,
        // });
    }

    SetDefault(record): void {
        if (!Security.hasPermission(markupProfilePermissions.setasDefaultPermissions)) {
            return this.toasterService.showToast('error', messages.permissionDenied);
        }

        const label: string = 'Set Default Markup Profile';
        this.conformationService
            .open({
                title: label,


                message:
                    'Are you sure to ' +
                    label.toLowerCase() +
                    ' ' +
                    record.profile_name +
                    ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.markupprofileService.setDefault(record.id).subscribe({
                        next: () => {
                            this.refreshItems();
                            this.toasterService.showToast(
                                'success',
                                'Markup Profile Set as Default!'
                            );
                        },
                        error: (err) => {
                            this.toasterService.showToast('error', err)
                            this.isLoading = false;
                        },
                    });
                }
            });
    }

    ngOnDestroy() {
        if (this.settingsUpdatedSubscription) {
          this.settingsUpdatedSubscription.unsubscribe();
          this._filterService.activeFiltData = {};
        }
      }
}
