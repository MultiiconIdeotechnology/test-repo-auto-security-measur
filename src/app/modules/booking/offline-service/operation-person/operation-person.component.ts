import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReplaySubject, debounceTime, distinctUntilChanged, filter, startWith, switchMap } from 'rxjs';
import { MarkupprofileService } from 'app/services/markupprofile.service';
import { EmployeeService } from 'app/services/employee.service';
import { OfflineserviceService } from 'app/services/offlineservice.service';
import { AlertService } from 'app/services/alert.service';
import { ToasterService } from 'app/services/toaster.service';

@Component({
  selector: 'app-operation-person',
  templateUrl: './operation-person.component.html',
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

export class OperationPersonComponent {
  record: any = {};
  formGroup: FormGroup;
  OperationPersonList: ReplaySubject<any[]> = new ReplaySubject<any[]>()

  constructor(
    public matDialogRef: MatDialogRef<OperationPersonComponent>,
    private builder: FormBuilder,
    private employeeService: EmployeeService,
    private offlineserviceService: OfflineserviceService,
    private alertService: ToasterService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    if (data) {
      this.record = data
    }
  }

  note = new FormControl();

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      operationPersonId: [''],
      operationPersonFilter: [''],
    });

    this.formGroup.get('operationPersonFilter').valueChanges
      .pipe(
        filter(search => !!search),
        startWith(''),
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((value: any) => {
          return this.employeeService.getOperationPersonCombo(value);
        })
      )
      .subscribe(data => this.OperationPersonList.next(data));

    if (this.record.operation_person_id) {
      this.formGroup.get('operationPersonFilter').patchValue(this.record.operation_person);
      this.formGroup.get('operationPersonId').patchValue(this.record.operation_person_id);
    }
  }

  submit(): void {
    this.offlineserviceService.updateOperationPerson({ id: this.data.id, emp_id: this.formGroup.get('operationPersonId').value }).subscribe({
      next: (value) => {
        this.alertService.showToast('success', "Operation person saved");
        this.matDialogRef.close(true);
      }, error: (err) => {
        this.alertService.showToast('error', err);
      },
    })
  }
}
