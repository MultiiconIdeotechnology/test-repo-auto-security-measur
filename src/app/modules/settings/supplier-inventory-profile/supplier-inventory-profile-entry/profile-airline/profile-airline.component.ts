import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenav } from '@angular/material/sidenav';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { CacheLabel, CacheService } from 'app/services/cache.service';
import { KycDocumentService } from 'app/services/kyc-document.service';
import { SupplierInventoryProfileService } from 'app/services/supplier-inventory-profile.service';
import { SupplierService } from 'app/services/supplier.service';
import { ToasterService } from 'app/services/toaster.service';
import { cloneDeep } from 'lodash';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { debounceTime, distinctUntilChanged, filter, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-profile-airline',
  templateUrl: './profile-airline.component.html',
  styleUrls: ['./profile-airline.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    MatSelectModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatButtonModule,
    CommonModule,
    PrimeNgImportsModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    NgxMatSelectSearchModule,
    MatOptionModule,
    MatCheckboxModule,

  ]
})
export class ProfileAirlineComponent {
  @Input() profileName: string;
  @Output() closeDrawer = new EventEmitter<void>();
  airlineForm: FormGroup;

  globalFilter: string = '';

  supplierList: any[] = [];
  supplierAllList: any[] = [];

  supplierFareTypeList: any[] = [];
  supplierFareTypeAllList: any[] = [];

  AirlineList: any[] = [];
  AllAirline: any[] = [];
  airPortcodeList: any[] = [];
  allAirPortCode: any[] = [];


  dataList: any[] = [];

  searchText = '';
  userType: string[] = ['B2B', 'B2C'];
  tripTypeList: string[] = ['International', 'Both', 'Domestic'];
  routeTypeList: string[] = ['All', 'One Way', 'Round Trip', 'MultiCity'];
  fareTypeList: string[] = ['Both', 'Refundable', 'Non Refundable'];
  fareClassList: string[] = [
    'All',
    'Economy',
    'Premium Economy',
    'Business',
    'First Class'
  ];
  fareTypeClassVisibleTypeList: string[] = ['Include', 'Exclude'];
  stopList: number[] = [0, 1, 2, 3, 4];



  constructor(
    private formBuilder: FormBuilder,
    private supplierService: SupplierService,
    private supplierInventoryProfileService: SupplierInventoryProfileService,
    private toasterService: ToasterService,
    private cacheService: CacheService
  ) {
    this.airlineForm = this.formBuilder.group({
      id: [''],

      supplier_id: [''],
      sup_type: [''],
      fare_type_class: [''],
      supplier_fare_type_filter: [''],

      user_type: [''],
      trip_type: ['',],
      route_type: [''],
      airline_id: [''],
      airlineFilter: [''],
      fare_class: [''],
      fare_type: [''],
      fare_type_class_visible_type: [''],
      airport_code_id: [''],
      airport_code_filter: [''],
      airport_codes_visible_type: [''],
      stops: [''],
      is_enable: [true]
    });

    this.airlineForm.get('sup_type').valueChanges.subscribe(res => {
      const val = res?.trim()?.toLowerCase();
      if (!val)
        this.supplierList = this.supplierAllList;
      else
        this.supplierList = this.supplierAllList.filter(x => x?.company_name?.toLowerCase().includes(val));
    })

    this.airlineForm.get('airlineFilter').valueChanges.subscribe(res => {
      const val = res?.trim()?.toLowerCase();
      if (!val)
        this.AirlineList = this.AllAirline;
      else
        this.AirlineList = this.AllAirline.filter(x => x.short_code.toLowerCase().includes(val));
    });

    this.airlineForm.get('airport_code_filter').valueChanges.subscribe(res => {
      const val = res?.trim()?.toLowerCase();
      if (!val)
        this.airPortcodeList = this.allAirPortCode;
      else
        this.airPortcodeList = this.allAirPortCode.filter(x => x.display_name.toLowerCase().includes(val));
    });

  }



  ngOnInit(): void {
    this.getSupplierCombo();
    this.airlineCombo();
    this.getAirportMstCombo();
  }

  getSupplierCombo(): void {
    this.cacheService.getOrAdd(CacheLabel.getFareypeSupplierBoCombo,
      this.supplierInventoryProfileService.getFareypeSupplierBoCombo('Airline', '')).subscribe({
        next: data => {
          this.supplierAllList = cloneDeep(data);
          this.supplierList = this.supplierAllList;
        }
      });
  }

  getSupplierFareTypeCombo(filter: string, supplier_id: string): void {
    this.supplierInventoryProfileService.getSupplierFareTypeCombo(supplier_id, filter).subscribe({
      next: data => {
        this.supplierFareTypeAllList = data;
        this.supplierFareTypeList = data;
      }
    });
  }

  airlineCombo(): void {
    this.cacheService.getOrAdd(CacheLabel.getAirlineCombo,
      this.supplierInventoryProfileService.getAirlineCombo('')).subscribe({
        next: data => {
          this.AllAirline = cloneDeep(data);
          this.AirlineList = this.AllAirline;
        }
      });
  }

  getAirportMstCombo(filter: string = ''): void {
    this.cacheService.getOrAdd(CacheLabel.getAirportMstCombo,
      this.supplierInventoryProfileService.getAirportMstCombo('')).subscribe({
        next: data => {
          this.allAirPortCode = cloneDeep(data);
          this.airPortcodeList = this.allAirPortCode;
        }
      });
  }

  compareWith = (a: any, b: any) => a === b; // for IDs

  //AirLine
  clickOtherRoles(event?): void {
    if (event.source.value === 'All') return;

    const allSelected = this.airlineForm.get('airline_id').value.find(x => x == 'All');
    if (allSelected) {
      const updatedClients = this.airlineForm.get('airline_id').value.filter(x => x !== 'All');
      this.airlineForm.get('airline_id').patchValue(updatedClients, { emitEvent: false });
    }
  }

  clickAllRoles(event: any): void {

    if (event.source.value !== 'All') return;

    const all = event.source.selected;

    if (all) {
      this.airlineForm.get('airline_id').patchValue(['All', ...this.AirlineList.map(x => x.id)], { emitEvent: false });
    } else {
      this.airlineForm.get('airline_id').patchValue([], { emitEvent: false });
    }
  }


  //Airport Codes
  clickOtherCodes(event?): void {
    if (event.source.value === 'All') return;

    const allSelected = this.airlineForm.get('airport_code_id').value.find(x => x == 'All');
    if (allSelected) {
      const updatedClients = this.airlineForm.get('airport_code_id').value.filter(x => x !== 'All');
      this.airlineForm.get('airport_code_id').patchValue(updatedClients, { emitEvent: false });
    }
  }

  clickAllCodes(event: any): void {

    if (event.source.value !== 'All') return;

    const all = event.source.selected;

    if (all) {
      this.airlineForm.get('airport_code_id').patchValue(['All', ...this.airPortcodeList.map(x => x.id)], { emitEvent: false });
    } else {
      this.airlineForm.get('airport_code_id').patchValue([], { emitEvent: false });
    }
  }

  //Fare Type class
  clickOtherFareTypeClass(event?): void {
    if (event.source.value === 'All') return;

    const allSelected = this.airlineForm.get('fare_type_class').value.find(x => x == 'All');
    if (allSelected) {
      const updatedClients = this.airlineForm.get('fare_type_class').value.filter(x => x !== 'All');
      this.airlineForm.get('fare_type_class').patchValue(updatedClients, { emitEvent: false });
    }
  }

  clickAllFarTypeClass(event: any): void {

    if (event.source.value !== 'All') return;

    const all = event.source.selected;

    if (all) {
      this.airlineForm.get('fare_type_class').patchValue(['All', ...this.supplierFareTypeList.map(x => x.id)], { emitEvent: false });
    } else {
      this.airlineForm.get('fare_type_class').patchValue([], { emitEvent: false });
    }
  }



  onAllFareClassToggle(event: any): void {
    if (event.source.selected) {
      this.airlineForm.get('fare_class')?.patchValue([...this.fareClassList], { emitEvent: false });
    } else {
      this.airlineForm.get('fare_class')?.patchValue([], { emitEvent: false });
    }
  }

  onFareClassChange(event: any): void {
    const selected = event.value;

    // If 'All' is selected with others, remove 'All'
    if (selected.includes('All') && selected.length > 1) {
      const updated = selected.filter((val: string) => val !== 'All');
      this.airlineForm.get('fare_class')?.patchValue(updated, { emitEvent: false });
    }
  }

  onSelectAllStops(event: any): void {
    if (event.source.selected) {
      this.airlineForm.get('stops')?.patchValue(['All', ...this.stopList], { emitEvent: false });
    } else {
      this.airlineForm.get('stops')?.patchValue([], { emitEvent: false });
    }
  }

  onStopsChange(event: any): void {
    const selected = event.value;
    if (selected.includes('All') && selected.length > 1) {
      const updated = selected.filter((val: any) => val !== 'All');
      this.airlineForm.get('stops')?.patchValue(updated, { emitEvent: false });
    }
  }



  filterAirlineCarrier(val): void {
    const value = this.AllAirline.filter(x => x.short_code.toLowerCase().includes(val.toLowerCase()))
    this.AirlineList = value;
  }

  submit(): void {
    if (this.airlineForm.invalid) {
      this.airlineForm.markAllAsTouched();
      this.toasterService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      return;
    }

    const formValue = this.airlineForm.value;

    const payload = {
      id: '', // Optional: update mode
      profile_name: this.profileName,
      is_default: false,
      inventories: [
        {
          service: 'Airline',
          supplier_id: formValue.supplier_id,
          user_type: formValue.user_type,
          trip_type: formValue.trip_type,
          route_type: formValue.route_type,
          airline: formValue.airline_id,
          fare_class: formValue.fare_class,
          fare_type: formValue.fare_type,
          fare_type_class: formValue.fare_type_class,
          fare_type_class_visible_type: formValue.fare_type_class_visible_type,
          airport_codes: formValue.airport_code_id,
          airport_codes_visible_type: formValue.airport_codes_visible_type,
          stops: formValue.stops,
          is_enable: formValue.is_enable
        }
      ]
    };

    this.supplierInventoryProfileService.createSupplierInventoryProfile(payload).subscribe({
      next: (res) => {
        this.toasterService.showToast('success', 'Profile saved successfully.', 'top-right');

        // ✅ Add to grid dataList
        const addedRow = {
          supplier: this.getSupplierNameById(formValue.supplier_id), // helper method below
          usertype: formValue.user_type,
          isEnable: formValue.is_enable,
          triptype: formValue.trip_type,
          // add more fields if needed
        };

        this.dataList.unshift(addedRow); // Add to the top of the table

        // ✅ Reset form
        this.airlineForm.reset();

        // Optional: reset multi-selects manually if needed
        this.airlineForm.patchValue({
          is_enable: false,
          airline_id: [],
          fare_class: [],
          airport_code_id: [],
          stops: []
        });
      },
      error: () => {
        this.toasterService.showToast('error', 'Something went wrong.', 'top-right');
      }
    });
  }

  getSupplierNameById(id: number | string): string {
    const supplier = this.supplierList.find(s => s.id === id);
    return supplier ? supplier.company_name : '';
  }

  onRefresh(): void {
    this.globalFilter = '';
    // optionally re-fetch API here
  }

}
