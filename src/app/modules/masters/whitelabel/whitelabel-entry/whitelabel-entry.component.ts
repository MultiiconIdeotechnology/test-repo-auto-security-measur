import { DateTime } from 'luxon';
import { CommonUtils, DocValidationDTO } from 'app/utils/commonutils';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { NgIf, NgClass, DatePipe, AsyncPipe, NgFor } from '@angular/common';
import {
    ReplaySubject,
    debounceTime,
    distinctUntilChanged,
    filter,
    startWith,
    switchMap,
} from 'rxjs';
import { ToasterService } from 'app/services/toaster.service';
import { WlService } from 'app/services/wl.service';
import { AgentService } from 'app/services/agent.service';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Clipboard } from '@angular/cdk/clipboard';
import { imgExtantions } from 'app/common/const';
import { MatSliderModule } from '@angular/material/slider';

@Component({
    selector: 'app-whitelabel-entry',
    templateUrl: './whitelabel-entry.component.html',
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
        MatSliderModule,
    ],
})
export class WhitelabelEntryComponent {
    disableBtn: boolean = false;
    readonly: boolean = false;
    record: any = {};
    logo_1: string | null = null;
    logo_2: string | null = null;
    logo_3: string | null = null;
    fav_icon: string | null = null;
    shortList: any[] = [];
    // agentList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
    agentList: any[] = [];


    wl_activation_date: any;
    fieldList: {};
    records: any = {};


    vehicle_types: any[] = [
        { value: 'Hatchback', viewValue: 'Hatchback' },
        { value: 'Sedan', viewValue: 'Sedan' },
        { value: 'SUV', viewValue: 'SUV' },
        { value: 'BUS', viewValue: 'BUS' },
        { value: 'Tempo', viewValue: 'Tempo' },
    ];

    constructor(
        public matDialogRef: MatDialogRef<WhitelabelEntryComponent>,
        private builder: FormBuilder,
        private wlService: WlService,
        public agentService: AgentService,
        public alertService: ToasterService,
        private clipboard: Clipboard,
        @Inject(MAT_DIALOG_DATA) public data: any = {}
    ) {
        this.record = data?.data ?? {};
    }

    formGroup: FormGroup;
    title = 'Create White Lable';
    btnLabel = 'Create';

    keywords = [];

    announcer = inject(LiveAnnouncer);

    ngOnInit(): void {
        this.formGroup = this.builder.group({
            id: [''],
            agent_id: [''],
            agency_name: [''],
            b2b_wl_link: [''],
            api_url: [''],
            b2c_wl_link: [''],
            android_wl_link: [''],
            ios_wl_link: [''],
            fav_icon: [''],
            logo_1: [''],
            logo_2: [''],
            logo_3: [''],
            agentfilter: [''],
        });

        if (this.record.id && this.data.send != 'Agent-WL') {
            this.wlService.getWlRecord(this.record.id).subscribe({
                next: (data) => {
                    this.records = data;

                    this.readonly = this.data.readonly;
                    if (this.readonly) {
                        this.fieldList = [
                            { name: 'Agency Name', value: data.agency_name },
                            {
                                name: 'B2B WL',
                                value: data.is_b2b_wl ? 'Yes' : 'No',
                            },
                            { name: 'B2B WL Link', value: data.b2b_wl_link },
                            { name: 'Api URL', value: data.api_url },
                            {
                                name: 'B2C WL',
                                value: data.is_b2c_wl ? 'Yes' : 'No',
                            },
                            { name: 'B2C WL Link', value: data.b2c_wl_link },
                            {
                                name: 'Android Wl',
                                value: data.is_android_wl ? 'Yes' : 'No',
                            },
                            {
                                name: 'Android WL Link',
                                value: data.android_wl_link,
                            },
                            {
                                name: 'IOS Wl',
                                value: data.is_ios_wl ? 'Yes' : 'No',
                            },
                            { name: 'IOS Wl Link', value: data.ios_wl_link },
                            { name: 'Logo size 1', value: data.logo_1 },
                            { name: 'Logo size 2', value: data.logo_2 },
                            { name: 'Logo size 3', value: data.logo_3 },
                            { name: 'Fav icon', value: data.fav_icon },
                            {
                                name: 'Wl Activation Date', value: data.wl_activation_date ? DateTime.fromISO(data.wl_activation_date)
                                    .toFormat('dd-MM-yyyy HH:mm:ss')
                                    .toString()
                                    : '',
                            },
                            {
                                name: 'Wl Expiry Date',
                                value: data.wl_expiry_date
                                    ? DateTime.fromISO(data.wl_expiry_date)
                                        .toFormat('dd-MM-yyyy HH:mm:ss')
                                        .toString()
                                    : '',
                            },
                            {
                                name: 'Wl Expired',
                                value: data.is_wl_expired ? 'Yes' : 'No',
                            },
                            {
                                name: 'Payment Due',
                                value: data.is_payment_due ? 'Yes' : 'No',
                            },
                            {
                                name: 'Modify By Name',
                                value: data.modify_by_name,
                            },
                            {
                                name: 'Modify Date Time',
                                value: data.modify_date_time
                                    ? DateTime.fromISO(data.modify_date_time)
                                        .toFormat('dd-MM-yyyy HH:mm:ss')
                                        .toString()
                                    : '',
                            },
                            {
                                name: 'Entry By Name',
                                value: data.entry_by_name,
                            },
                            {
                                name: 'Entry Date Time',
                                value: data.entry_date_time
                                    ? DateTime.fromISO(data.entry_date_time)
                                        .toFormat('dd-MM-yyyy HH:mm:ss')
                                        .toString()
                                    : '',
                            },
                        ];
                    }
                    this.formGroup.patchValue(data);
                    this.formGroup.get("agentfilter").patchValue(data.agency_name)
                    this.formGroup.get("agent_id").patchValue(data.agent_id)
                    this.logo_1 = data.logo_1;
                    this.logo_2 = data.logo_2;
                    this.logo_3 = data.logo_3;
                    this.fav_icon = data.fav_icon;
                    this.title = this.readonly
                        ? 'White Lable - ' + this.record.agency_name
                        : 'Modify White Lable';
                    this.btnLabel = this.readonly ? 'Close' : 'Save';
                },
                error: err => {
                    this.alertService.showToast('error', err, "top-right", true);
                }
            });
        }

        this.formGroup
            .get('agentfilter')
            .valueChanges.pipe(
                filter((search) => !!search),
                startWith(''),
                debounceTime(200),
                distinctUntilChanged(),
                switchMap((value: any) => {
                    // return this.agentService.getAgentCombo(value);
                    return this.wlService.getAgentCombo(value, true);
                })
            )
            .subscribe({ next: (data) => this.agentList = data });

        if (this.data?.send == 'Agent-WL') {
            this.formGroup.get('agentfilter').patchValue(this.data.data.agency_name);
            this.formGroup.get('agent_id').patchValue(this.data.data.id);
            this.title = 'Convert To White Lable';
        }
    }

    public onProfileInput(event: any, logoSize: string): void {
        const file = (event.target as HTMLInputElement).files[0];
        const extantion: string[] = CommonUtils.valuesArray(imgExtantions);
        var validator: DocValidationDTO = CommonUtils.isDocValid(file, extantion, null, 2);
        if (!validator.valid) {
            this.alertService.showToast('error', validator.alertMessage);
            (event.target as HTMLInputElement).value = '';
            return;
        }

        CommonUtils.getJsonFile(file, (reader, jFile) => {
            this[logoSize] = reader.result;
            this.formGroup.get(logoSize).patchValue(jFile);
        });
    }

    public onFileClick(logoSize: string): void {
        const inputElement = document.createElement('input');
        inputElement.type = 'file';
        inputElement.accept = 'image/*';
        inputElement.addEventListener('change', (event) =>
            this.onProfileInput(event, logoSize));
        inputElement.click();
    }

    public removePhoto(logoSize: string): void {
        this.formGroup.get(logoSize).patchValue(null);
        this[logoSize] = null;
    }

    copyLink(link: string): void {
        this.clipboard.copy(link);
        this.alertService.showToast('success', 'Copied');
    }

    submit(): void {
        if (!this.formGroup.valid) {
            this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
            this.formGroup.markAllAsTouched();
            return;
        }

        this.disableBtn = true;
        const json = this.formGroup.getRawValue();
        if (typeof json.logo_1 === 'string') {
            json.logo_1 = {
                fileName: '',
                fileType: '',
                base64: '',
            };
        }
        if (typeof json.logo_2 === 'string') {
            json.logo_2 = {
                fileName: '',
                fileType: '',
                base64: '',
            };
        }
        if (typeof json.logo_3 === 'string') {
            json.logo_3 = {
                fileName: '',
                fileType: '',
                base64: '',
            };
        }
        if (typeof json.fav_icon === 'string') {
            json.fav_icon = {
                fileName: '',
                fileType: '',
                base64: '',
            };
        }

        this.wlService.create(json).subscribe({
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
}
