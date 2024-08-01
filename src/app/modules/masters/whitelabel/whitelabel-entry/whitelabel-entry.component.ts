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
            is_b2b_wl: [false],
            b2b_wl_link: ['', Validators.required],
            api_url: [''],
            is_b2c_wl: [false],
            b2c_wl_link: ['', Validators.required],
            is_android_wl: [false],
            android_wl_link: ['', Validators.required],
            is_ios_wl: [false],
            ios_wl_link: ['', Validators.required],
            wl_activation_date: [''],
            wl_expiry_date: [''],
            fav_icon: [''],
            logo_1: [''],
            logo_2: [''],
            logo_3: [''],
            profile_picture: [''],
            agentfilter: [''],
        });

        // this.formGroup.get('b2b_wl_link').valueChanges.subscribe((value) => {
        //     this.formGroup.patchValue({ is_b2b_wl: value ? true : false });
        // });
        // this.formGroup.get('b2c_wl_link').valueChanges.subscribe((value) => {
        //     this.formGroup.patchValue({ is_b2c_wl: value ? true : false });
        // });
        // this.formGroup.get('android_wl_link').valueChanges.subscribe((value) => {
        //     this.formGroup.patchValue({ is_android_wl: value ? true : false });
        // });
        // this.formGroup.get('ios_wl_link').valueChanges.subscribe((value) => {
        //     this.formGroup.patchValue({ is_ios_wl: value ? true : false });
        // });

        // Add custom validator
        this.formGroup.get('is_b2b_wl').valueChanges.subscribe(value => {
            if (value) {
                this.formGroup.get('b2b_wl_link').setValidators(Validators.required);
            } else {
                this.formGroup.get('b2b_wl_link').clearValidators();
            }
            this.formGroup.get('b2b_wl_link').updateValueAndValidity();
        });

        this.formGroup.get('is_b2c_wl').valueChanges.subscribe(value => {
            if (value) {
                this.formGroup.get('b2c_wl_link').setValidators(Validators.required);
            } else {
                this.formGroup.get('b2c_wl_link').clearValidators();
            }
            this.formGroup.get('b2c_wl_link').updateValueAndValidity();
        });

        this.formGroup.get('is_android_wl').valueChanges.subscribe(value => {
            if (value) {
                this.formGroup.get('android_wl_link').setValidators(Validators.required);
            } else {
                this.formGroup.get('android_wl_link').clearValidators();
            }
            this.formGroup.get('android_wl_link').updateValueAndValidity();
        });

        this.formGroup.get('is_ios_wl').valueChanges.subscribe(value => {
            if (value) {
                this.formGroup.get('ios_wl_link').setValidators(Validators.required);
            } else {
                this.formGroup.get('ios_wl_link').clearValidators();
            }
            this.formGroup.get('ios_wl_link').updateValueAndValidity();
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
                    // this.formGroup.patchValue('agentfilter').value
                    this.formGroup.get("agentfilter").patchValue(data.agency_name)
                    this.formGroup.get("agent_id").patchValue(data.agent_id)
                    // data.wl_activation_date = DateTime.fromISO(data.wl_activation_date).toFormat('dd-mm-yyyy').toString()
                    // data.wl_expiry_date = DateTime.fromISO(data.wl_expiry_date).toFormat('dd-mm-yyyy').toString()
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

        if (json.wl_activation_date instanceof DateTime) {
            json.wl_activation_date = json.wl_activation_date.toJSDate();
        } else {
            json.wl_activation_date = new Date(json.wl_activation_date);
        }

        if (json.wl_expiry_date instanceof DateTime) {
            json.wl_expiry_date = json.wl_expiry_date.toJSDate();
        } else {
            json.wl_expiry_date = new Date(json.wl_expiry_date);
        }

        // json.wl_activation_date = json.wl_activation_date.toISOString();
        // json.wl_expiry_date = json.wl_expiry_date.toISOString();

        json.wl_activation_date = DateTime.fromJSDate(json.wl_activation_date).toFormat('yyyy-MM-dd')
        json.wl_expiry_date = DateTime.fromJSDate(json.wl_expiry_date).toFormat('yyyy-MM-dd')

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
