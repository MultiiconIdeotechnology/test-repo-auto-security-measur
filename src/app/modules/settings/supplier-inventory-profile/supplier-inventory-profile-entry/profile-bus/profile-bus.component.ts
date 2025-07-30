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
import { BaseListingComponent } from 'app/form-models/base-listing';
import { CacheLabel, CacheService } from 'app/services/cache.service';
import { EntityService } from 'app/services/entity.service';
import { SupplierInventoryProfileService } from 'app/services/supplier-inventory-profile.service';
import { ToasterService } from 'app/services/toaster.service';
import { cloneDeep } from 'lodash';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-profile-bus',
  templateUrl: './profile-bus.component.html',
  styleUrls: ['./profile-bus.component.scss'],
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
export class ProfileBusComponent extends BaseListingComponent {
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
  starList: number[] = [1, 2, 3, 4, 5];
  editIndex: number | null = null;
  fareTypeClassOptions: any[] = [];


  constructor(
    private formBuilder: FormBuilder,
    private supplierInventoryProfileService: SupplierInventoryProfileService,
    private toasterService: ToasterService,
    private entityService: EntityService,
    private cacheService: CacheService
  ) {

    super('')

    this.airlineForm = this.formBuilder.group({
      id: [''],
      supplier_id: ['', Validators.required],
      supplier_name: [''],
      sup_type: [''],
      user_type: ['', Validators.required],
      is_enable: true
    });

    this.airlineForm.get('sup_type').valueChanges.subscribe(res => {
      const val = res?.trim()?.toLowerCase();
      if (!val)
        this.supplierList = this.supplierAllList;
      else
        this.supplierList = this.supplierAllList.filter(x => x?.company_name?.toLowerCase().includes(val));
    })

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
    }

  }

  ngOnInit(): void {

  }


  initializeForm(): void {
    this.airlineForm = this.formBuilder.group({
      id: [''],
      profile_name: [''],
      supplier_id: [''],
      sup_type: [''],
      supplier_name: [''],
      user_type: [''],
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
      is_enable: row.is_enable
    });

    this.suplier_id = row.supplier_id;
    this.suplier_name = row.supplier_name;
    this.onSupplierChange({ id: row.supplier_id, company_name: row.supplier_name });
  }


  getSupplierCombo(): void {
    this.cacheService.getOrAdd(CacheLabel.getFareypeSupplierBusCombo,
      this.supplierInventoryProfileService.getFareypeSupplierBoCombo('Bus', '')).subscribe({
        next: data => {
          this.supplierAllList = cloneDeep(data);
          this.supplierList = this.supplierAllList;
        }
      });
  }


  onSupplierChange(supplier: any): void {
    if (supplier?.id) {
      this.suplier_id = supplier.id;
      this.suplier_name = supplier.company_name;
    }
  }

  compareWith(o1: any, o2: any): boolean {
    return o1 && o2 && o1.id === o2.id;
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
      service: 'Bus',
      supplier_id: this.suplier_id,
      supplier_name: this.suplier_name,
      user_type: formValue.user_type,
      id: formValue.id,
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
      id: inventory.id,

      is_enable: inventory.is_enable,
      // isEnable: inventory.is_enable,
      // supplier: inventory.supplier_name,
      // usertype: inventory.user_type,
      // triptype: inventory.trip_type
    };
  }

  isMatchingInventory(a: any, b: any): boolean {
    return (
      a.supplier_id === b.supplier_id &&
      a.user_type === b.user_type
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
    if (this.currentEditId) {
      this.loadRecord(this.currentEditId);
    } else {
      console.warn('No record ID to refresh');
    }
  }

}
