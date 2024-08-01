import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgClass, DatePipe, AsyncPipe, NgFor } from '@angular/common';
import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { ReplaySubject, debounceTime, distinctUntilChanged, filter, startWith, switchMap } from 'rxjs';
import { ToasterService } from 'app/services/toaster.service';
import { EmployeeService } from 'app/services/employee.service';
import { DepartmentService } from 'app/services/department.service';
import { DesignationService } from 'app/services/designation.service';
import { AlertService } from 'app/services/alert.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Linq } from 'app/utils/linq';

@Component({
  selector: 'app-designation-entry',
  templateUrl: './designation-entry.component.html',
  styles: [
    `
      .cdk-overlay-container,
      .cdk-global-overlay-wrapper {
        pointer-events: none;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
      }
    `
  ],
  encapsulation: ViewEncapsulation.None,
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
    MatSnackBarModule,
    NgxMatSelectSearchModule,
  ]
})
export class DesignationEntryComponent {
  disableBtn: boolean = false
  readonly: boolean = false;
  departmentList: any[] = [];
  employeeList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
  record: any = {};
  fieldList : {};


  constructor(
    public matDialogRef: MatDialogRef<DesignationEntryComponent>,
    private builder: FormBuilder,
    private designationService: DesignationService,
    private departmentService: DepartmentService,
    private employeeService: EmployeeService,
    private alertService: AlertService,
    private toastr: ToasterService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data?.data ?? {}
  }

  formGroup: FormGroup;
  title = "Create Designation"
  btnLabel = "Create"

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      department_id: [''],
      department_name: [''],
      designation: [''],
      reporting_person_id: [''],
      reporting_person_name: [''],
      remark: [''],

      empfilter: ['']
    });

  //   this.formGroup.get('designation').valueChanges.subscribe(text => {
  //     this.formGroup.get('designation').patchValue(Linq.convertToTitleCase(text), { emitEvent: false });
  //  }) 

    if (this.record.id) {
      this.formGroup.patchValue(this.record)
      this.readonly = this.data.readonly;

      if(this.readonly){
        this.fieldList = [
          { name: 'Department', value: this.record.department_name},
          { name: 'Designation', value: this.record.designation },
          { name: 'Reporting Person', value: this.record.reporting_person_name },
          { name: 'Remark', value: this.record.remark },
        ]
      }



      this.formGroup.get('empfilter').patchValue(this.record.reporting_person_name);
      this.title = this.readonly ? ("Designation - " + this.record.designation) : 'Modify Designation';
      this.btnLabel = this.readonly ? "Close" : 'Save';
    }

    this.departmentService.getDepartmentCombo().subscribe({
      next: res => {
        this.departmentList = res;
      }
    })

    this.formGroup.get('empfilter').valueChanges.pipe(
      filter(search => !!search),
      startWith(''),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((value: any) => {
        return this.employeeService.getemployeeCombo(value);
      })
    ).subscribe(data => this.employeeList.next(data));
  }

  submit(): void {
    if(!this.formGroup.valid){
      this.toastr.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.formGroup.markAllAsTouched();
      return;
}

    this.disableBtn = true;
    const json = this.formGroup.getRawValue();
    this.designationService.create(json).subscribe({
      next: () => {
        this.matDialogRef.close(true);
        this.toastr.showToast('success',this.btnLabel === 'Create'? "Designation Created":'Designation Saved');
        // this.alertService.open({ alert: 'success', message: 'Created' })
        this.disableBtn = false;
      }, error: (err) => {
        this.toastr.showToast('error',err,'top-right',true)
        this.disableBtn = false;
      }
    })
  }

}
