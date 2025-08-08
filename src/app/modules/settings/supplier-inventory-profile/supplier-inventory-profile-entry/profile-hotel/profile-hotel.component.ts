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
  selector: 'app-profile-hotel',
  templateUrl: './profile-hotel.component.html',
  styleUrls: ['./profile-hotel.component.scss'],
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
export class ProfileHotelComponent extends BaseListingComponent implements OnChanges {
  @Input() profile_name: string = '';
  @Input() type: string;
  @Input() record: any;
  @Input() createdProfile: any;
  @Output() closeDrawer = new EventEmitter<void>();
  @ViewChild('tableRef') tableRef!: Table;
  @Input() inventoryList: any[] = [];
  airlineForm: FormGroup;
  private _isFormDisabled = false;

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
  userType: any = ['Both', 'B2B', 'B2C'];
  tripTypeList: any = ['Both','Domestic','International'];
  starList: number[] = [1, 2, 3, 4, 5];
  editIndex: number | null = null;


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
      user_type: ['', Validators.required],
      trip_type: ['', Validators.required],
      star: ['', Validators.required],
      is_enable: [false]
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
      //this.loadRecord(this.currentEditId);
      if (this.inventoryList?.length) {
        this.dataList = this.inventoryList.map(inv => this.getDisplayRow(inv));
      }

    } else if (this.type === 'create') {
      this.isEdit = false;
      this.currentRecordRespId = '';
      this.airlineForm.reset({ is_enable: false });
      this.dataList = [];
    }

    if ((this.type == 'create' || this.type == 'edit')) {
      this.getSupplierCombo();
    }

  }

  ngOnInit(): void {

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

  initializeForm(): void {
    this.airlineForm = this.formBuilder.group({
      id: [''],
      profile_name: [''],
      supplier_id: [''],
      sup_type: '',
      supplier_name: [''],
      user_type: [''],
      trip_type: ['',],
      star: [''],
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
      star: row.star || [],
      is_enable: row.is_enable
    });

    this.suplier_id = row.supplier_id;
    this.suplier_name = row.supplier_name;
    this.onSupplierChange({ id: row.supplier_id, company_name: row.supplier_name });
  }


  getSupplierCombo(): void {
    this.cacheService.getOrAdd(CacheLabel.getFareypeSupplierHotelCombo,
      this.supplierInventoryProfileService.getFareypeSupplierBoCombo('Hotel', '')).subscribe({
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
      service: formValue.service || 'Hotel',
      id: formValue.id,
      supplier_id: this.suplier_id,
      supplier_name: this.suplier_name,
      user_type: formValue.user_type,
      trip_type: formValue.trip_type,
      route_type: formValue.route_type,
      star: formValue.star || [],
      is_enable: formValue.is_enable
    };

    //  Maintain inventory list
    // this.sessionInventories = cloneDeep(this.dataList || []);
    // if (newInventory?.id) {
    //   const index = this.sessionInventories.indexOf(this.sessionInventories.find(x => x.id == newInventory.id));

    //   this.sessionInventories[index] = newInventory;
    // } else {
    //   this.sessionInventories.push(newInventory);
    // }

    // //  Add only if it's NOT duplicate (optional)

    // this.sessionInventories.forEach((x, index) => {
    //   x.id = index + 1;
    // })

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

       // this.airlineForm.reset();
        this.resetForm();
        this.disableBtn = false;
      },
      error: (err) => {
        this.toasterService.showToast('error', err, 'top-right');
        this.disableBtn = false;
      }
    });
  }

  getDisplayRow(inventory: any): any {
    return {
      // id,
      // profile_id: id,
      //  profile_name: profileName,
      service: inventory.service,
      supplier_id: inventory.supplier_id,
      supplier_name: inventory.supplier_name,
      user_type: inventory.user_type,
      trip_type: inventory.trip_type,
      id: inventory.id,
      star: inventory.star || [],
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

  resetForm(): void {
    this.airlineForm.reset({ is_enable: false });
  }


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
        this.toasterService.showToast('success', 'Record deleted and updated successfully.', 'top-right');
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
