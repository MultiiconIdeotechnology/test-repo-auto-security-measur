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
import { RefferralService } from 'app/services/referral.service';
import { ToasterService } from 'app/services/toaster.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';

@Component({
    selector: 'app-pending-link',
    templateUrl: './pending-link.component.html',
    styleUrls: ['./pending-link.component.scss'],
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
    ],
})
export class PendingLinkComponent {
    getWLSettingList: any[] = [];
    disableBtn: boolean = false;
    rmList: any[] = [];
    record: any;
    readonly: any;

    constructor(
        public matDialogRef: MatDialogRef<PendingLinkComponent>,
        private builder: FormBuilder,
        public alertService: ToasterService,
        private crmService: CrmService,
        @Inject(MAT_DIALOG_DATA) public data: any = {},
    ) {
        this.record = data;
    }

    formGroup: FormGroup;
    title = 'Link Url';
    btnLabel = 'Submit';

    ngOnInit(): void {
        this.formGroup = this.builder.group({
            id: [''],
            link_url: ['']
        });
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
            LinkUrl: json?.link_url ? json?.link_url : ""
        }
        this.crmService.createLinkUrl(newJson).subscribe({
            next: () => {
                this.alertService.showToast(
                    'success',
                    'New record added',
                    'top-right',
                    true
                  );
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
