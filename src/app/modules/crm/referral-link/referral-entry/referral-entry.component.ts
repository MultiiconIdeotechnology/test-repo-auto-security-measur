import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfigService, FuseConfig } from '@fuse/services/config';
import { EntityService } from 'app/services/entity.service';
import { RefferralService } from 'app/services/referral.service';
import { ToasterService } from 'app/services/toaster.service';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { filter, startWith, debounceTime, distinctUntilChanged, switchMap, Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-referral-entry',
    templateUrl: './referral-entry.component.html',
    styleUrls: ['./referral-entry.component.scss'],
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
export class ReferralEntryComponent {
    config: FuseConfig;
    disableBtn: boolean = false;
    rmList: any[] = [];
    record: any;
    readonly: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    @ViewChild('settingsDrawer') public settingsDrawer: MatSidenav;


    linkList: any[] = [
        { value: 'B2B Partner', viewValue: 'B2B Partner' },
        { value: 'WL', viewValue: 'WL' },
        { value: 'Corporate', viewValue: 'Corporate' },
        { value: 'Supplier', viewValue: 'Supplier' },
        { value: 'API', viewValue: 'API' },
    ];

    constructor(
        public matDialogRef: MatDialogRef<ReferralEntryComponent>,
        private builder: FormBuilder,
        private refferralService: RefferralService,
        public alertService: ToasterService,
        private entityService : EntityService,
        private _fuseConfigService: FuseConfigService,
        @Inject(MAT_DIALOG_DATA) public data: any = {},
        @Inject(MAT_DIALOG_DATA) public readonlys: any = {}

    ) {
        this.record = data;
        this.readonly = readonlys;
        this.entityService.onreferralEntityCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (item) => {
                this.settingsDrawer.toggle()
            }
        })
    }

    formGroup: FormGroup;
    title = 'Referral Link';
    btnLabel = 'Submit';

    ngOnInit(): void {
        this.formGroup = this.builder.group({
            // id: [''],
            referral_link_for: [''],
            referral_code: [''],
            relationship_manager_id: [''],
            rmfilter: [''],
            campaign_name: [''],
            remark: [''],
            start_date: new Date(),
        });

        if (!this.record?.data) {
            this.formGroup.get('referral_link_for').patchValue('B2B Partner');
        }

        this.formGroup.get('rmfilter').valueChanges.pipe(
            filter(search => !!search),
            startWith(''),
            debounceTime(400),
            distinctUntilChanged(),
            switchMap((value: any) => {
                return this.refferralService.getEmployeeLeadAssignCombo(value);
            })
        ).subscribe({
            next: data => {
                this.rmList = [];
                this.rmList.push({
                    id: '',
                    employee_name: 'Any',
                });
                this.rmList.push(...data);

                if (!this.record?.data) {
                    this.formGroup.get('relationship_manager_id').patchValue(this.rmList[0]?.id);
                }
            }
        });

        if (this.record?.data?.id) {
            this.formGroup.get('referral_link_for').patchValue(this.record?.data?.referral_link_for);
            this.formGroup.get('relationship_manager_id').patchValue(this.record?.data?.relationship_manager_id);
            // this.formGroup.get('rmfilter').patchValue(this.record?.data?.relationship_manager_name);
            this.formGroup.get('referral_code').patchValue(this.record?.data?.referral_code);
        }

        this._fuseConfigService.config$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((config: FuseConfig) =>
        {
            this.config = config;
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
            referral_link_for: json.referral_link_for ? json.referral_link_for : "",
            referral_code: json.referral_code ? json.referral_code : "",
            relationship_manager_id: json.relationship_manager_id,
            campaign_name: json.campaign_name,
            remark: json.remark,
            start_date: DateTime.fromJSDate(new Date(this.formGroup.get('start_date').value)).toFormat('yyyy-MM-dd')

        }
        this.refferralService.create(newJson).subscribe({
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
