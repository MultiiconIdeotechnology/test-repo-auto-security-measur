import { DatePipe, NgClass, NgIf } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EmployeeService } from 'app/services/employee.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ToasterService } from 'app/services/toaster.service';

@Component({
    selector: 'app-working-status',
    templateUrl: './working-status.component.html',
    standalone: true,
    imports: [
        NgIf,
        NgClass,
        DatePipe,
        ReactiveFormsModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        MatSelectModule,
        MatDatepickerModule,
    ],
})
export class WorkingStatusComponent implements OnInit {
    constructor(
        public matDialogRef: MatDialogRef<WorkingStatusComponent>,
        private builder: FormBuilder,
        private employeeService: EmployeeService,
        public toasterService: ToasterService,
        @Inject(MAT_DIALOG_DATA) public data: any = {}
    ) { }

    formGroup: FormGroup;
    disableBtn: boolean = false;

    ngOnInit(): void {
        this.formGroup = this.builder.group({
            id: [this.data.id],
            is_working: [this.data.is_working],
            date: [this.data.last_working_date],
            note: [this.data.left_reason],
        });
    }

    submit(): void {
        if (!this.formGroup.valid) {
            this.toasterService.showToast('error', 'Please fill all required fields.', 'top-right', true);
            this.formGroup.markAllAsTouched();
            return;
        }

        this.disableBtn = true;
        const json = this.formGroup.getRawValue();
        this.employeeService.setWrokingProfile(json).subscribe({
            next: () => {
                this.matDialogRef.close(true);
                this.disableBtn = false;
                this.toasterService.showToast(
                    'success',
                    'Working Status Saved!'
                );
            },
            error: (err) => {
                this.toasterService.showToast(
                    'error',
                    err
                );
                this.disableBtn = false;
            },
        });
    }
}
