import { LiveAnnouncer } from '@angular/cdk/a11y';
import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, ReplaySubject, startWith, switchMap } from 'rxjs';
import { ToasterService } from 'app/services/toaster.service';
import { SupplierApiService } from 'app/services/supplier-api.service';
import { SupplierService } from 'app/services/supplier.service';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';

@Component({
  selector: 'app-supplier-api-entry',
  templateUrl: './supplier-api-entry.component.html',
  // styleUrls: ['./supplier-api-entry.component.scss']
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    DatePipe,
    AsyncPipe,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatSlideToggleModule,
    MatTooltipModule,
    NgxMatTimepickerModule,
    NgxMatSelectSearchModule
  ],
})
export class SupplierApiEntryComponent {

  disableBtn: boolean = false
  readonly: boolean = false;
  record: any = {};
  shortList: any[] = [];
  SupplierList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
  fieldList: {};

  api_for: any[] = [
    { value: 'Airline', viewValue: 'Airline' },
    { value: 'BUS', viewValue: 'BUS' },
    { value: 'Hotel', viewValue: 'Hotel' },
    { value: 'Insurance', viewValue: 'Insurance' },
  ];

  enableList: any[] = [
    { value: 'Both', viewValue: 'Both' },
    { value: 'B2B', viewValue: 'B2B' },
    { value: 'B2C', viewValue: 'B2C' },
  ];

  inventoryList: any[] = [
    { value: 'Both', viewValue: 'Both' },
    { value: 'Domestic', viewValue: 'Domestic' },
    { value: 'International', viewValue: 'International' },
  ];

  constructor(
    public matDialogRef: MatDialogRef<SupplierApiEntryComponent>,
    private builder: FormBuilder,
    private supplierapiService: SupplierApiService,
    private supplierService: SupplierService,
    public alertService: ToasterService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data?.data ?? {}
  }

  formGroup: FormGroup;
  title = "Create Supplier API"
  btnLabel = "Create"

  keywords = [];

  announcer = inject(LiveAnnouncer);

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      supplier_id: [''],
      supplierFilter: [''],
      // api_for: [''],
      agency_code: [''],
      user_id: [''],
      password: [''],
      api_key: [''],
      api_secret: [''],
      base_url_1: [''],
      base_url_2: [''],
      base_url_3: [''],
      udf_1: [''],
      udf_2: [''],
      udf_3: [''],
      enable_for: [''],
      inventory_for: [''],
      is_live: [false]
    });

    this.formGroup.get('enable_for').patchValue('Both')
    this.formGroup.get('inventory_for').patchValue('Both')


    this.formGroup.get('supplierFilter').valueChanges.pipe(
      filter(search => !!search),
      startWith(''),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((value: any) => {
        return this.supplierService.getSupplierCombo(value);
      })
    ).subscribe(data => this.SupplierList.next(data))

    if (this.record.id) {
      this.supplierapiService.getSupplierWiseApiRecord(this.record.id).subscribe({
        next: (data) => {
          this.readonly = this.data.readonly;
          if (this.readonly) {
            this.fieldList = [
              { name: 'Supplier Name', value: data.supplier_name },
              // { name: 'API For', value: data.api_for},
              { name: 'Agency Code', value: data.agency_code },
              { name: 'User ID', value: data.user_id },
              { name: 'API Key', value: data.api_key },
              { name: 'Enable For', value: data.enable_for },
              { name: 'Inventory For', value: data.inventory_for },
              { name: 'Live Credentials', value: data.is_live ? 'Yes' : 'No' },
            ]
          }
          this.formGroup.patchValue(this.record);
          this.formGroup.get('supplierFilter').patchValue(this.record?.supplier_name);
          this.formGroup.get('supplier_id').patchValue(this.record?.supplier_id);

          // this.formGroup.get('udf_1').patchValue(this.record.udf_1)

          // this.formGroup.get('cityfilter').patchValue(this.record.city_name);
          this.title = this.readonly ? 'Info Supplier API' : 'Modify Supplier API';
          this.btnLabel = this.readonly ? 'Close' : 'Save';
        },
        error: (err) => {
          this.alertService.showToast('error', err)

        },

      });
    }

  }

  submit(): void {
    if (!this.formGroup.valid) {
      this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.formGroup.markAllAsTouched();
      return;
    }

    this.disableBtn = true;
    const json = this.formGroup.getRawValue();
    this.supplierapiService.create(json).subscribe({
      next: () => {
        this.matDialogRef.close(true);
        this.disableBtn = false;
      }, error: (err) => {
        this.disableBtn = false;
        this.alertService.showToast('error', err, "top-right", true);
      }
    })
  }

}
