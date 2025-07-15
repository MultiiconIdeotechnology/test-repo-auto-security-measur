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
import { DataManagerService } from 'app/services/data-manager.service';
import { RefferralService } from 'app/services/referral.service';
import { SidebarCustomModalService } from 'app/services/sidebar-custom-modal.service';
import { ToasterService } from 'app/services/toaster.service';
import { debounceTime, distinctUntilChanged, filter, startWith, Subject, switchMap, takeUntil } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { CommonFareTypeService } from 'app/services/commonFareType.service';
import { FlightTabService } from 'app/services/flight-tab.service';

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

  ],

})
export class SupplierTypeEntryComponent {
  @ViewChild('settingsDrawer') settingsDrawer: MatSidenav;
  private destroy$: Subject<any> = new Subject<any>();
  title: string = 'Add'
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
    private dataManagerService: DataManagerService,
    private referralService: RefferralService,
    private alertService: ToasterService,
    private commonFareTypeService: CommonFareTypeService,
    private flighttabService: FlightTabService,
  ) {
    this.formGroup = this.builder.group({
      id: [''],
      air_id: '',
      airfilter: '',

      supplier_id: [''],
      supplier_fare_type: [''],

      bonton_fare_type: [''],
      bonton_fare_type_id: ['']
    })
  }

  ngOnInit(): void {

    // subscribing to modalchange on create and modify
    this.sidebarDialogService.onModalChange().pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) {
        this.getSupplierCombo();
        this.getSupplierFareTypeCombo();
        this.getBontonFareTypeCombo();
        if (res['type'] == 'supplier-fareType-create') {
          this.settingsDrawer.open();
          this.title = 'Add';
          this.buttonLabel = "Create";
          this.resetForm();
        } else if (res['type'] == 'Supplier common-fareType-edit') {
          this.settingsDrawer.open();
          this.title = 'Modify';
          this.buttonLabel = "Update";
          if (res?.data) {
            this.isEdit = true;
            this.formGroup.patchValue(res?.data?.data)
          }
        }
      }
    });


  }

  getSupplierCombo() {
    this.formGroup
      .get('airfilter')
      .valueChanges.pipe(
        filter((search) => !!search),
        startWith(''),
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((value: any) => {
          return this.commonFareTypeService.getFareypeSupplierBoCombo('Airline', value);
        })
      )
      .subscribe({
        next: data => {
          if (!this.supplierAllList?.length) {
            this.supplierAllList = data
          }
          this.supplierList = data
          //this.formGroup.get('air_id').setValue(this.supplierList[0]?.id);
        }
      });
  }

  getSupplierFareTypeCombo() {
    this.formGroup
      .get('supplier_fare_type')
      .valueChanges.pipe(
        filter((search) => !!search),
        startWith(''),
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((value: any) => {
          return this.commonFareTypeService.getSupplierFareTypeCombo(value);
        })
      )
      .subscribe({
        next: data => {
          if (!this.supplierFareTypeAllList?.length) {
            this.supplierFareTypeAllList = data
          }
          this.supplierFareTypeList = data
          //this.formGroup.get('supplier_id').setValue(this.supplierFareTypeList[0]?.id);
        }
      });
  }

  getBontonFareTypeCombo() {
    this.formGroup
      .get('bonton_fare_type')
      .valueChanges.pipe(
        filter((search) => !!search),
        startWith(''),
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((value: any) => {
          return this.commonFareTypeService.getCommonFareTypeCombo(value);
        })
      )
      .subscribe({
        next: data => {
          if (!this.bontonFareTypeAllList?.length) {
            this.bontonFareTypeAllList = data
          }
          this.bontonFareTypeList = data
          // this.formGroup.get('bonton_fare_type_id').setValue(this.bontonFareTypeList[0]?.id);
        }
      });
  }

  public compareWith(v1: any, v2: any) {
    return v1 && v2 && v1.id === v2.id;
  }

  public compareWithFareTypeSupplier(v1: any, v2: any) {
    return v1 && v2 && v1.id === v2.id;
  }

  public compareWithFareTypeBonton(v1: any, v2: any) {
    return v1 && v2 && v1.id === v2.id;
  }



  // reseting form to default value
  resetForm() {
    this.formGroup?.patchValue({
      id: '',
      air_id: '',
      airfilter: '',

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
      id: '',
      //air_id: json.air_id.id,
      // airfilter: json.air_id.company_name,

      supplier_id: json.supplier_id.id,
      supplier_fare_type: json.supplier_id.class_of_service,

      bonton_fare_type: json.bonton_fare_type_id.fare_type,
      bonton_fare_type_id: json.bonton_fare_type_id.id
    }
    console.log("json>>", json);

    //return
    this.disableBtn = true
    this.commonFareTypeService.createSupplierFareTypeMapper(model).subscribe({
      next: (data) => {
        // this.alertService.showToast('success', 'Fare type created successfully');
        this.alertService.showToast('success', this.isEdit ? 'Supplier Fare type updated successfully' : 'Supplier Fare type created successfully');
        this.resetForm();
        if (data.id) {
          debugger;
          let resData = {
            // id: data?.id,
            // fare_type: data?.fare_type,
            // entry_date_time: data?.entry_date_time,
            // modify_date_time: data?.modify_date_time,
            id: '',
            air_id: '',
            airfilter: '',

            supplier_id: '',
            supplier_fare_type: '',

            bonton_fare_type: '',
            bonton_fare_type_id: ''
          }
          this.sidebarDialogService.close({ data: resData, key: 'create-response-fareType' });
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

