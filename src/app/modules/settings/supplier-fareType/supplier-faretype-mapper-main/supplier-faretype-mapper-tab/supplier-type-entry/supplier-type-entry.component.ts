import { Component, ViewChild } from '@angular/core';
import { AsyncPipe, CommonModule, NgFor, NgIf } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatSidenav } from '@angular/material/sidenav';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { SidebarCustomModalService } from 'app/services/sidebar-custom-modal.service';
import { ToasterService } from 'app/services/toaster.service';
import { debounceTime, distinctUntilChanged, Subject, switchMap, takeUntil } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { CommonFareTypeService } from 'app/services/commonFareType.service';
import { cloneDeep } from 'lodash';
import { CacheLabel, CacheService } from 'app/services/cache.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@Component({
  selector: 'app-supplier-type-entry',
  templateUrl: './supplier-type-entry.component.html',
  styleUrls: ['./supplier-type-entry.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FuseDrawerComponent,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    MatSelectModule,
    MatCheckboxModule,
    NgxMatSelectSearchModule,
    MatTooltipModule,
    ReactiveFormsModule,
    NgIf,
    NgFor,
    AsyncPipe,
    RouterModule,
    MatDatepickerModule,
    MatMenuModule,
    NgxMatTimepickerModule,
    MatAutocompleteModule

  ],

})
export class SupplierTypeEntryComponent {
  @ViewChild('settingsDrawer') settingsDrawer: MatSidenav;
  private destroy$: Subject<any> = new Subject<any>();
  title: string = 'Create Supplier Fare Type'
  formGroup: FormGroup;
  buttonLabel: string = 'Create';
  referralData: any = {};
  disableBtn: boolean = false;
  fareTypeAllList: any[] = [];
  fareTypeList: any[] = [];
  fieldList: any[] = [];
  isEdit: boolean = false;
  supplierList: any[] = [];
  supplierAllList: any[] = [];

  supplierFareTypeList: any[] = [];
  supplierFareTypeAllList: any[] = [];

  bontonFareTypeList: any[] = [];
  bontonFareTypeAllList: any[] = [];


  constructor(
    private sidebarDialogService: SidebarCustomModalService,
    private builder: FormBuilder,
    private _filterService: CommonFilterService,
    private cacheService: CacheService,
    private alertService: ToasterService,
    private commonFareTypeService: CommonFareTypeService,
  ) {
    this.formGroup = this.builder.group({
      id: [''],
      supplier_id: '',
      // company_name:'',
      sup_type: '',

      supplier_fare_type: [null],

      bonton_fare_type: [''],
      bonton_fare_type_id: ['']

    })

    this.formGroup.get('sup_type').valueChanges.subscribe(res => {
      const val = res?.trim()?.toLowerCase();
      if (!val)
        this.supplierList = this.supplierAllList;
      else
        this.supplierList = this.supplierAllList.filter(x => x?.company_name?.toLowerCase().includes(val));
    })

    this.formGroup.get('bonton_fare_type').valueChanges.subscribe(res => {
      const val = res?.trim()?.toLowerCase();
      if (!val)
        this.bontonFareTypeList = this.bontonFareTypeAllList;
      else
        this.bontonFareTypeList = this.bontonFareTypeAllList.filter(x => x?.fare_type?.toLowerCase().includes(val));
    })

    this.formGroup.get('supplier_fare_type')?.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe(val => {
        const inputVal = val?.toLowerCase() || '';
        this.supplierFareTypeList = inputVal
          ? this.supplierFareTypeAllList.filter(x =>
            x.class_of_service?.toLowerCase().includes(inputVal)
          )
          : [...this.supplierFareTypeAllList];
      });

  }

  ngOnInit(): void {

    // subscribing to modalchange on create and modify
    this.sidebarDialogService.onModalChange().pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res && (res?.['type'] == 'supplier-fareType-create' || res?.['type'] == 'Supplier common-fareType-edit')) {

        this.resetForm();
        this.getSupplierCombo();
        this.settingsDrawer.open();

        if (res['type'] == 'supplier-fareType-create') {
          this.title = 'Create Supplier Fare Type';
          this.isEdit = false;
          this.buttonLabel = "Create";
        } else if (res['type'] == 'Supplier common-fareType-edit') {
          this.title = 'Modify Supplier Fare Type';
          this.buttonLabel = "Update";
          this.isEdit = true;
        }

        this.cacheService.getOrAdd(CacheLabel.getCommonFareTypeCombo,
          this.commonFareTypeService.getCommonFareTypeCombo('')).subscribe({
            next: data => {
              this.bontonFareTypeAllList = cloneDeep(data);
              this.bontonFareTypeList = this.bontonFareTypeAllList;

              // Only patch if it is edit mode and we have data, logic moved here to ensure data availability
              if (res['type'] == 'Supplier common-fareType-edit' && res?.data?.data?.id) {
                const supplierId = res.data.data.supplierId;
                const bontonFareTypeId = res.data.data.bonton_fare_type_id;

                // Find matching objects now that list is populated
                const bontonFareTypeObj = this.bontonFareTypeList.find(x => x.id === bontonFareTypeId);

                this.formGroup.patchValue({
                  id: res?.data?.data?.id || '',
                  supplier_id: supplierId || '',
                  supplier_fare_type: res.data.data.supplier_fare_type || '',
                  bonton_fare_type_id: bontonFareTypeObj || ''
                });

                if (supplierId) {
                  this.getSupplierFareTypeCombo('', supplierId);
                }
              }
            }
          });
      }
    });


  }

  // ✅ Load Supplier Combo with Search
  getSupplierCombo(): void {
    this.cacheService.getOrAdd(CacheLabel.getFareypeSupplierBoCombo,
      this.commonFareTypeService.getFareypeSupplierBoCombo('Airline', '')).subscribe({
        next: data => {
          this.supplierAllList = cloneDeep(data);
          this.supplierList = this.supplierAllList;
        }
      });
  }

  // getSupplierFareTypeCombo(filter: string, supplier_id: string): void {
  //   this.commonFareTypeService.getSupplierFareTypeCombo(supplier_id, filter).subscribe({
  //     next: data => {
  //       this.supplierFareTypeAllList = data;
  //       this.supplierFareTypeList = [...data]; // show full list initially
  //     }
  //   });
  // }


  getSupplierFareTypeCombo(filter: string, supplier_id: string): void {
    this.commonFareTypeService.getSupplierFareTypeCombo(supplier_id, filter, (this.formGroup.get('id').value?.trim() != '' && this.formGroup.get('id').value != null)).subscribe({
      next: data => {
        this.supplierFareTypeAllList = data;
        this.supplierFareTypeList = [...data]; // show full list initially
      }
    });
  }


  getBontonFareTypeCombo() {
    this.cacheService.getOrAdd(CacheLabel.getCommonFareTypeCombo,
      this.commonFareTypeService.getCommonFareTypeCombo('')).subscribe({
        next: data => {
          this.bontonFareTypeAllList = cloneDeep(data);
          this.bontonFareTypeList = this.bontonFareTypeAllList;
        }
      });
  }

  //compareWithFareTypeSupplier = (a: any, b: any) => a && b && a.class_of_service == b.supplier_fare_type;
  compareWithFareTypeBonton = (a: any, b: any) => a && b && a.id === b.id;
  compareWith = (a: any, b: any) => a === b; // for IDs




  // reseting form to default value
  resetForm() {
    this.formGroup?.patchValue({
      id: '',

      sup_type: '',

      supplier_id: '',
      supplier_fare_type: '',

      bonton_fare_type: '',
      bonton_fare_type_id: ''

    })
    this.disableBtn = false;

  }

  submit(): void {
    if (!this.formGroup.valid) {
      this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.formGroup.markAllAsTouched();
      return;
    }

    const json = this.formGroup.getRawValue();
    const model = {
      id: json.id,

      supplier_id: json.supplier_id,
      supplier_fare_type: json.supplier_fare_type,

      bonton_fare_type: json.bonton_fare_type_id.fare_type,
      bonton_fare_type_id: json.bonton_fare_type_id.id
    }

    //return
    this.disableBtn = true
    this.commonFareTypeService.createSupplierFareTypeMapper(model).subscribe({
      next: (data) => {
        // this.alertService.showToast('success', 'Fare type created successfully');
        this.alertService.showToast('success', this.isEdit ? 'Supplier Fare type updated successfully' : 'Supplier Fare type created successfully');
        this.resetForm();
        if (data.id) {
          let resData = {
            "id": data.id,
            "supplierId": data?.supplier_id,
            "company_name": data?.supplier_name,
            "supplier_fare_type": data?.supplier_fare_type,
            "bonton_fare_type_id": data?.bonton_fare_type_id,
            "bonton_fare_type": data?.bonton_fare_type,
            "entry_date_time": data?.entry_date_time,
            "modify_date_time": data?.modify_date_time
          }

          this.sidebarDialogService.close({ data: resData, key: 'create-response-supplier-fareType' });
          this.settingsDrawer.close();
        }

        this.disableBtn = false;
      }, error: (err) => {
        this.alertService.showToast('error', err)
        this.disableBtn = false
      }
    });

  }

}

