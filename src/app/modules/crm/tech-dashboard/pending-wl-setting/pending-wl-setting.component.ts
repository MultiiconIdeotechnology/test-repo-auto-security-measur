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
import { urlValidator } from 'app/common/urlValidator';
import { MatDividerModule } from '@angular/material/divider';

@Component({
    selector: 'app-pending-wl-setting',
    templateUrl: './pending-wl-setting.component.html',
    styleUrls: ['./pending-wl-setting.component.scss'],
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
export class PendingWLSettingComponent {
    getWLSettingList: any[] = [];
    disableBtn: boolean = false;
    rmList: any[] = [];
    record: any;
    wlsetting: any;
    readonly: any;

    statusList: any[] = [
        { value: 'Pending', viewValue: 'Pending' },
        { value: 'Delivered', viewValue: 'Delivered' },
        { value: 'Waiting for Customer Update', viewValue: 'Waiting for Customer Update' },
        { value: 'Waiting for Account Activation', viewValue: 'Waiting for Account Activation' },
        { value: 'Inprocess', viewValue: 'Inprocess' },
        { value: 'Rejected from Store', viewValue: 'Rejected from Store' }
    ];

    constructor(
        public matDialogRef: MatDialogRef<PendingWLSettingComponent>,
        private builder: FormBuilder,
        public alertService: ToasterService,
        private crmService: CrmService,
        @Inject(MAT_DIALOG_DATA) public data: any = {},
        @Inject(MAT_DIALOG_DATA) public wlsettingnew: any = {},
    ) {
        this.record = data;
        this.wlsetting = wlsettingnew;
    }

    formGroup: FormGroup;
    title = 'WL Setting';
    btnLabel = 'Submit';

    ngOnInit(): void {
        this.formGroup = this.builder.group({
            id: [''],
            partner_panel_url: ['', [Validators.required]],
            b2c_portal_url: [''],
            api_url: [''],
            android_app_url: [''],
            ios_app_url: [''],
        });

        if(this.wlsetting?.wlsetting){
            this.formGroup.get('partner_panel_url').patchValue(this.wlsetting?.wlsetting?.partner_panel_url);
            this.formGroup.get('b2c_portal_url').patchValue(this.wlsetting?.wlsetting?.b2c_portal_url);
            this.formGroup.get('api_url').patchValue(this.wlsetting?.wlsetting?.api_url);
            this.formGroup.get('android_app_url').patchValue(this.wlsetting?.wlsetting?.android_app_url);
            this.formGroup.get('ios_app_url').patchValue(this.wlsetting?.wlsetting?.ios_app_url);
        }
    }

    submit(): void {
        if (!this.formGroup.valid) {
            // this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
            this.alertService.showToast('error', 'Please enter a valid URL.', 'top-right', true);
            this.formGroup.markAllAsTouched();
            return;
        }

        this.disableBtn = true;
        const json = this.formGroup.getRawValue();
        const newJson = {
            // id: this.record?.data?.id ? this.record?.data?.id : "",
            id: "",
            agent_id: this.record?.data?.code ? this.record?.data?.code : "",
            theme_id: "",
            partner_panel_url: json.partner_panel_url ? json.partner_panel_url : "",
            b2c_portal_url: json.b2c_portal_url ? json.b2c_portal_url : "",
            api_url: json.api_url ? json.api_url : "",
            android_app_url: json.android_app_url ? json.android_app_url : "",
            ios_app_url: json.ios_app_url ? json.ios_app_url : ""
        }
        this.crmService.createwlSetting(newJson).subscribe({
            next: () => {
                this.matDialogRef.close(true);
                this.alertService.showToast('success', "New WL setting added!", 'top-right', true);
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
