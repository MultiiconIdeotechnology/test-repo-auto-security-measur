import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgClass, DatePipe, AsyncPipe, NgFor } from '@angular/common';
import { ReplaySubject, debounceTime, distinctUntilChanged, filter, startWith, switchMap } from 'rxjs';
import { EmployeeService } from 'app/services/employee.service';
import { DepartmentService } from 'app/services/department.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Linq } from 'app/utils/linq';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToasterService } from 'app/services/toaster.service';

@Component({
  selector: 'app-department-entry',
  templateUrl: './department-entry.component.html',
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
    MatTooltipModule
  ],
})
export class DepartmentEntryComponent {
  disableBtn: boolean = false
  readonly: boolean = false;
  employeeList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
  record: any = {};
  fieldList: {};

  constructor(
    public matDialogRef: MatDialogRef<DepartmentEntryComponent>,
    private builder: FormBuilder,
    private departmentService: DepartmentService,
    private alertService: ToasterService,
    private employeeService: EmployeeService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) { 
    this.record = data?.data ?? {}
  }

  formGroup: FormGroup;
  title = "Create Department"
  btnLabel = "Create"

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      department_name: [''],
      hod_id: [''],
      hod: [''],
      remark: [''],
      empfilter: ['']
    });

    if (this.record.id) {
      this.formGroup.patchValue(this.record)
      this.readonly = this.data.readonly;

      if(this.readonly){
        this.fieldList = [
          { name: 'Department', value: this.record.department_name},
          { name: 'HOD', value: this.record.hod },
          { name: 'Remark', value: this.record.remark },
        ]
      }
      
      this.title = this.readonly ? ("Department - " + this.record.department_name) : 'Modify Department';
      this.btnLabel = this.readonly ? "Close" : 'Save';
    }

    this.formGroup.get('empfilter').valueChanges.pipe(
      filter(search => !!search),
      startWith(''),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((value: any) => {
        return this.employeeService.getemployeeCombo(value);
      })
    ).subscribe(data => this.employeeList.next(data));

    if(this.record){
      this.formGroup.get('empfilter').patchValue(this.record.hod);
    }
  }

  submit(): void {
    if(!this.formGroup.valid){
      this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.formGroup.markAllAsTouched();
      return;
}

    this.disableBtn = true;
    const json = this.formGroup.getRawValue();
    this.departmentService.create(json).subscribe({
      next: () => {
       this.matDialogRef.close(true);
       this.disableBtn = false;
      }, error: (err) => {
          this.alertService.showToast('error',err,'top-right',true);
        this.disableBtn = false;
      }
    })
  }

}

