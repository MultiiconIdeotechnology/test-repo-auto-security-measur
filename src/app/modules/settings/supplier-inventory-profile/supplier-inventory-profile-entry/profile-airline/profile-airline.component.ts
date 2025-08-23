import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatOptionSelectionChange } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { BaseListingComponent } from 'app/form-models/base-listing';
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
export class ProfileAirlineComponent extends BaseListingComponent implements OnChanges {
  @Input() profile_name: string = '';
  @Input() type: string;
  @Input() record: any;
  @Input() createdProfile: any;
  @Output() closeDrawer = new EventEmitter<void>();
  @ViewChild('tableRef') tableRef!: Table;
  airlineForm: FormGroup;
  @Input() inventoryList: any[] = [];
  private _isFormDisabled = false;
  private _patchingFareClass = false;
  //airlineFilter = new FormControl('');

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
  profileData: any[] = [];
  filteredAirlineList: any[] = [];

  searchText = '';
  userType: any = ['Both', 'B2B', 'B2C'];
  tripTypeList: any = ['Both', 'Domestic', 'International'];
  routeTypeList: any = ['Both', 'One Way', 'Round Trip'];
  fareTypeList: any = ['Both', 'Refundable', 'Non Refundable'];
  fareClassList: string[] = [
    'Economy',
    'Premium Economy',
    'Business',
    'First Class'
  ];
  fareTypeClassVisibleTypeList: any = ['Include', 'Exclude'];
  routeTypeVisibleTypeList: any = ['Include', 'Exclude'];
  tripTypeVisibleTypeList: any = ['Include', 'Exclude'];
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
    super('');
    this.airlineForm = this.formBuilder.group({
      id: [''],
      supplier_id: ['', Validators.required],
      supplier_name: [''],
      sup_type: '',
      fare_type_class: ['', Validators.required],
      supplier_fare_type_filter: [''],
      user_type: ['', Validators.required],
      trip_type: ['', Validators.required],
      route_type: ['', Validators.required],
      route_type_visible: ['', Validators.required],
      trip_type_visible: ['', Validators.required],
      airline_id: ['', Validators.required],
      airlineFilter: [''],
      fare_class: ['', Validators.required],
      fare_type: ['', Validators.required],
      fare_type_class_visible_type: ['', Validators.required],
      airport_code_id: ['', Validators.required],
      airport_code_filter: [''],
      airport_codes_visible_type: ['', Validators.required],
      stops: ['', Validators.required],
      is_enable: [false]
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
        this.supplierFareTypeList = this.supplierFareTypeAllList.filter(x => x.fare_type.toLowerCase().includes(val));
    });


  }


  ngOnChanges(changes: SimpleChanges): void {
    if ((this.type == 'create' || this.type == 'edit')) {
      this.getSupplierCombo();
      this.airlineCombo();
      this.getAirportMstCombo();
      this.getBontonFareTypeCombo();
    }


    if (this.type === 'edit' && this.record?.id) {
      this.currentEditId = this.record.id;
      this.recordRespEditId = this.record.id;
      this.isEdit = true;

      this.initializeForm();
      // this.loadRecord(this.currentEditId);

      if (this.inventoryList?.length) {
        this.dataList = this.inventoryList.map(inv => this.getDisplayRow(inv));
      }

    } else if (this.type === 'create') {
      this.airlineForm.reset({ is_enable: false });
      this.dataList = [];
      this.isEdit = false;
      this.currentRecordRespId = '';
      this.recordRespEditId = '';
    }



  }

  ngOnInit() {

  }



  initializeForm(): void {
    this.airlineForm = this.formBuilder.group({
      id: [''],
      // profile_name: [''],
      supplier_id: [''],
      supplier_name: [''],
      sup_type: '',
      fare_type_class: [''],
      supplier_fare_type_filter: [''],
      user_type: [''],
      trip_type: ['',],
      route_type: [''],
      route_type_visible: [''],
      trip_type_visible: [''],
      airline_id: [''],
      airlineFilter: [''],
      fare_class: [''],
      fare_type: [''],
      fare_type_class_visible_type: [''],
      airport_code_id: [''],
      airport_code_filter: [''],
      airport_codes_visible_type: [''],
      stops: [''],
      is_enable: [false]
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
      route_type_visible: row.route_type_visible,
      trip_type_visible: row.trip_type_visible,
      airline_id: row.airline || [],
      fare_class: row.fare_class || [],
      fare_type: row.fare_type,
      fare_type_class_visible_type: row.fare_type_class_visible_type,
      airport_code_id: row.airport_codes || [],
      airport_codes_visible_type: row.airport_codes_visible_type,
      stops: row.stops || [],
      fare_type_class: row.fare_type_class || [],
      is_enable: row.is_enable
    });
    // this.airlineForm.get('fare_type_class').patchValue(row.fare_type_class, { emitEvent: false });

    this.suplier_id = row.supplier_id;
    this.suplier_name = row.supplier_name;
    this.onSupplierChange({ id: row.supplier_id, company_name: row.supplier_name }, row);
  }


  getSupplierCombo(): void {
    this.cacheService.getOrAdd(CacheLabel.getFareypeSupplierAirlineCombo,
      this.supplierInventoryProfileService.getFareypeSupplierBoCombo('Airline', '')).subscribe({
        next: data => {
          this.supplierAllList = cloneDeep(data);
          this.supplierList = this.supplierAllList;
        }
      });
  }


  onSupplierChange(supplier: any, row: any = null): void {
    if (supplier?.id) {
      this.suplier_id = supplier.id;
      this.suplier_name = supplier.company_name;

      //   this.getSupplierFareTypeCombo('', supplier.id, () => {
      //     if (this.isEdit && row?.fare_type_class) {
      //       setTimeout(() => {
      //         this.airlineForm.patchValue({
      //           fare_type_class: row.fare_type_class
      //         });
      //       }, 0); // allow change detection to catch up
      //     }
      //   });
    }
  }


  // getSupplierFareTypeCombo(filter: string, supplier_id: string, p0?: () => void): void {
  //   const isEdit = true;

  //   this.supplierInventoryProfileService.getSupplierFareTypeCombo(supplier_id, filter, isEdit)
  //     .subscribe({
  //       next: data => {
  //         this.supplierFareTypeAllList = cloneDeep(data);
  //         this.supplierFareTypeList = data;

  //         if (p0) {
  //           p0(); // call the callback here after data is set
  //         }
  //       }
  //     });
  // }

  getBontonFareTypeCombo() {
    this.cacheService.getOrAdd(CacheLabel.getBontonCommonFareTypeCombo,
      this.supplierInventoryProfileService.getBontonCommonFareTypeCombo('')).subscribe({
        next: data => {
          this.supplierFareTypeAllList = cloneDeep(data);
          this.supplierFareTypeList = this.supplierFareTypeAllList;
        }
      });
  }


  compareWith(o1: any, o2: any): boolean {
    return o1 && o2 && o1.id === o2.id;
  }

  compareWithFareTypeBonton = (a: any, b: any) => a && b && a.id === b.id;

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


  //AirLine
  private isUpdatingAirlineSelection = false;

  clickAllAirline(event: any): void {
    if (this.isUpdatingAirlineSelection) return;
    this.isUpdatingAirlineSelection = true;

    const control = this.airlineForm.get('airline_id');
    const allIds = this.AirlineList.map(x => x.id);

    if (event.source.selected) {
      // Select All + all airlines
      control?.patchValue(['All', ...allIds], { emitEvent: false });
    } else {
      // Clear selection
      control?.patchValue([], { emitEvent: false });
    }

    this.isUpdatingAirlineSelection = false;
  }

  clickOtherAirline(event: any): void {
    if (this.isUpdatingAirlineSelection) return;
    this.isUpdatingAirlineSelection = true;

    const control = this.airlineForm.get('airline_id');
    let selected = control?.value || [];

    // Case 1: "All" selected but not all airlines → remove "All"
    if (selected.includes('All') && (selected.length - 1) !== this.AirlineList.length) {
      selected = selected.filter(v => v !== 'All');
      control?.patchValue(selected, { emitEvent: false });
    }

    // Case 2: all airlines selected but "All" missing → add "All"
    if (!selected.includes('All') && selected.length === this.AirlineList.length) {
      control?.patchValue(['All', ...selected], { emitEvent: false });
    }

    this.isUpdatingAirlineSelection = false;
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
  clickAllFareTypeClass(event: any): void {
    const control = this.airlineForm.get('fare_type_class');
    const allIds = this.supplierFareTypeList.map(x => x.id);

    if (event.source.selected) {
      control?.patchValue(['All', ...allIds], { emitEvent: false });
    } else {
      control?.patchValue([], { emitEvent: false });
    }
  }

  clickOtherFareTypeClass(event: any): void {
    const control = this.airlineForm.get('fare_type_class');
    let selected = control?.value || [];

    // If "All" is selected but not all items are selected, remove "All"
    if (selected.includes('All') && selected.length - 1 !== this.supplierFareTypeList.length) {
      selected = selected.filter((v: any) => v !== 'All');
      control?.patchValue(selected, { emitEvent: false });
    }

    // If all items are manually selected but "All" is missing, add "All"
    if (!selected.includes('All') && selected.length === this.supplierFareTypeList.length) {
      control?.patchValue(['All', ...selected], { emitEvent: false });
    }
  }

  private updatingFareClass = false;

  onFareClassChange(event: any): void {
    if (this.updatingFareClass) return;

    const control = this.airlineForm.get('fare_class');
    const selected = event.value || [];

    this.updatingFareClass = true;

    if (selected.includes('All') && selected.length - 1 !== this.fareClassList.length) {
      // "All" checked but not everything else → remove "All"
      control?.setValue(selected.filter((v: string) => v !== 'All'), { emitEvent: false });
    } else if (!selected.includes('All') && selected.length === this.fareClassList.length) {
      // all items manually checked → add "All"
      control?.setValue(['All', ...selected], { emitEvent: false });
    }

    this.updatingFareClass = false;
  }




  onSelectAllFareClass(event: any): void {
    if (this.updatingFareClass) return;

    const control = this.airlineForm.get('fare_class');

    if (event.source.selected) {
      // "All" selected → force all items selected
      this.updatingFareClass = true;
      control?.setValue(['All', ...this.fareClassList], { emitEvent: false });
      this.updatingFareClass = false;
    } else {
      // "All" unselected → clear everything
      this.updatingFareClass = true;
      control?.setValue([], { emitEvent: false });
      this.updatingFareClass = false;
    }
  }

  get fareClassDisplay(): string {
    const values = this.airlineForm.get('fare_class')?.value || [];
    if (values.includes('All') && values.length - 1 === this.fareClassList.length) {
      return 'All'; // show just "All" when all are selected
    }
    return values.filter((v: string) => v !== 'All').join(', ');
  }




  onSelectAllStops(event: any): void {
    if (event.source.selected) {
      this.airlineForm.get('stops')?.patchValue(
        ['All', ...this.stopList],
        { emitEvent: false }
      );
    } else {
      this.airlineForm.get('stops')?.patchValue([], { emitEvent: false });
    }
  }

  onStopsChange(event: any): void {
    const control = this.airlineForm.get('stops');
    const selected = event.value || [];

    // If 'All' is selected but not everything else, remove 'All'
    if (selected.includes('All') && selected.length - 1 !== this.stopList.length) {
      control?.patchValue(selected.filter((val: any) => val !== 'All'), { emitEvent: false });
    }

    // If all items are manually selected but 'All' is missing, add 'All'
    if (!selected.includes('All') && selected.length === this.stopList.length) {
      control?.patchValue(['All', ...selected], { emitEvent: false });
    }
  }

  get stopsDisplay(): string {
    const values = this.airlineForm.get('stops')?.value || [];
    return values
      .filter((v: any) => v !== 'All')
      .map((stop: number) => `${stop} Stop${stop > 1 ? 's' : ''}`)
      .join(', ');
  }



  filterAirlineCarrier(val): void {
    const value = this.AllAirline.filter(x => x.short_code.toLowerCase().includes(val.toLowerCase()))
    this.AirlineList = value;
  }

  submit(): void {
    this.disableBtn = true;

    if (this.airlineForm.invalid) {
      this.airlineForm.markAllAsTouched();
      this.toasterService.showToast('error', 'Please fill all required fields.', 'top-right');
      return;
    }

    const formValue = this.airlineForm.value;

    let airline = formValue.airline_id || [];

    if (airline.includes('All')) {
      airline = ['All'];
    }

    const newInventory = {
      service: formValue.service || 'Airline',
      supplier_id: this.suplier_id,
      supplier_name: this.suplier_name,
      user_type: formValue.user_type,
      id: formValue.id,
      trip_type: formValue.trip_type,
      route_type: formValue.route_type,
      route_type_visible: formValue.route_type_visible,
      trip_type_visible: formValue.trip_type_visible,
      airline: airline ,
      fare_class: formValue.fare_class || [],
      fare_type: formValue.fare_type,
      fare_type_class: formValue.fare_type_class || [],
      fare_type_class_visible_type: formValue.fare_type_class_visible_type,
      airport_codes: formValue.airport_code_id || [],
      airport_codes_visible_type: formValue.airport_codes_visible_type,
      stops: formValue.stops || [],
      is_enable: formValue.is_enable
    };

    // Clone the session data to work on
    this.sessionInventories = cloneDeep(this.dataList || []);

    const isEdit = !!newInventory.id;

    if (isEdit) {
      // Find exact record using both id and service
      const index = this.sessionInventories.findIndex(
        inv => inv.id === newInventory.id && inv.service === newInventory.service
      );

      if (index === -1) {
        this.toasterService.showToast('error', 'Record not found. Cannot update.', 'top-right');
        this.disableBtn = false;
        return;
      }

      // Prevent duplicate update (excluding self)
      const isDuplicate = this.sessionInventories.some(
        inv =>
          inv.user_type === newInventory.user_type &&
          inv.supplier_id === newInventory.supplier_id &&
          inv.service === newInventory.service &&
          !(inv.id === newInventory.id && inv.service === newInventory.service) // exclude self
      );

      if (isDuplicate) {
        this.toasterService.showToast('error', 'Duplicate entry not allowed on update.', 'top-right');
        this.disableBtn = false;
        return;
      }

      //  Update the record
      this.sessionInventories[index] = newInventory;

    } else {
      // ADD mode

      // Check for duplicate (same user_type + supplier_id + service)
      const isDuplicate = this.sessionInventories.some(
        inv =>
          inv.user_type === newInventory.user_type &&
          inv.supplier_id === newInventory.supplier_id &&
          inv.service === newInventory.service
      );

      if (isDuplicate) {
        this.toasterService.showToast('error', 'Duplicate entry not allowed.', 'top-right');
        this.disableBtn = false;
        return;
      }

      // Assign new ID (unique per service)
      const maxId = Math.max(
        0,
        ...this.sessionInventories
          .filter(inv => inv.service === newInventory.service)
          .map(inv => inv.id || 0)
      );

      newInventory.id = maxId + 1;

      this.sessionInventories.push(newInventory);
    }

    //  Update dataList from sessionInventories
    this.sessionInventories.forEach((x, index) => {
      x.tempRowIndex = index + 1; // Optional display ID
    });



    const payload = {
      // id: this.isEdit ? this.recordRespEditId : this.currentRecordRespId || '', // If blank, create new
      id: this.createdProfile?.id,
      profile_name: this.createdProfile.profile_name || '',
      is_default: false,
      inventories: this.sessionInventories //  Full list of inventories
    };

    this.supplierInventoryProfileService.createSupplierInventoryProfile(payload).subscribe({
      next: (res) => {
        const id = res?.id;
        this.currentRecordRespId = id;

        if (!id) {
          this.toasterService.showToast('error', 'Invalid response', 'top-right');
          this.disableBtn = false;
          return;
        }

        this.currentEditId = id;
        this.entityService.reisesupplierInventoryProfile(id);

        // Show grid
        const rows = this.sessionInventories.map(inv => this.getDisplayRow(inv));
        this.dataList = [...rows];

        this.toasterService.showToast('success', 'Saved successfully', 'top-right');

        // setTimeout(() => {
        this.resetForm();
        //   }, 1000);
        // this.airlineForm.reset({ is_enable: false });
        this.disableBtn = false;
      },
      error: (err) => {
        this.toasterService.showToast('error', err, 'top-right');
        this.disableBtn = false;
      }
    });
  }

  disableForm(): void {
    this.airlineForm.disable();
  }

  enableForm(): void {
    this.airlineForm.enable();
  }

  @Input() set isFormDisabled(value: boolean) {
    this._isFormDisabled = value;
    if (value) {
      this.airlineForm.disable();
    } else {
      this.airlineForm.enable();
    }
  }

  get isButtonDisabled(): boolean {
    return this._isFormDisabled;
  }

  resetForm(): void {
    this.airlineForm.reset({ is_enable: false });
  }

  getDisplayRow(inventory: any): any {
    return {
      // id,
      // profile_id: id,
      //  profile_name: profileName,
      id: inventory.id,
      service: inventory.service,
      supplier_id: inventory.supplier_id,
      supplier_name: inventory.supplier_name,
      user_type: inventory.user_type,
      trip_type: inventory.trip_type,
      route_type: inventory.route_type,
      route_type_visible: inventory.route_type_visible,
      trip_type_visible: inventory.trip_type_visible,
      airline: inventory.airline || [],
      fare_class: inventory.fare_class || [],
      fare_type: inventory.fare_type,
      fare_type_class: inventory.fare_type_class || [],
      fare_type_class_visible_type: inventory.fare_type_class_visible_type,
      airport_codes: inventory.airport_codes || [],
      airport_codes_visible_type: inventory.airport_codes_visible_type,
      stops: inventory.stops || [],
      is_enable: inventory.is_enable,
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



  resetEditFlags(clearProfileName: boolean = false): void {
    // if (clearProfileName) {
    //   //this.profile_name = '';
    //   // this.currentEditId = '';
    // }
    this.airlineForm.reset({ is_enable: false });
    this.disableBtn = false;
    this.isEdit = false;
    this.editIndex = -1;
  }

  // resetForm(): void {
  //   this.airlineForm.reset();
  //   this.airlineForm.patchValue({
  //     is_enable: true,
  //     airline_id: [],
  //     fare_class: [],
  //     airport_code_id: [],
  //     stops: []
  //   });
  // }


  onDelete(row: any, rowIndex: number): void {

    this.dataList.splice(rowIndex, 1);
    this.dataList = [...this.dataList];

    const inventories = this.dataList.map(item => {
      return {
        ...item,
      };
    });

    const payload = {
      id: this.createdProfile?.id || '',
      profile_name: this.createdProfile.profile_name,
      is_default: false,
      inventories: inventories
    };

    this.supplierInventoryProfileService.createSupplierInventoryProfile(payload).subscribe({
      next: (res) => {
        this.toasterService.showToast('success', 'Record deleted successfully.', 'top-right');
      },
      error: (err) => {
        this.toasterService.showToast('error', 'Failed to update profile after deletion.', 'top-right');
      }
    });
  }



  getSupplierNameById(id: number | string): string {
    const supplier = this.supplierList.find(s => s.id === id);
    return supplier ? supplier.company_name : '';
  }

  onRefresh(): void {
    if (this.currentEditId) {
      this.loadRecord(this.currentEditId);
    } else {
      console.warn('No record found');
    }
  }

}
