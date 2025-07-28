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
import { MatSidenav } from '@angular/material/sidenav';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { CacheLabel, CacheService } from 'app/services/cache.service';
import { KycDocumentService } from 'app/services/kyc-document.service';
import { SupplierInventoryProfileService } from 'app/services/supplier-inventory-profile.service';
import { SupplierService } from 'app/services/supplier.service';
import { ToasterService } from 'app/services/toaster.service';
import { cloneDeep } from 'lodash';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Table } from 'primeng/table';
import { debounceTime, distinctUntilChanged } from 'rxjs';

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
  isEdit: boolean = false;
  suplier_name: string = '';
  suplier_id: string = '';

  dataList: any[] = [];

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
      is_enable: [true]
    });




  }
  ngOnChanges(changes: SimpleChanges): void {
    if (this.type === 'edit' && this.record?.id) {
      this.currentEditId = this.record.id;
      this.isEdit = true;

      // 🔁 Then load data and patch
      this.initializeForm();
      this.loadRecord(this.currentEditId);

      // Optional: Set profile name
      if (this.record.profile_name) {
        this.profile_name = this.record.profile_name;
      }

    } else if (this.type === 'create') {
      this.isEdit = false;
      this.airlineForm.reset();
    }
  }



  ngOnInit(): void {
    this.getSupplierCombo();
    this.airlineCombo();
    this.getAirportMstCombo();
    // this.initializeForm();

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
      is_enable: []
    });
  }




  loadRecord(requestId: string): void {
    this.supplierInventoryProfileService.getSupplierInventoryProfileRecord(requestId).subscribe(res => {
      const record = res;
      this.currentEditId = record.id;
      this.profile_name = record.profile_name;

      const settingsArray = record.settings ? JSON.parse(record.settings) : [];

      console.log("settingsArray",settingsArray);
      
      // Clear old grid data
      this.dataList = [];

    //  settingsArray.forEach((setting: any, index: number) => {
        //Patch only the first record to form
       // console.log("setting",setting ,index);
        
        // if (index === 0) {
        console.log(" settingsArray[0]", settingsArray[0]);
        // this.airlineForm.patchValue({
        //   fare_type: settingsArray[0].fare_type,
        // })
        // this.airlineForm.get('fare_type').patchValue(settingsArray[0].fare_type);
        // this.airlineForm.get('airport_codes_visible_type').patchValue(settingsArray[0].airport_codes_visible_type);
        // this.airlineForm.get('airport_codes_visible_type').patchValue(settingsArray[0].airport_codes_visible_type);
        
        // this.airlineForm.patchValue({
        //   fare_type: settingsArray[0].fare_type,
        //   airport_codes_visible_type: settingsArray[0].airport_codes_visible_type,
        //   is_enable: settingsArray[0].is_enable,
        //   stops: settingsArray[0].stops || [],
        //   sup_type: settingsArray[0].supplier_name,
        //   supplier_id: settingsArray[0].supplier_id,
        // })
        
        
          // this.airlineForm.patchValue({
          //   id: this.currentEditId,
          //   supplier_id: settingsArray[0].supplier_id,
          //   supplier_name: settingsArray[0].supplier_name,
          //   user_type: settingsArray[0].user_type,
          //   trip_type: settingsArray[0].trip_type,
          //   route_type: settingsArray[0].route_type,
          //   airline_id: settingsArray[0].airline || [],
          //   fare_class: settingsArray[0].fare_class || [],
          //   fare_type: settingsArray[0].fare_type,
          //   fare_type_class: settingsArray[0].fare_type_class || [],
          //   supplier_fare_type_filter: settingsArray[0].fare_type_class || [],
          //   fare_type_class_visible_type: settingsArray[0].fare_type_class_visible_type,
          //   airport_code_id: settingsArray[0].airport_codes || [],
          //   airport_codes_visible_type: settingsArray[0].airport_codes_visible_type,
          //   stops: settingsArray[0].stops || [],
          //   is_enable: settingsArray[0].is_enable
          // });
        // }

        // 🛠 Mark every record as editable
        // setting.isEdit = true;

        // 📥 Add record to table grid
        // this.appendLocalRow(record.id, settingsArray);
    //  });

      // 💾 Save table data locally
      localStorage.setItem(this.currentEditId, JSON.stringify({ inventories: this.dataList }));
    });
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

  onSupplierChange(supplier: any): void {
    if (supplier && supplier.id) {
      this.suplier_id = supplier.id;
      this.suplier_name = supplier.company_name
      this.getSupplierFareTypeCombo('', supplier.id);
    }
  }

  getSupplierFareTypeCombo(filter: string, supplier_id: string): void {
    const isEdit = this.airlineForm.get('id')?.value?.trim() !== '';
    this.supplierInventoryProfileService.getSupplierFareTypeCombo(supplier_id, filter, isEdit)
      .subscribe({
        next: data => {
          this.supplierFareTypeAllList = cloneDeep(data);
          this.supplierFareTypeList = data;
        }
      });
  }

  compareWith(o1: any, o2: any): boolean {
    return o1 && o2 && o1.id === o2.id;
  }

  // getSupplierFareTypeCombo(filter: string, supplier_id: string): void {
  //   this.supplierInventoryProfileService.getSupplierFareTypeCombo(supplier_id, filter, (this.airlineForm.get('id').value?.trim() != '' && this.airlineForm.get('id').value != null)).subscribe({
  //     next: data => {
  //       this.supplierFareTypeAllList = cloneDeep(data);
  //       this.supplierFareTypeList = data;
  //     }
  //   });
  // }

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

  // submit(): void {
  //   if (this.airlineForm.invalid) {
  //     this.airlineForm.markAllAsTouched();
  //     this.toasterService.showToast('error', 'Please fill all required fields.', 'top-right', true);
  //     return;
  //   }

  //   const formValue = this.airlineForm.value;
  //   const isEdit = this.isEdit && !!this.record?.id;
  //   this.disableBtn = true;


  //   const _rec = {
  //     service: 'Airline',
  //     supplier_id: this.suplier_id,
  //     supplier_name: this.suplier_name, // Add actual name if available
  //     user_type: formValue.user_type,
  //     trip_type: formValue.trip_type,
  //     route_type: formValue.route_type,
  //     airline: formValue.airline_id ? formValue.airline_id : [],
  //     fare_class: formValue.fare_class ? formValue.fare_class : [],
  //     fare_type: formValue.fare_type,
  //     fare_type_class: formValue.fare_type_class ? formValue.fare_type_class : [],
  //     fare_type_class_visible_type: formValue.fare_type_class_visible_type,
  //     airport_codes: formValue.airport_code_id ? formValue.airport_code_id : [],
  //     airport_codes_visible_type: formValue.airport_codes_visible_type,
  //     stops: formValue.stops ? formValue.stops : [],
  //     //star: [], // If you have star rating, assign here
  //     is_enable: formValue.is_enable
  //   };
  //   const data = cloneDeep(this.dataList);
  //   data.push(_rec);


  //   const payload = {
  //     id: isEdit ? this.currentEditId : '',
  //     profile_name: this.profile_name,
  //     is_default: false,
  //     inventories: data
  //   };

  //   console.log("payload", payload);
  //   // return
  //   this.supplierInventoryProfileService.createSupplierInventoryProfile(payload).subscribe({
  //     next: (res) => {
  //       const message = isEdit ? 'Profile updated successfully.' : 'Profile created successfully.';
  //       this.toasterService.showToast('success', message, 'top-right');

  //       const request_id = isEdit ? this.currentEditId : res?.id;




  //       const newRows = {
  //         request_id: request_id,
  //         supplier: _rec.supplier_name,
  //         usertype: _rec.user_type,
  //         isEnable: _rec.is_enable,
  //         triptype: _rec.trip_type,        
  //       };

  //       this.dataList.unshift(newRows);
  //       localStorage.setItem('airlineProfileDataList', JSON.stringify(this.dataList));
  //       // this.dataList = [...this.dataList];

  //       // this.record = null;
  //       this.resetForm();
  //       this.disableBtn = false;
  //     },
  //     error: (error) => {
  //       this.toasterService.showToast('error', error, 'top-right');
  //       this.disableBtn = false;
  //     }
  //   });
  // }

  submit(): void {
    if (this.airlineForm.invalid) {
      this.airlineForm.markAllAsTouched();
      this.toasterService.showToast('error', 'Please fill all required fields.', 'top-right');
      return;
    }

    this.disableBtn = true;
    const formValue = this.airlineForm.value;

    const _rec = {
      service: 'Airline',
      supplier_id: this.suplier_id,
      supplier_name: this.suplier_name,
      user_type: formValue.user_type,
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

    const localRecordStr = this.currentEditId ? localStorage.getItem(this.currentEditId) : null;
    const existingRecord = localRecordStr ? JSON.parse(localRecordStr) : null;

    if (existingRecord) {
      // 👇 Editing existing profile (add to inventories)
      existingRecord.inventories.push(_rec);
      const payload = {
        ...existingRecord,
        inventories: existingRecord.inventories
      };

      this.supplierInventoryProfileService.createSupplierInventoryProfile(payload).subscribe({
        next: () => {
          this.toasterService.showToast('success', 'Profile updated successfully.', 'top-right');
          this.saveToLocalStorage(payload);
          this.appendLocalRow(payload.id, _rec);
        },
        error: (err) => {
          this.toasterService.showToast('error', err, 'top-right');
          this.disableBtn = false;
        }
      });
    } else {
      // 👇 First time: new profile
      const payload = {
        id: '',
        profile_name: this.profile_name,
        is_default: false,
        inventories: [_rec]
      };

      this.supplierInventoryProfileService.createSupplierInventoryProfile(payload).subscribe({
        next: (res) => {
          const profileId = res?.id;
          if (!profileId) {
            this.toasterService.showToast('error', 'Invalid response.', 'top-right');
            this.disableBtn = false;
            return;
          }

          const newRecord = {
            id: profileId,
            profile_name: payload.profile_name,
            is_default: payload.is_default,
            inventories: payload.inventories
          };

          this.currentEditId = profileId;
          this.saveToLocalStorage(newRecord);
          this.appendLocalRow(profileId, _rec);
        },
        error: (err) => {
          this.toasterService.showToast('error', err, 'top-right');
          this.disableBtn = false;
        }
      });
    }
  }

  saveToLocalStorage(record: any): void {
    if (record?.id) {
      localStorage.setItem(record.id, JSON.stringify(record));
    }
  }


  resetEditFlags(): void {
    this.isEdit = false;
    this.editIndex = undefined;
    this.disableBtn = false;
    this.resetForm();
  }




  appendLocalRow(request_id: string, rec: any): void {
    const newRow = {
      request_id: request_id,
      supplier: rec.supplier_name,
      usertype: rec.user_type,
      isEnable: rec.is_enable,
      triptype: rec.trip_type
    };

    this.dataList.unshift(newRow);
    localStorage.setItem('airlineProfileDataList', JSON.stringify(this.dataList));
    this.resetForm();
    this.disableBtn = false;
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

      // ✅ Update localStorage after deletion
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
