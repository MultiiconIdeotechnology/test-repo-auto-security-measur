import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { AfterViewInit, Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToasterService } from 'app/services/toaster.service';
import { VisaService } from 'app/services/visa.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import {
    ReplaySubject,
    debounceTime,
    distinctUntilChanged,
    filter,
    startWith,
    switchMap,
} from 'rxjs';

@Component({
    selector: 'app-visa-entry',
    templateUrl: './visa-entry.component.html',
    styleUrls: ['./visa-entry.component.scss'],
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
        NgxMatTimepickerModule,
        NgxMatSelectSearchModule,
    ],
})
export class VisaEntryComponent implements AfterViewInit {
    disableBtn: boolean = false;
    readonly: boolean = false;
    record: any = {};
    shortList: any[] = [];
    // cityList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
    fieldList: {};
    cityList: any[] = [];
    isFirstCity: boolean = true;

    caption_types: any[] = [
        { value: 'Tourist', viewValue: 'Tourist' },
        { value: 'Business', viewValue: 'Business' },
        { value: 'Student', viewValue: 'Student' },
    ];
    first: boolean = false;

    constructor(
        public matDialogRef: MatDialogRef<VisaEntryComponent>,
        private builder: FormBuilder,
        private visaService: VisaService,
        public alertService: ToasterService,
        @Inject(MAT_DIALOG_DATA) public data: any = {}
    ) {
        this.record = data?.data ?? {};
    }

    formGroup: FormGroup;
    title = 'Create Visa';
    btnLabel = 'Create';
    keywords = [];

    ngOnInit(): void {
        this.formGroup = this.builder.group({
            id: [''],
            destination_city_id: [''],
            destination_caption: [''],
            visa_type: ['Tourist'],
            validity_period: [60],
            length_of_stay: [30],
            is_multi_entry: [false],
            no_of_entry: [2],
            processing_time: [0],
            cityfilter: [''],
        });

        this.formGroup
            .get('cityfilter')
            .valueChanges.pipe(
                filter((search) => !!search),
                startWith(''),
                debounceTime(400),
                distinctUntilChanged(),
                switchMap((value: any) => {
                    return this.visaService.getCityCombo(value);
                })
            )
            .subscribe({
                next: (data) => {
                    this.cityList = data;

                    if (this.isFirstCity && !this.record.id) {
                        this.formGroup
                            .get('destination_city_id')
                            .patchValue(data[0].id);
                            this.formGroup
                                .get('destination_caption')
                                .patchValue(data[0].country);
                        this.isFirstCity = false;
                    }
                },
            });

        this.formGroup.get('is_multi_entry').valueChanges.subscribe({
            next: (value: any) => {
                this.formGroup.get('no_of_entry').patchValue(2)
            },
        })

        if (this.record.id) {
            this.visaService.getVisaRecord(this.record.id).subscribe({
                next: (data) => {
                    this.first = true;

                    this.formGroup.get("cityfilter").patchValue(data.destination_city);
                    this.formGroup.get("destination_city_id").patchValue(data.destination_city_id);


                    this.readonly = this.data.readonly;
                    if (this.readonly) {
                        this.fieldList = [
                            {
                                name: 'Destination Caption',
                                value: data.destination_caption,
                            },
                            { name: 'Visa Type', value: data.visa_type },
                            {
                                name: 'Validity Period',
                                value: data.validity_period,
                                applied: true,
                            },
                            {
                                name: 'Length Of Stay',
                                value: data.length_of_stay,
                                applied: true,
                            },
                            {
                                name: 'Is Multi Entry',
                                value: data.is_multi_entry ? 'Yes' : 'No',
                            },
                            {
                                name: 'No Of Entry',
                                value: data.no_of_entry,
                            },
                            {
                                name: 'Processing Time',
                                value: data.processing_time,
                                applied: true,
                            },
                            {
                                name: 'Is Enable',
                                value: data.is_enable ? 'Yes' : 'No',
                            },
                        ];
                    }
                    this.formGroup.patchValue(data);
                    this.formGroup
                        .get('cityfilter')
                        .patchValue(this.record.destination_city);

                    this.title = this.readonly
                        ? 'Visa - ' + this.record.destination_caption
                        : 'Modify Visa';
                    this.btnLabel = this.readonly ? 'Close' : 'Save';
                }, error: err => this.alertService.showToast('error', err)
            });
        }
    }

    change(data: any) {
        const base_currency = this.cityList.find((x) =>
            x.id.includes(data)
        ).country;
        // if (!this.first)
        this.formGroup.get('destination_caption').patchValue(base_currency);
        this.first = false;
    }

    ngAfterViewInit(): void {
        this.formGroup
            .get('cityfilter')
            .patchValue(this.record.destination_city);
        this.formGroup
            .get('destination_city_id')
            .patchValue(this.record.destination_city_id);
    }

    submit(): void {
        if (!this.formGroup.valid) {
            this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
            this.formGroup.markAllAsTouched();
            return;
        }

        this.disableBtn = true;
        const json = this.formGroup.getRawValue();
        json['no_of_entry'] =
            this.formGroup.get('is_multi_entry').value == false
                ? '1'
                : this.formGroup.get('no_of_entry').value;
        this.visaService.create(json).subscribe({
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
