import { NgIf, NgFor, DatePipe, CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { BaseListingComponent, Column } from 'app/form-models/base-listing';
import { PSPPermissions, Security, filter_module_name, messages, module_name } from 'app/security';
import { PspSettingService } from 'app/services/psp-setting.service';
import { ToasterService } from 'app/services/toaster.service';
import { PspEntryComponent } from '../psp-entry/psp-entry.component';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-psp-list',
  templateUrl: './psp-list.component.html',
  styleUrls: ['./psp-list.component.scss'],
  styles: [
    `
        .tbl-grid {
            grid-template-columns: 40px 150px 80px 120px 180px;
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
    MatMenuModule,
    MatDialogModule,
    MatTooltipModule,
    MatDividerModule,
    PrimeNgImportsModule
  ],
})
export class PspListComponent extends BaseListingComponent {

  module_name = module_name.pspsetting;
  filter_table_name = filter_module_name.psp;
  private settingsUpdatedSubscription: Subscription;
  dataList = [];
  total = 0;

  cols: Column[] = [
    { field: 'api_for', header: 'Api For' },
  ];
  _selectedColumns: Column[];
  isFilterShow: boolean = false;

  constructor(
    private pspsettingService: PspSettingService,
    private conformationService: FuseConfirmationService,
    private matDialog: MatDialog,
    private toasterService: ToasterService,
    public _filterService: CommonFilterService
  ) {
    super(module_name.pspsetting);
    this.key = this.module_name;
    this.sortColumn = 'provider';
    this.sortDirection = 'asc';
    this.Mainmodule = this;
    this._filterService.applyDefaultFilter(this.filter_table_name);
  }

  ngOnInit() {
    this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
        // this.sortColumn = resp['sortColumn'];
        // this.primengTable['_sortField'] = resp['sortColumn'];
        this.primengTable['filters'] = resp['table_config'];
        this._selectedColumns = resp['selectedColumns'] || [];
        this.isFilterShow = true;
        this.primengTable._filter();
    });
  }

  ngAfterViewInit(){
    // Defult Active filter show
    if(this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
        let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
        this.primengTable['filters'] = filterData['table_config'];
        this._selectedColumns = filterData['selectedColumns'] || [];
        this.isFilterShow = true;
    }
  }

  get selectedColumns(): Column[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: Column[]) {
    if (Array.isArray(val)) {
      this._selectedColumns = this.cols.filter(col =>
        val.some(selectedCol => selectedCol.field === col.field)
      );
    } else {
      this._selectedColumns = [];
    }
  }


  refreshItems(event?: any): void {
    this.isLoading = true;
    this.pspsettingService
      .getPaymentGatewayList(this.getNewFilterReq(event))
      .subscribe({
        next: (data) => {
          this.isLoading = false;
          this.dataList = data.data;
          this.totalRecords = data.total;
        },
        error: (err) => {
          this.toasterService.showToast('error', err)
          this.isLoading = false;
        },
      });
  }

  createInternal(model): void {
    this.matDialog
      .open(PspEntryComponent, {
        data: null,
        disableClose: true,
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.alertService.showToast(
            'success',
            'New record added',
            'top-right',
            true
          );
          this.refreshItems();
        }
      });
  }

  editInternal(record): void {
    this.matDialog
      .open(PspEntryComponent, {
        data: { data: record, readonly: false },
        disableClose: true,
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.alertService.showToast(
            'success',
            'Record modified',
            'top-right',
            true
          );
          this.refreshItems();
        }
      });
  }

  viewInternal(record): void {
    this.matDialog.open(PspEntryComponent, {
      data: { data: record, readonly: true },
      disableClose: true,
    });
  }

  deleteInternal(record): void {
    const label: string = 'Delete PSP';
    this.conformationService
      .open({
        title: label,
        message:
          'Are you sure to ' +
          label.toLowerCase() +
          ' ' +
          record.provider +
          ' ?',
      })
      .afterClosed()
      .subscribe((res) => {
        if (res === 'confirmed') {
          this.pspsettingService.delete(record.id).subscribe({
            next: () => {
              this.toasterService.showToast(
                'success',
                'PSP has been Deleted!',
                'top-right',
                true
              );
              this.refreshItems();
            },
            error: (err) => {
              this.toasterService.showToast('error', err)
              this.isLoading = false;
            },
          });
        }
      });
  }

  SetDefault(record): void {
    if (!Security.hasPermission(PSPPermissions.setDefaultPermissions)) {
      return this.toasterService.showToast('error', messages.permissionDenied);
    }

    const label: string = 'Set Default PSP';
    this.conformationService
      .open({
        title: label,
        message:
          'Are you sure to ' +
          label.toLowerCase() +
          ' ' +
          record.provider +
          ' ?',
      })
      .afterClosed()
      .subscribe((res) => {
        if (res === 'confirmed') {
          this.pspsettingService.setDefault(record.id).subscribe({
            next: () => {
              this.refreshItems();
              this.toasterService.showToast(
                'success',
                'PSP as Default!'
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

  SetActive(record): void {
    if (!Security.hasPermission(PSPPermissions.enableDisablePermissions)) {
      return this.toasterService.showToast('error', messages.permissionDenied);
    }

    const label: string = 'Set Default PSP';
    this.conformationService
      .open({
        title: label,
        message:
          'Are you sure to ' +
          label.toLowerCase() +
          ' ' +
          record.provider +
          ' ?',
      })
      .afterClosed()
      .subscribe((res) => {
        if (res === 'confirmed') {
          this.pspsettingService.setDefault(record.id).subscribe({
            next: () => {
              this.refreshItems();
              this.toasterService.showToast(
                'success',
                'PSP as Default!'
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

  setActiveDeactive(record): void {
    const label: string = record.is_active
      ? 'Deactive PSP'
      : 'Active PSP';
    this.conformationService
      .open({
        title: label,
        message:
          'Are you sure to ' +
          label.toLowerCase() +
          ' ' +
          record.provider +
          ' ?',
      })
      .afterClosed()
      .subscribe((res) => {
        if (res === 'confirmed') {
          this.pspsettingService
            .setActiveDeactive(record.id)
            .subscribe({
              next: () => {
                record.is_active = !record.is_active;
                if (record.is_active) {
                  this.alertService.showToast(
                    'success',
                    'PSP has been Active!',
                    'top-right',
                    true
                  );
                  this.refreshItems();

                } else {
                  this.alertService.showToast(
                    'success',
                    'PSP has been Deactive!',
                    'top-right',
                    true
                  );
                  this.refreshItems();

                }
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

  ngOnDestroy() {
    if (this.settingsUpdatedSubscription) {
      this.settingsUpdatedSubscription.unsubscribe();
      this._filterService.activeFiltData = {};
    }
  }
}
