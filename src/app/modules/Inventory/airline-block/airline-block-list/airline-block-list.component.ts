import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { ToasterService } from 'app/services/toaster.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Subscription } from 'rxjs';
import { Linq } from 'app/utils/linq';
import { AirlineBlockService } from 'app/services/airline-block.service';
import { MatDividerModule } from '@angular/material/divider';
import { Security, filter_module_name, inventoryAirlineBlockPermissions, messages, module_name } from 'app/security';

@Component({
  selector: 'app-airline-block-list',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    NgFor,
    DatePipe,
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
    MatDividerModule,
    NgClass,
    RouterOutlet,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    NgxMatSelectSearchModule,
    PrimeNgImportsModule,
  ],
  templateUrl: './airline-block-list.component.html',
  styleUrls: ['./airline-block-list.component.scss']
})
export class AirlineBlockListComponent extends BaseListingComponent {

  module_name = module_name.airlineBlock;
  filter_table_name = filter_module_name.airline_block;
  private settingsUpdatedSubscription: Subscription;
  dataList = [];
  is_bonton_supplier: boolean = false;
  total = 0;
  _selectedColumns: any;
  isFilterShow: boolean;
  selectedSupplier: any;
  supplierList: any[] = [];

  initialOrderVal: number = 0;
  actionList: any[] = [
    { label: 'Publish', value: true },
    { label: 'Unpublish', value: false },
  ];

  popularActionList: any[] = [
    { label: 'Popular', value: true },
    { label: 'Unpopular', value: false },
  ];

  cols = [
    { field: 'cabin_baggage', header: 'Cabin Baggage', isDate: false, type: 'text' },
    { field: 'checkin_baggage', header: 'CheckIn Baggage', isDate: false, type: 'text' },
    { field: 'modify_date_time', header: 'Modify Date', isDate: true, type: 'date' }
  ]

  constructor(
    private matDialog: MatDialog,
    private airlineBlockService: AirlineBlockService,
    private toasterService: ToasterService,
    public _filterService: CommonFilterService,
    private conformationService: FuseConfirmationService,
  ) {
    super(module_name.airlineBlock);
    this.key = this.module_name;
    this.sortColumn = 'departure_date_time';
    this.sortDirection = 'asc';
    this.Mainmodule = this;
    this._filterService.applyDefaultFilter(this.filter_table_name);
  }

  ngOnInit() {
    this.getSupplierList('');
    // common filter
    this._filterService.selectionDateDropdown = "";
    this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp: any) => {
      this._filterService.selectionDateDropdown = "";

      if (resp['table_config']['entry_date_time']?.value != null) {
        resp['table_config']['entry_date_time'].value = new Date(resp['table_config']['entry_date_time'].value);
      }

      this.primengTable['filters'] = resp['table_config'];
      this.isFilterShow = true;
      this.primengTable._filter();
    });

  }

  ngAfterViewInit() {
    // Defult Active filter show
    if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
      let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);

      if (filterData['table_config']['entry_date_time']?.value != null) {
        filterData['table_config']['entry_date_time'].value = new Date(filterData['table_config']['entry_date_time'].value);
      }
      this.primengTable['filters'] = filterData['table_config'];
      this.isFilterShow = true;
    }
  }

  // Api to get the Supplier list data
  getSupplierList(value) {
    this.airlineBlockService.getSupplierBoCombo('Airline Block').subscribe((data: any) => {
      this.supplierList = data;
      for (let i in this.supplierList) {
        this.supplierList[i].id_by_value = this.supplierList[i].company_name
      }
    })
  }


  viewDetails(record: any): void {
   if (!Security.hasPermission(inventoryAirlineBlockPermissions.viewAirlineBlockPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }
    const queryParams: any = {
      id: record.id,
      trip_type: "One Way",
      origin: record.origin,
      destination: record.destination,
      departure_date: encodeURIComponent(record.departure_date_time),
      flight_type: record?.flight_type ?? '',
      Adult: 1,
      Child: 0,
      Infant: 0,
    };

    Linq.recirect('/inventory/airline-block/view-details', queryParams);
  }

  deleteInternal(record, index): void {
    if (!Security.hasPermission(inventoryAirlineBlockPermissions.deletePermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }
    const label: string = 'Delete Airline Block'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.origin + ' to ' + record.destination + ' ?'
    }).afterClosed().subscribe(res => {
      if (res === 'confirmed') {
        this.airlineBlockService.delete(record.id).subscribe({
          next: () => {
            this.alertService.showToast('success', "Airline Block has been deleted!", "top-right", true);
            this.dataList.splice(index, 1);
            this.totalRecords--;
          }, error: (err) => {
            this.alertService.showToast('error', err, 'top-right', true);
          }
        })
      }
    })
  }

  publishBonton(record) {
    if (!Security.hasPermission(inventoryAirlineBlockPermissions.publishUnpublishPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }
    if (!record.is_audited) {
      this.alertService.showToast('error', 'Airline Block must be audited before it can be published.');
      return;
    }
    const label: string = record.is_publish_for_bonton
      ? 'Unpublish Airline Block'
      : 'Publish Airline Block';
    this.conformationService
      .open({
        title: label,
        message:
          'Are you sure to ' +
          label.toLowerCase() +
          ' ?',
      })
      .afterClosed()
      .subscribe((res) => {
        if (res === 'confirmed') {
          this.airlineBlockService.setPublishUnpublishBonton(record.id).subscribe({
            next: () => {
              record.is_publish_for_bonton = !record.is_publish_for_bonton;
              if (record.is_publish_for_bonton) {
                this.alertService.showToast(
                  'success',
                  'Airline Block has been Publish!',
                  'top-right',
                  true
                );
              } else {
                this.alertService.showToast(
                  'success',
                  'Airline Block has been Unpublish!',
                  'top-right',
                  true
                );
              }
            },
          });
        }
      });
  }

  refreshItems(event?: any) {
    this.isLoading = true;

    this.airlineBlockService.getAirlineBlockList(this.getNewFilterReq(event)).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.dataList = data?.data;
        this.dataList.forEach((item: any) => item.isEditing = false)
        this.is_bonton_supplier = data?.is_bonton_supplier;
        this.totalRecords = data.total;
        if (this.dataList && this.dataList.length) {
          setTimeout(() => {
            this.isFrozenColumn('', ['is_publish_for_bonton', 'is_publish_for_wl']);
          }, 200);
        }
      },
      error: (err) => {
        this.toasterService.showToast('error', err)
        this.isLoading = false;
      },
    });
  }

  Audit(data: any): void {
    if (!Security.hasPermission(inventoryAirlineBlockPermissions.auditUnauditPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    const label: string = data.is_audited ? 'UnAudit Airline Block' : 'Audit Airline Block';
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ?'
    }).afterClosed().subscribe({
      next: (res) => {
        if (res === 'confirmed') {
          this.airlineBlockService.setAuditUnaudit(data.id).subscribe({
            next: (res) => {
              if (res && res['status']) {
                if (!data.is_audited) {
                  this.alertService.showToast('success', "Airline Block Audited", "top-right", true);
                } else {
                  this.alertService.showToast('success', "Airline Block UnAudited", "top-right", true);
                }

                data.is_audited = !data.is_audited;
              }

            }, error: (err) => this.alertService.showToast('error', err, "top-right", true)
          });
        }
      }
    })

  }

  ngOnDestroy(): void {
    if (this.settingsUpdatedSubscription) {
      this.settingsUpdatedSubscription.unsubscribe();
      this._filterService.activeFiltData = {};
    }
  }

}
