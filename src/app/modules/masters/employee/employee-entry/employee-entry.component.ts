import { DateTime } from 'luxon';
import { Routes, imgExtantions } from 'app/common/const';
import { Component, OnInit } from '@angular/core';
import { CommonUtils, DocValidationDTO } from 'app/utils/commonutils';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ReplaySubject, debounceTime, distinctUntilChanged, filter, startWith, switchMap } from 'rxjs';
import { ToasterService } from 'app/services/toaster.service';
import { DesignationService } from 'app/services/designation.service';
import { CityService } from 'app/services/city.service';
import { EmployeeService } from 'app/services/employee.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
// import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { DepartmentService } from 'app/services/department.service';
import { Linq } from 'app/utils/linq';
import { lowerCase } from 'lodash';

@Component({
  selector: 'app-employee-entry',
  templateUrl: './employee-entry.component.html',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
    RouterModule,
    ReactiveFormsModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    // MatNativeDateModule,
    MatTooltipModule,
    MatMenuModule,
    NgxMatTimepickerModule,
    NgxMatSelectSearchModule,
  ],
})

export class EmployeeEntryComponent implements OnInit {
  employeeListRoute = Routes.hr.employee_route;
  designations: any[] = [];
  readonly: boolean = false;
  record: any = {};
  btnTitle: string = 'Create';
  fieldList: {};
  profile_picture: any;
  disableBtn: boolean = false

  constructor(
    public formBuilder: FormBuilder,
    public cityService: CityService,
    public employeeService: EmployeeService,
    public router: Router,
    public route: ActivatedRoute,
    public alertService: ToasterService,
    public designationService: DesignationService,
    public departmentService: DepartmentService,
  ) { }

  formGroup: FormGroup;
  cityList: any[] = [];
  // cityList: ReplaySubject<any[]> = new ReplaySubject<any[]>()
  designationList: any[] = [];
  genderList: string[] = ['Male', 'Female'];
  first :boolean = true

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      id: [""],
      employee_name: [""],
      company_email: ['',Validators.email],
      company_number: [""],
      personal_email: ['',Validators.email],
      personal_number: [""],
      emergency_number: [""],
      city_id: [""],
      address: [""],
      office_location: [""],
      birth_date: [""],
      gender: ["Male"],
      designation_id: [""],
      department_id: [""],
      joining_date: [""],
      is_working: [true],
      shift_start_time: [""],
      shift_end_time: [""],
      profile_picture: [""],
      cityfilter: [""],
      designationfilter: [""],
      departmentfilter: [""],
    });

    this.formGroup.get('employee_name').valueChanges.subscribe(text => {
      this.formGroup.get('employee_name').patchValue(Linq.convertToTitleCase(text), { emitEvent: false });
   })

   this.formGroup.get('company_email').valueChanges.subscribe(text => {
    this.formGroup.get('company_email').patchValue(text.toLowerCase(), { emitEvent: false });
  })

  this.formGroup.get('personal_email').valueChanges.subscribe(text => {
    this.formGroup.get('personal_email').patchValue(text.toLowerCase(), { emitEvent: false });
  })

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      const readonly = params.get('readonly');

      if (id) {
        this.readonly = readonly ? true : false;
        this.btnTitle = readonly ? 'Close' : 'Save';
        this.employeeService.getemployeeRecord(id).subscribe({
          next: data => {
            data.shift_start_time = DateTime.fromISO(data.shift_start_time).toFormat('HH:mm').toString()
            data.shift_end_time = DateTime.fromISO(data.shift_end_time).toFormat('HH:mm').toString()
            this.record = data;
            if (this.record.profile_picture)
              this.profile_picture = this.record.profile_picture;
            data.profile_picture = "";
            this.formGroup.patchValue(data);
            this.formGroup.get('cityfilter').patchValue(data.city);

            if (this.readonly) {
              this.fieldList = [
                { name: 'Name', value: this.record.employee_name + (this.record.is_blocked ? ' (Blocked)' : '') },
                { name: 'Birth Date', value: DateTime.fromISO(this.record.birth_date).toFormat('dd-MM-yyyy').toString() },
                { name: 'Gender', value: this.record.gender },
                { name: 'Designation', value: this.record.designation },
                { name: 'Company Email', value: this.record.company_email },
                { name: 'Company Number', value: this.record.company_number },
                { name: 'Personal Email', value: this.record.personal_email },
                { name: 'Personal Number', value: this.record.personal_number },
                { name: 'Emergency Number', value: this.record.emergency_number},
                { name: 'Joining Date', value: `${DateTime.fromISO(this.record.joining_date).toFormat('dd-MM-yyyy').toString()} - ${(this.record.is_working ? 'Countinue' : DateTime.fromISO(this.record.last_working_date).toFormat('dd-MM-yyyy').toString())}`, info_tooltip: 'Left Reason: ' + this.record.left_reason, show_info: !this.record.is_working  },
                { name: 'Shift', value: `${DateTime.fromISO(this.record.shift_start_time).toFormat('hh:mm a').toString()} - ${DateTime.fromISO(this.record.shift_end_time).toFormat('hh:mm a').toString()}` },
                { name: 'Office Location', value: this.record.office_location },
                { name: 'City', value: this.record.city },
                { name: 'Address', value: this.record.address },
                { name: 'KYC', value: this.record.is_kyc_completed ? ('Completed on' + ' ' + DateTime.fromISO(this.record.kyc_complete_date).toFormat('dd-MM-yyyy').toString()) : 'Incomplete' },
                { name: 'KYC Profile', value: this.record.kyc_profile },
                { name: 'Permission Profile', value: this.record.permission_profile },
                { name: 'Entry Date Time', value : this.record.entry_date_time ? `${DateTime.fromISO(this.record.entry_date_time).toFormat('dd-MM-yyyy HH:mm').toString()}` : '-'},
                { name: 'Last Login Time', value : this.record.last_login_time ? `${DateTime.fromISO(this.record.last_login_time).toFormat('dd-MM-yyyy HH:mm').toString()}` : '-'}
              ]
            }
          },
          error: (err) => {this.alertService.showToast('error',err,'top-right',true);
                this.disableBtn = false;
            },
        })
      }
    })

    this.designationService.getDesignationCombo().subscribe({
      next: data => {
        this.designationList = data;
        this.designations = data;
      }
    })

    this.formGroup.get('designationfilter').valueChanges.subscribe({
      next: text => this.designationList = this.designations.filter(x => x.designation.toLowerCase().Includes(text.toLowerCase()))
    });

    this.formGroup.get('cityfilter').valueChanges.pipe(
      filter(search => !!search),
      startWith(''),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((value: any) => {
        return this.cityService.getCityCombo(value);
      })
    ).subscribe({next : data => {
       this.cityList = data
      //  if(!this.record.city_id)
      //  this.formGroup.get("city_id").patchValue(this.cityList[0].display_name);

      if(!this.record.city_id){
        this.formGroup.get("city_id").patchValue(data[0].id)
        this.first = false;
      }

      }});
  }

  public onProfileInput(event: any): void {
    const file = (event.target as HTMLInputElement).files[0];

    const extantion: string[] = CommonUtils.valuesArray(imgExtantions);
    var validator: DocValidationDTO = CommonUtils.isDocValid(file, extantion, null, 2);
    if (!validator.valid) {
      this.alertService.showToast('error', validator.alertMessage);
      (event.target as HTMLInputElement).value = '';
      return;
    }

    CommonUtils.getJsonFile(file, (reader, jFile) => {
      this.profile_picture = reader.result;
      this.formGroup.get('profile_picture').patchValue(jFile);
    });

    this.formGroup.get('profile_picture').updateValueAndValidity();

  }

  removePhoto(): void {
    this.formGroup.get('profile_picture').patchValue(null);
    this.profile_picture = null;
  }

  submit(): void {
    if(!this.formGroup.valid){
      this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.formGroup.markAllAsTouched();
      return;
}

    if (this.readonly) {
      this.router.navigate([this.employeeListRoute])
      return
    }
    const json = this.formGroup.getRawValue();
    json.birth_date = DateTime.fromJSDate(new Date(json.birth_date)).toFormat('yyyy-MM-dd');
    json.joining_date = DateTime.fromJSDate(new Date(json.joining_date)).toFormat('yyyy-MM-dd');

    if (typeof json.profile_picture === 'string' ) {
        json.profile_picture = {
            fileName: '',
            fileType: '',
            base64: '',
        };
    }
    json.is_removed = this.profile_picture === null ? true : false;
    this.disableBtn = true
    this.employeeService.create(json).subscribe({
      next: () => {
        if (!json.id) {
          this.alertService.showToast('success', "New record added", "top-right", true);
        }
        if (json.id) {
          this.alertService.showToast('success', "Record modified", "top-right", true);
        }
        // this.alertService.showToast('success', "New record added", "top-right", true);
        this.router.navigate([this.employeeListRoute])
        this.disableBtn = false;
      }, error: err => {
        this.alertService.showToast('error', err, "top-right", true);

        this.disableBtn = false;
      }
    })

  }
}
