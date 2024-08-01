import { AsyncPipe, CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
    selector: 'app-reject-visapax-dialog',
    styleUrls: ['./reject-visapax-dialog.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
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
        MatSnackBarModule,
        MatDividerModule,
        MatMenuModule,
        MatTooltipModule
    ],
    templateUrl: './reject-visapax-dialog.component.html'
})
export class RejectVisaPaxDialogComponent {
    rejectVisaPaxForm: FormGroup;
    docs: any[] = [];

    constructor(
        public matDialogRef: MatDialogRef<RejectVisaPaxDialogComponent>,
        private fb: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public datas: any = {}
    ) {
        this.docs = datas.docs;
    }

    ngOnInit(): void {
        this.rejectVisaPaxForm = this.fb.group({
            reject_reason: ''
        });
    }

    saveDetail() {
        const json = this.rejectVisaPaxForm.getRawValue();
        this.matDialogRef.close(json)
    }
}
