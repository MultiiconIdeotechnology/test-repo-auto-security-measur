import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
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
import { EntityService } from 'app/services/entity.service';
import { SupplierInventoryProfileService } from 'app/services/supplier-inventory-profile.service';
import { ToasterService } from 'app/services/toaster.service';
import { cloneDeep } from 'lodash';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-profile-airline',
  templateUrl: './profile-airline.component.html',
  styleUrls: ['./profile-airline.component.scss'],
  standalone: true,
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
export class ProfileAirlineComponent implements OnChanges {
  @Input() profile_name: string = '';
  @Input() type: string;
  @Input() record: any;
  @Output() closeDrawer = new EventEmitter<void>();
  @ViewChild('tableRef') tableRef!: Table;
  airlineForm: FormGroup;

  globalFilter: string = '';
  disableBtn: boolean = false;
  supplierList: any[] = [];
  supplierAllList: any[] = [];

  supplierFareTypeList: any[] = [];
  supplierFareTypeAllList: any[] = [];

  AirlineList: any[] = [];
  AllAirline: any[] = [];
  airPortcodeList: any[] = [];
  allAirPortCode: any[] = [];
  currentEditId: string | null = null;
  currentRecordRespId: string | null = null;
  recordRespEditId: string | null = null;
  isEdit: boolean = false;

  suplier_name: string = '';
  suplier_id: string = '';

  dataList: any[] = [];
  allProfiles: any[] = [];
  sessionInventories: any[] = [];

  searchText = '';
  userType: any = ['B2B', 'B2C'];
  tripTypeList: any = ['International', 'Both', 'Domestic'];
  routeTypeList: any = ['One Way', 'Round Trip', 'MultiCity'];
  fareTypeList: any = ['Both', 'Refundable', 'Non Refundable'];
  fareClassList: any = [
    'All',
    'Economy',
    'Premium Economy',
    'Business',
    'First Class'
  ];
  fareTypeClassVisibleTypeList: any = ['Include', 'Exclude'];
  stopList: number[] = [0, 1, 2, 3, 4];
  editIndex: number | null = null;
  fareTypeClassOptions: any[] = [];


  constructor(
    private formBuilder: FormBuilder,
    private supplierInventoryProfileService: SupplierInventoryProfileService,
    private toasterService: ToasterService,
    private entityService: EntityService,
    private cacheService: CacheService
  ) {
    this.airlineForm = this.formBuilder.group({
      id: [''],
      supplier_id: ['', Validators.required],
      supplier_name: [''],
      sup_type: [''],
      fare_type_class: ['', Validators.required],
      supplier_fare_type_filter: [''],
      user_type: ['', Validators.required],
      trip_type: ['', Validators.required],
      route_type: ['', Validators.required],
      airline_id: ['', Validators.required],
      airlineFilter: [''],
      fare_class: ['', Validators.required],
      fare_type: ['', Validators.required],
      fare_type_class_visible_type: ['', Validators.required],
      airport_code_id: ['', Validators.required],
      airport_code_filter: [''],
      airport_codes_visible_type: ['', Validators.required],
      stops: ['', Validators.required],
      is_enable: true
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

    this.airlineForm.get('supplier_fare_type_filter').valueChanges.subscribe(res => {
      const val = res?.trim()?.toLowerCase();
      if (!val)
        this.supplierFareTypeList = this.supplierFareTypeAllList;
      else
        this.supplierFareTypeList = this.supplierFareTypeAllList.filter(x => x.class_of_service.toLowerCase().includes(val));
    });


  }
  ngOnChanges(changes: SimpleChanges): void {
    if (this.type === 'edit' && this.record?.id) {
      this.currentEditId = this.record.id;
      this.recordRespEditId = this.record.id;
      this.isEdit = true;

      // Then load data and patch
      this.initializeForm();
      this.loadRecord(this.currentEditId);

    } else if (this.type === 'create') {
      this.isEdit = false;
      this.currentRecordRespId = '';
      this.airlineForm.reset();
      this.dataList = [];
    }

    if ((this.type == 'create' || this.type == 'edit')) {
      this.getSupplierCombo();
      this.airlineCombo();
      this.getAirportMstCombo();
    }

  }



  ngOnInit(): void {

  }


  initializeForm(): void {
    this.airlineForm = this.formBuilder.group({
      id: [''],
      profile_name: [''],
      supplier_id: [''],
      supplier_name: [''],
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
      is_enable: true
    });
  }


  loadRecord(requestId: string): void {
    this.supplierInventoryProfileService.getSupplierInventoryProfileRecord(requestId).subscribe(res => {
      const record = res;
      this.currentEditId = this.record.id;
      // this.profile_name = this.record.profile_name;

      const settingsArray = record.settings ? JSON.parse(record.settings) : [];
      //  This updates your table grid
      this.dataList = settingsArray;

      console.log("Patched Form:", this.airlineForm.getRawValue());
    });
  }

  onEdit(row: any, index: number): void {
    // this.isEdit = true;
    this.editIndex = index;
    this.currentEditId = row.id;
    this.airlineForm.patchValue({
      supplier_id: {
        id: row.supplier_id,
        company_name: row.supplier_name
      },
      user_type: row.user_type,
      id: row.id,
      trip_type: row.trip_type,
      route_type: row.route_type,
      airline_id: row.airline || [],
      fare_class: row.fare_class || [],
      fare_type: row.fare_type,
      fare_type_class_visible_type: row.fare_type_class_visible_type,
      airport_code_id: row.airport_codes || [],
      airport_codes_visible_type: row.airport_codes_visible_type,
      stops: row.stops || [],
      is_enable: row.is_enable
    });

    this.suplier_id = row.supplier_id;
    this.suplier_name = row.supplier_name;
    this.onSupplierChange({ id: row.supplier_id, company_name: row.supplier_name }, row);
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


  onSupplierChange(supplier: any, row: any = null): void {
    console.log('🔁 onSupplierChange triggered:', supplier, row);
    if (supplier?.id) {
      this.suplier_id = supplier.id;
      this.suplier_name = supplier.company_name;

      this.getSupplierFareTypeCombo('', supplier.id, () => {
        if (this.isEdit && row?.fare_type_class) {
          setTimeout(() => {
            this.airlineForm.patchValue({
              fare_type_class: row.fare_type_class
            });
          }, 0); // allow change detection to catch up
        }
      });
    }
  }


  getSupplierFareTypeCombo(filter: string, supplier_id: string, p0?: () => void): void {
    const isEdit = true;

    this.supplierInventoryProfileService.getSupplierFareTypeCombo(supplier_id, filter, isEdit)
      .subscribe({
        next: data => {
          this.supplierFareTypeAllList = cloneDeep(data);
          this.supplierFareTypeList = data;

          if (p0) {
            p0(); // call the callback here after data is set
          }
        }
      });
  }


  compareWith(o1: any, o2: any): boolean {
    return o1 && o2 && o1.id === o2.id;
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

  // compareWith = (a: any, b: any) => a === b; // for IDs

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
      this.toasterService.showToast('error', 'Please fill all required fields.', 'top-right');
      return;
    }

    this.disableBtn = true;
    const formValue = this.airlineForm.value;

    const newInventory = {
      service: 'Airline',
      supplier_id: this.suplier_id,
      supplier_name: this.suplier_name,
      user_type: formValue.user_type,
      id: formValue.id,
      trip_type: formValue.trip_type,
      route_type: formValue.route_type,
      airline: formValue.airline_id || [],
      fare_class: formValue.fare_class || [],
      fare_type: formValue.fare_type,
      fare_type_class: formValue.fare_type_class || [],
      fare_type_class_visible_type: formValue.fare_type_class_visible_type,
      airport_codes: formValue.airport_code_id || [],
      airport_codes_visible_type: formValue.airport_codes_visible_type,
      stops: formValue.stops || [],
      is_enable: formValue.is_enable
    };

    //  Maintain inventory list
    this.sessionInventories = cloneDeep(this.dataList || []);
    console.log("index 1", newInventory);
    if (newInventory?.id) {
      const index = this.sessionInventories.indexOf(this.sessionInventories.find(x => x.id == newInventory.id));
      console.log("index", index);

      this.sessionInventories[index] = newInventory;
    } else {
      this.sessionInventories.push(newInventory);
    }

    //  Add only if it's NOT duplicate (optional)

    this.sessionInventories.forEach((x, index) => {
      x.id = index + 1;
    })

    const payload = {
      id: this.isEdit ? this.recordRespEditId : this.currentRecordRespId || '', // If blank, create new
      profile_name: this.profile_name || '',
      is_default: false,
      inventories: this.sessionInventories //  Full list of inventories
    };

    this.supplierInventoryProfileService.createSupplierInventoryProfile(payload).subscribe({
      next: (res) => {
        const id = res?.id;
        this.currentRecordRespId = res?.id;
        this.entityService.reisesupplierInventoryProfile(id);
        if (!id) {
          this.toasterService.showToast('error', 'Invalid response', 'top-right');
          this.disableBtn = false;
          return;
        }

        this.currentEditId = id;

        //  Show all rows in grid
        const rows = this.sessionInventories.map(inv =>
          this.getDisplayRow(id, this.profile_name, inv)
        );
        this.dataList = [...rows];

        this.toasterService.showToast('success', 'Saved successfully', 'top-right');

        //  Reset form but NOT sessionInventories
        this.airlineForm.reset();
        this.resetForm();
        this.disableBtn = false;
      },
      error: (err) => {
        this.toasterService.showToast('error', err, 'top-right');
        this.disableBtn = false;
      }
    });
  }



  getDisplayRow(id: string, profileName: string, inventory: any): any {
    return {
      // id,
      // profile_id: id,
      //  profile_name: profileName,
      supplier_id: inventory.supplier_id,
      supplier_name: inventory.supplier_name,
      user_type: inventory.user_type,
      trip_type: inventory.trip_type,
      id: inventory.id,
      route_type: inventory.route_type,
      airline: inventory.airline || [],
      fare_class: inventory.fare_class || [],
      fare_type: inventory.fare_type,
      fare_type_class: inventory.fare_type_class || [],
      fare_type_class_visible_type: inventory.fare_type_class_visible_type,
      airport_codes: inventory.airport_codes || [],
      airport_codes_visible_type: inventory.airport_codes_visible_type,
      stops: inventory.stops || [],
      is_enable: inventory.is_enable,
      isEnable: inventory.is_enable,
      supplier: inventory.supplier_name,
      usertype: inventory.user_type,
      triptype: inventory.trip_type
    };
  }

  isMatchingInventory(a: any, b: any): boolean {
    return (
      a.supplier_id === b.supplier_id &&
      a.user_type === b.user_type &&
      a.trip_type === b.trip_type &&
      a.route_type === b.route_type
      // You can extend this if more matching rules are required
    );
  }


  updateDataList(id: string, updatedRow: any): void {
    const index = this.dataList.findIndex(row => row.id === id);
    if (index !== -1) {
      this.dataList[index] = updatedRow;
      this.dataList = [...this.dataList]; // Trigger grid update
    }
  }

  getProfileNameFromList(id: string): string {
    debugger;
    const row = this.dataList.find(r => r.id === id);
    return row?.profile_name;
  }

  resetEditFlags(clearProfileName: boolean = false): void {
    // if (clearProfileName) {
    //   //this.profile_name = '';
    //   // this.currentEditId = '';
    // }
    this.airlineForm.reset();
    this.disableBtn = false;
    this.isEdit = false;
    this.editIndex = -1;
  }

  resetForm(): void {
    this.airlineForm.reset();
    this.airlineForm.patchValue({
      is_enable: false,
      airline_id: [],
      fare_class: [],
      airport_code_id: [],
      stops: []
    });
  }


  onDelete(row: any): void {
    const index = this.dataList.indexOf(row);
    if (index !== -1) {
      this.dataList.splice(index, 1);
      this.dataList = [...this.dataList]; // trigger change detection

      // Update localStorage after deletion
      localStorage.setItem('airlineProfileDataList', JSON.stringify(this.dataList));
    }
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
