import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
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
  airlineForm: FormGroup;

  globalFilter: string = '';
  SupplierList: any[] = [];
  AirlineList: any[] = [];
  AllAirline: any[] = [];
  airPortcodeList: any[] = [];
  allAirPortCode: any[] = [];


  dataList = [
    { supplier: 'IndiGo', usertype: 'Agent', isEnable: true, triptype: 'One-Way' },
    { supplier: 'Air India', usertype: 'Admin', isEnable: false, triptype: 'Round-Trip' },
    { supplier: 'SpiceJet', usertype: 'Agent', isEnable: true, triptype: 'Multi-City' }
    // add more mock or API data
  ];

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
      supplierFilter: ['', Validators.required],
      user_type: ['', Validators.required],
      trip_type: ['', Validators.required],
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


    this.supplierCombo();
    this.airlineCombo();
    this.getAirportMstCombo();
  }

  supplierCombo() {
    //supplier combo
    this.airlineForm
      .get('supplierFilter')
      .valueChanges.pipe(
        filter((search) => !!search),
        startWith(''),
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((value: any) => {
          return this.supplierInventoryProfileService.getSupplierComboOfflinePNR(value, 'Airline');
        })
      )
      .subscribe({
        next: (data) => {
          this.SupplierList = data;
          // this.airlineForm
          //   .get('supplier_id')
          //   .patchValue(this.SupplierList[0].id);
        },
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

  // public compareWith(v1: any, v2: any) {
  //   return v1 && v2 && v1.id === v2.id;
  // }

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

  onRefresh(): void {
    this.globalFilter = '';
    // optionally re-fetch API here
  }

}
