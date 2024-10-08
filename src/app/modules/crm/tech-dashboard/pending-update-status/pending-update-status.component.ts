import { CrmService } from 'app/services/crm.service';
import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToasterService } from 'app/services/toaster.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { MatDividerModule } from '@angular/material/divider';

@Component({
    selector: 'app-pending-update-status',
    templateUrl: './pending-update-status.component.html',
    styleUrls: ['./pending-update-status.component.scss'],
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
        MatMenuModule,
        NgxMatSelectSearchModule,
        NgxMatTimepickerModule,
        MatDividerModule
    ],
})
export class PendingUpdateStatusComponent {

    disableBtn: boolean = false;
    rmList: any[] = [];
    record: any;
    readonly: any;

    statusList: any[] = [
        // { value: 'Pending', viewValue: 'Pending' },
        // { value: 'Delivered', viewValue: 'Delivered' },
        { value: 'Waiting for Customer Update', viewValue: 'Waiting for Customer Update' },
        { value: 'Waiting for Account Activation', viewValue: 'Waiting for Account Activation' },
        { value: 'Inprocess', viewValue: 'Inprocess' },
        { value: 'Google Closed Testing', viewValue: 'Google Closed Testing' },
        { value: 'Rejected from Store', viewValue: 'Rejected from Store' }
    ];

    constructor(
        public matDialogRef: MatDialogRef<PendingUpdateStatusComponent>,
        private builder: FormBuilder,
        private crmService: CrmService,
        public alertService: ToasterService,
        @Inject(MAT_DIALOG_DATA) public data: any = {},
    ) {
        this.record = data;
    }

    formGroup: FormGroup;
    title = 'Update Status';
    btnLabel = 'Submit';

    ngOnInit(): void {
        this.formGroup = this.builder.group({
            id: [''],
            product_status: ['', Validators.required],
            special_status_remark: ['']
        });

        if(this.record?.data?.id){
            this.formGroup.get('product_status').patchValue(this.record?.data?.product_status);
            this.formGroup.get('special_status_remark').patchValue(this.record?.data?.special_status_remark);
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
        const newJson = {
            id: this.record?.data?.id ? this.record?.data?.id : "",
            product_status: json.product_status ? json.product_status : "",
            special_status_remark: json.special_status_remark ? json.special_status_remark : ""
        }
        this.crmService.updateStatus(newJson).subscribe({
            next: () => {
                this.matDialogRef.close(true);
                this.disableBtn = false;
            },
            error: (err) => {
                this.disableBtn = false;
                this.alertService.showToast('error', err, 'top-right', true);
            },
        });
    }


    public compareWith(v1: any, v2: any) {
        return v1 && v2 && v1.id === v2.id;
      }
}
