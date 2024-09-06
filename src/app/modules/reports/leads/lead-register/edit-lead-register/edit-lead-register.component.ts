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
import { Router } from '@angular/router';
import { CityService } from 'app/services/city.service';
import { CrmService } from 'app/services/crm.service';
import { ToasterService } from 'app/services/toaster.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { filter, startWith, debounceTime, distinctUntilChanged, switchMap, ReplaySubject } from 'rxjs';

@Component({
    selector: 'app-edit-lead-register',
    templateUrl: './edit-lead-register.component.html',
    styleUrls: ['./edit-lead-register.component.scss'],
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
export class EditLeadRegisterComponent {
    disableBtn: boolean = false;
    rmList: any[] = [];
    record: any;
    readonly: any;
    cityList: any[] = [];
    first: boolean = true;
    MobileCodeList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
    mobilecodelist: any[] = [];

    constructor(
        public matDialogRef: MatDialogRef<EditLeadRegisterComponent>,
        private builder: FormBuilder,
        private cityService: CityService,
        public router: Router,
        public crmService: CrmService,
        public alertService: ToasterService,

        @Inject(MAT_DIALOG_DATA) public data: any = {},
    ) {
        this.record = data?.data ?? "";
    }

    formGroup: FormGroup;
    title = 'Edit Lead Register';
    btnLabel = 'Submit';

    ngOnInit(): void {
        this.formGroup = this.builder.group({
            agency_name: [''],
            contact_person: [''],
            email: [''],
            city_id: ['', Validators.required],
            mobile_code: ['', Validators.required],
            mobilefilter: [''],
            cityfilter: [''],
            mobile_number: ['']
        });

        this.formGroup
            .get('cityfilter')
            .valueChanges.pipe(
                filter((search) => !!search),
                startWith(''),
                debounceTime(200),
                distinctUntilChanged(),
                switchMap((value: any) => {
                    return this.cityService.getCityCombo(value);
                })
            )
            .subscribe({
                next: (data) => {
                    this.cityList = data;
                    if (!this.record.city_id) {
                        this.formGroup.get("city_id").patchValue(data[0].id)
                        this.first = false;
                    }
                }
            });

        this.cityService.getMobileCodeCombo().subscribe((res: any) => {
            this.MobileCodeList.next(res);
        });

        if (this.record?.id) {
            this.formGroup.get('agency_name').patchValue(this.record?.agency_name);
            this.formGroup.get("contact_person").patchValue(this.record?.contact_person_name);
            this.formGroup.get("email").patchValue(this.record?.contact_person_email);
            this.formGroup.get('cityfilter').patchValue(this.record?.cityName);
            this.formGroup.get("city_id").patchValue(this.record?.city_id_enc);
            this.formGroup.get('mobile_number').patchValue(this.record?.contact_person_mobile);
            this.formGroup.get('mobile_code').patchValue(this.record?.contact_person_mobile_code);
        } 
        //else {
            // this.formGroup.get('mobile_code').patchValue('91');
        //}
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
            id: this.record?.id ? this.record?.id : "",
            agency_name: json.agency_name ? json.agency_name : "",
            contact_person_name: json.contact_person ? json.contact_person : "",
            contact_person_email: json.email ? json.email : "",
            city_id: json.city_id ? json.city_id : "",
            contact_person_mobile: json.mobile_number ? json.mobile_number : "",
            contact_person_mobile_code: json.mobile_code
        }

        this.crmService.createInboxLead(newJson).subscribe({
            next: (res) => {
                if(res?.status == "Lead Already Exist"){
                    this.disableBtn = false;
                    this.alertService.showToast('error', res.status, 'top-right', true);
                    this.matDialogRef.close(true);
                }else {
                    this.disableBtn = false;
                    this.alertService.showToast('success', 'Record modified', 'top-right', true);
                    this.matDialogRef.close(true);
                }
            },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
                this.disableBtn = false;
            },
        });
    }

    public compareWith(v1: any, v2: any) {
        return v1 && v2 && v1.id === v2.id;
    }
}
