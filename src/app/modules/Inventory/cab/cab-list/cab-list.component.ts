import { NavigationExtras, Router } from '@angular/router';
import { Component } from '@angular/core';
import { Routes } from 'app/common/const';
import { Security, filter_module_name, inventoryCabPermissions, messages, module_name } from 'app/security';
import { BaseListingComponent, Column } from 'app/form-models/base-listing';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { Linq } from 'app/utils/linq';
import { DateTime } from 'luxon';
import { ToasterService } from 'app/services/toaster.service';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { FlightTabService } from 'app/services/flight-tab.service';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { Subscription } from 'rxjs';
import { HolidayVersionTwoService } from 'app/services/holidayversion2.service ';
import { CabService } from 'app/services/cab.service';
import { CityService } from 'app/services/city.service';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-cab-list',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    DatePipe,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatMenuModule,
    MatDialogModule,
    MatTooltipModule,
    MatDividerModule,
    PrimeNgImportsModule,
  ],
  templateUrl: './cab-list.component.html',
  styleUrls: ['./cab-list.component.scss']
})
export class CabListComponent extends BaseListingComponent {

  module_name = module_name.cab_inventory;
  // Variable
  filter_table_name = filter_module_name.cab;
  private settingsUpdatedSubscription: Subscription;

  dataList = [];
  total = 0;
  isFilterShow: boolean = false;
  supplierListAll: any[] = [];
  selectedSupplier: any;
  cityList: any[] = [];
  FromCityList: any[] = [];
  ToCityList: any[] = [];
  selectedFromCity: any = {};
  selectedToCity: any = {};
  _selectedColumns: Column[];

  tripList: any = [
    { label: 'Outstation One Way', value: 'Outstation One Way' },
    { label: 'Outstation Round Trip', value: 'Outstation Round Trip' },
    { label: 'Airport Transfer', value: 'Airport Transfer' },
    { label: 'Hourly Rental', value: 'Hourly Rental' },
  ]

  cols: Column[] = [
    { field: 'bonton_publish_date_time', header: 'Bonton Publish Date' },
    { field: 'wl_publish_date_time', header: 'WL Publish Date' },
  ];

  actionList: any[] = [
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ]

  constructor(
    private cabService: CabService,
    private cityService: CityService,
    private holidayService: HolidayVersionTwoService,
    private toasterService: ToasterService,
    private conformationService: FuseConfirmationService,
    private matDialog: MatDialog,
    private flighttabService: FlightTabService,
    private router: Router,
    public _filterService: CommonFilterService
  ) {
    super(module_name.cab_inventory);
    // this.cols = this.columns.map((x) => x.key);
    this.key = this.module_name;
    this.sortColumn = 'entry_date_time';
    this.sortDirection = 'desc';
    this.Mainmodule = this;
    this._filterService.applyDefaultFilter(this.filter_table_name);
  }

  ngOnInit() {
    this.cityService.cityListV2$.subscribe((cityList) => {
      this.FromCityList = cloneDeep(cityList);
      this.ToCityList = cloneDeep(cityList);
    });

    // common filter
    this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp: any) => {
      this.selectedFromCity = resp['table_config']['filter_from_city_id']?.value;
      this.selectedToCity = resp['table_config']['filter_to_city_id']?.value;

      if (this.selectedFromCity && this.selectedFromCity.id) {
        const match = this.FromCityList.find((item: any) => item.id == this.selectedFromCity?.id);
        if (!match) {
          this.FromCityList.push(this.selectedFromCity);
        }
      }

      if (this.selectedToCity && this.selectedToCity.id) {
        const match = this.ToCityList.find((item: any) => item.id == this.selectedToCity?.id);
        if (!match) {
          this.ToCityList.push(this.selectedToCity);
        }
      }

      // if (resp['table_config']['entry_date_time']?.value != null) {
      //   resp['table_config']['entry_date_time'].value = new Date(resp['table_config']['entry_date_time'].value);
      // }

      this.primengTable['filters'] = resp['table_config'];
      this._selectedColumns = resp['selectedColumns'] || [];
      this.isFilterShow = true;
      this.primengTable._filter();
    });
    this.getSupplier();
  }

  ngAfterViewInit() {
    // Defult Active filter show
    if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
      let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
      this.selectedFromCity = filterData['table_config']['filter_from_city_id']?.value;
      this.selectedToCity = filterData['table_config']['filter_to_city_id']?.value;

      if (this.selectedFromCity && this.selectedFromCity.id) {
        const match = this.FromCityList.find((item: any) => item.id == this.selectedFromCity?.id);
        if (!match) {
          this.FromCityList.push(this.selectedFromCity);
        }
      }

      if (this.selectedToCity && this.selectedToCity.id) {
        const match = this.ToCityList.find((item: any) => item.id == this.selectedToCity?.id);
        if (!match) {
          this.ToCityList.push(this.selectedToCity);
        }
      }

      this.primengTable['filters'] = filterData['table_config'];
      this._selectedColumns = filterData['selectedColumns'] || [];
      this.isFilterShow = true;
    }
  }

  getFromClityList(value: string, bool = true) {
    this.cityService.getCityComboV2({ skip: 0, take: 10, filter: value }).subscribe((data: any) => {
      this.FromCityList = data;
    });
  }

  getToClityList(value: string, bool = true) {
    this.cityService.getCityComboV2({ skip: 0, take: 10, filter: value }).subscribe((data: any) => {
      this.ToCityList = data;
    });
  }

  getSupplier() {
    this.flighttabService.getSupplierBoCombo('cab').subscribe((data: any) => {
      this.supplierListAll = data;

      for (let i in this.supplierListAll) {
        this.supplierListAll[i].id_by_value = this.supplierListAll[i].company_name
      }
    })
  }

  refreshItems(event?: any): void {
    this.isLoading = true;
    this.cabService
      .getCabList(this.getNewFilterReq(event))
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

  createData(): void {
    if (!Security.hasNewEntryPermission(module_name.inventoryHoliday)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    // this.matDialog.open(ProductEntryComponent, {
    //     disableClose: true,
    //     data: { id: '' }
    // }).afterClosed().subscribe(res => {
    //     if (res)
    //         this.refreshItems();
    // });
  }


  viewData(record): void {
    // if (!Security.hasViewDetailPermission(module_name.inventoryCab)) {
    //   return this.alertService.showToast('error', messages.permissionDenied);
    // }

    this.router.navigate([Routes.inventory.holiday_entry_route + '/' + record.id + '/readonly']);
  }

  deleteData(record: any, index: any): void {
    if (!Security.hasPermission(inventoryCabPermissions.deletePermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    const label: string = 'Delete Cab';
    this.conformationService
      .open({
        title: label,
        message: `Are you sure you want to delete ${record.trip_type.toLowerCase()} cab?`
      })
      .afterClosed()
      .subscribe((res) => {
        if (res === 'confirmed') {
          this.cabService.delete(record.id).subscribe({
            next: () => {
              this.dataList.splice(index, 1);
              this.alertService.showToast(
                'success',
                'Cab has been deleted!',
                'top-right',
                true
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

  cabPublish(record): void {
    if (!Security.hasPermission(inventoryCabPermissions.publishUnpublishPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    if (!record.is_audited) {
      this.alertService.showToast('error', 'Cab product must be audited before it can be published.');
      return;
    }

    const label: string = record.is_publish_for_bonton
      ? 'Unpublish'
      : 'Publish';
    this.conformationService
      .open({
        title: label + " Cab",
        message:
          'Are you sure to ' +

          label.toLowerCase() +
          ' ' +

          record.product_name +
          ' ?',
      })
      .afterClosed()
      .subscribe((res) => {
        if (res === 'confirmed') {
          this.cabService.setCabPublish(record.id).subscribe({
            next: (res: any) => {
              record.is_publish_for_bonton = !record.is_publish_for_bonton;
              if (record.is_publish_for_bonton) {
                this.alertService.showToast('success', "Cab has been Publish!", "top-right", true);
              } else {
                this.alertService.showToast('success', "Cab has been UnPublish!", "top-right", true);
              }
            }, error: (err) => {
              this.alertService.showToast("error", err)
            }
          });
        }
      });
  }

  // HolidayPopular(record): void {
  //     if (!Security.hasPermission(inventoryCabPermissions.setasPopularPermissions)) {
  //         return this.alertService.showToast('error', messages.permissionDenied);
  //     }

  //     const label: string = record.is_popular
  //     ? 'Make as Unpopular Holiday Product'
  //     : 'Set as Popular Holiday Product';
  //     this.conformationService
  //         .open({
  //             title: label,
  //             message: `Are you sure you want to set ${record.product_name} as ${record.is_popular ? 'Unpopular':'Popular'}?`
  //         })
  //         .afterClosed()
  //         .subscribe((res) => {
  //             if (res === 'confirmed') {
  //                 this.holidayService.setHolidayPopular(record.id).subscribe({
  //                     next: () => {
  //                         record.is_popular = !record.is_popular;
  //                         if (record.is_popular) {
  //                             this.alertService.showToast('success', "Holiday Product has been Popular!", "top-right", true);
  //                         } else {
  //                             this.alertService.showToast('success', "Holiday Product has been Not Popular!", "top-right", true);
  //                         }
  //                     },
  //                     error: (err) => {
  //                         this.toasterService.showToast('error', err)
  //                         this.isLoading = false;
  //                     },
  //                 });
  //             }
  //         });
  // }

  // copy(record): void {
  //     if (!Security.hasPermission(inventoryHolidayPermissions.copyProductPermissions)) {
  //         return this.alertService.showToast('error', messages.permissionDenied);
  //     }

  //     this.conformationService.open({
  //         title: 'Copy Product',
  //         message: 'Are you sure to generate copy of ' + record.product_name + ' ?',
  //     }).afterClosed().subscribe((res) => {
  //         if (res === 'confirmed') {
  //             this.holidayService.CopyProduct(record.id).subscribe({
  //                 next: () => {
  //                     this.alertService.showToast('success', 'Product Copied');
  //                     this.refreshItems();
  //                 }, error: (err) => {
  //                     this.alertService.showToast('error', err);
  //                 }
  //             })
  //         }
  //     });
  // }

  Audit(data: any): void {
    if (!Security.hasPermission(inventoryCabPermissions.auditUnauditPermissions)) {
    	return this.alertService.showToast('error', messages.permissionDenied);
    }

    const label: string = data.is_audited ? 'UnAudit Cab' : 'Audit Cab';
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ?'
    }).afterClosed().subscribe({
      next: (res) => {
        if (res === 'confirmed') {
          this.cabService.setAuditUnaudit(data.id).subscribe({
            next: (res) => {
              if (res && res['status']) {
                if (!data.is_audited) {
                  this.alertService.showToast('success', "Cab Audited", "top-right", true);
                } else {
                  this.alertService.showToast('success', "Cab UnAudited", "top-right", true);
                }

                data.is_audited = !data.is_audited;
              }

            }, error: (err) => this.alertService.showToast('error', err, "top-right", true)
          });
        }
      }
    })

  }

  viewDetails(record: any): void {
    if (!Security.hasPermission(inventoryCabPermissions.viewCabPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    const queryParams = {
      id: record.id,
      trip_type: record.trip_type,
      from_type: "city",
      from_value: record?.from_city_id,
      departure_date: DateTime.now().toFormat('yyyy-MM-dd'),
      return_date: DateTime.now().plus({ days: 1 }).toFormat('yyyy-MM-dd'),
      rental_hour: record?.included_hour,
      rental_kms: record?.included_km
    }

    if(queryParams.trip_type !== 'Holiday Rental') {
      queryParams['to_type'] =  "city";
      queryParams['to_value'] =  record?.to_city_id;
    }

    // const navigationExtras: NavigationExtras = {
    //   queryParams: {
    //     "user": JSON.stringify(queryParams)
    //   }
    // };

    // Construct the URL using the Router
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/inventory/cab/view-details'], {queryParams})
    );

    // Open the URL in a new tab/window
    window.open(url, '_blank');

  }

  getNodataText(): string {
    if (this.isLoading) return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }

  ngOnDestroy(): void {
    // this.masterService.setData(this.key, this);
    if (this.settingsUpdatedSubscription) {
      this.settingsUpdatedSubscription.unsubscribe();
      this._filterService.activeFiltData = {};
    }
  }



}
