import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { EmployeeService } from 'app/services/employee.service';
import { LeadsRegisterService } from 'app/services/leads-register.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ReplaySubject, filter, startWith, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-rmdialog',
  templateUrl: './rmdialog.component.html',
  styleUrls: ['./rmdialog.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    NgClass,
    MatButtonModule,
    MatIconModule,
    DatePipe,
    AsyncPipe,
    NgxMatSelectSearchModule,
    MatSnackBarModule
  ]
})
export class RmdialogComponent {

  record: any = {};
  formGroup: FormGroup;
  employeeList: ReplaySubject<any[]> = new ReplaySubject<any[]>();

  constructor(
    public matDialogRef: MatDialogRef<RmdialogComponent>,
    private builder: FormBuilder,
    private employeeService: EmployeeService,
    private leadsRegisterService: LeadsRegisterService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    if(data){
      this.record = data
    }
  }

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      empId: [''],
      employee_name:[''],

      empfilter: [''],
    });


    this.formGroup.get('empfilter').valueChanges.pipe(
      filter(search => !!search),
      startWith(''),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((value: any) => {
        return this.employeeService.getEmployeeLeadAssignCombo(value);
      })
    ).subscribe(data => this.employeeList.next(data));

    if(this.record.rmName) {
      this.formGroup.get('empfilter').patchValue(this.record.rmName);
      this.formGroup.get('empId').patchValue(this.record.relationship_manager_id);
    }
  }

  submit(): void {
    this.matDialogRef.close(this.formGroup.value);
  }

  public compareWith(v1: any, v2: any) {
    return v1 && v2 && v1.id === v2.id;
  }

}
