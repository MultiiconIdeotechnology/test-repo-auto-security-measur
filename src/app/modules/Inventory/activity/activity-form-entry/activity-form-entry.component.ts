import { DateTime } from 'luxon';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, ViewChild, inject, NgModule } from '@angular/core';
import { AsyncPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import {
    ReplaySubject,
    debounceTime,
    distinctUntilChanged,
    filter,
    startWith,
    switchMap,
} from 'rxjs';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { imgExtantions, Routes } from 'app/common/const';
import { ActivityService } from 'app/services/activity.service';
import { CityService } from 'app/services/city.service';
import { KycDocumentService } from 'app/services/kyc-document.service';
import { ToasterService } from 'app/services/toaster.service';
import { ActivityTariffService } from 'app/services/activity-tariff.service';
import { CurrencyService } from 'app/services/currency.service';
import { VehicleService } from 'app/services/vehicle.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import {
    MatDatepickerModule,
    MatDatepickerToggle,
} from '@angular/material/datepicker';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ProductFixDepartureService } from 'app/services/product-fix-departure.service';
import { CommonUtils, DocValidationDTO } from 'app/utils/commonutils';
import { Linq } from 'app/utils/linq';

@Component({
    selector: 'app-activity-form-entry',
    templateUrl: './activity-form-entry.component.html',
    styles: [
        `
            .panel mat-icon.only-show-on-hover {
                visibility: hidden;
                float: right;
            }
            .panel:hover mat-icon.only-show-on-hover {
                visibility: visible;
            }
        `,
    ],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        DatePipe,
        AsyncPipe,
        NgxMatSelectSearchModule,
        NgxMatTimepickerModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
        MatDatepickerModule,
        MatSlideToggleModule,
        MatChipsModule,
        MatTooltipModule,
        MatMenuModule,
        MatTabsModule,
    ],
})
export class ActivityFormEntryComponent {
    activityListRoute = Routes.inventory.activity_route;
    disableBtn: boolean = false;
    readonly: boolean = false;
    record: any = {};
    fieldList: {};
    btnTitle: string = 'Create';
    isEditable: boolean = false;
    currencyListAll: any[] = [];
    currencyList: any[] = [];
    ActivityTariffList: any[] = [];
    ActivityTariffaddbtn = 'Add';
    ActivityTariffindex: number;
    ActivityInclusionsKeys: string[] = [];
    vehicleSelected = false;
    subActivityList: any[] = [];
    ImageformGroup: FormGroup;
    ImageList: any[] = [];
    ItineraryImageList: any[] = [];
    profile_picture: any;
    profile_pictureid: any;
    ActivityImage = 'Add';

    //mat chips
    chipControl = new FormControl();
    readonly separatorKeysCodes = [ENTER, COMMA] as const;

    shortList: any[] = [];
    preferred_times: any[] = [
        { value: 'AnyTime', viewValue: 'AnyTime' },
        { value: 'Early Morning', viewValue: 'Early Morning' },
        { value: 'Morning', viewValue: 'Morning' },
        { value: 'Afternoon', viewValue: 'Afternoon' },
        { value: 'Evening', viewValue: 'Evening' },
        { value: 'Night ', viewValue: 'Night ' },
    ];
    duration_times: any[] = [
        { value: 'Days', viewValue: 'Days' },
        { value: 'Hours', viewValue: 'Hours' },
        { value: 'Minutes', viewValue: 'Minutes' },
        { value: 'Seconds', viewValue: 'Seconds' },
    ];

    cityList: any[] = [];
    // cityList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
    vehicleList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
    SupplierList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
    SubActivityList: ReplaySubject<any[]> = new ReplaySubject<any[]>();

    @ViewChild(MatDatepickerToggle) toggle: MatDatepickerToggle<Date>;
    @ViewChild('formElementMain') formElementMain: ElementRef;
    @ViewChild('formElement1') formElement1: ElementRef;
    @ViewChild('formElement2') formElement2: ElementRef;
    is_sightseeing_combo: boolean = false;

    constructor(
        private builder: FormBuilder,
        private conformationService: FuseConfirmationService,
        private activityService: ActivityService,
        public cityService: CityService,
        public alertService: ToasterService,
        private kycDocumentService: KycDocumentService,
        public route: ActivatedRoute,
        public toasterService: ToasterService,
        private currencyService: CurrencyService,
        private vehicleService: VehicleService,
        private activityTariffService: ActivityTariffService,
        private confirmationService: FuseConfirmationService,
        public productFixDepartureService: ProductFixDepartureService
    ) { }

    first: boolean = true
    formGroup: FormGroup;
    activityTariffFormGroup: FormGroup;
    subActivityFormGroup: FormGroup;
    keywords = [];
    announcer = inject(LiveAnnouncer);
    defaultStartTime = '09:00';
    defaultEndTime = '18:00';
    newOne: number


    ngOnInit(): void {
        setTimeout(() => {
            if (this.readonly) {
                this.formGroup.get('is_ticket_required').disable();
                this.formGroup.get('is_meal_included').disable();
            }
        }, 0);

        this.formGroup = this.builder.group({
            id: [],
            activity_name: [''],
            city_id: [''],
            city_name: [''],
            is_ticket_required: [false],
            is_sightseeing_combo: [false],
            short_description: [''],
            inclusions: [''],
            special_notes: [''],
            operating_start_time: [''],
            operating_end_time: [''],
            duration: [''],
            preferred_time: ['AnyTime'],
            is_meal_included: [false],
            duration_no: [0],
            duration_time: ['Hours'],
            cityfilter: [''],
            inclusions_name: [''],
        });


        this.activityTariffFormGroup = this.builder.group({
            id: [''],
            activity_id: [''],
            supplier_id: [''],
            from_date: [''],
            to_date: [''],
            vehicle_id: [''],
            vehicle_filter: [''],
            vehicle: [''],
            transfer_type: ['SIC'],
            currency_id: [''],
            currency_filter: [''],
            currency: [''],
            adult_ticket_price: [0],
            child_ticket_price: [0],
            activity_price: [0],
            supplierfilter: [''],
        });

        this.formGroup.get('operating_start_time').patchValue(this.defaultStartTime);
        this.formGroup.get('operating_end_time').patchValue(this.defaultEndTime);

        this.subActivityFormGroup = this.builder.group({
            id: [''],
            combo_activity_id: [''],
            sub_activity_id: [''],
            subActivityfilter: [''],
        });

        this.ImageformGroup = this.builder.group({
            profile_picture: [''],
        });

        // this.formGroup.get('activity_name').valueChanges.subscribe(text => {
        //     this.formGroup.get('activity_name').patchValue(Linq.convertToTitleCase(text), { emitEvent: false });
        // })

        this.route.paramMap.subscribe((params) => {
            const id = params.get('id');
            const readonly = params.get('readonly');

            if (id) {
                this.readonly = readonly ? true : false;
                this.btnTitle = readonly ? 'Close' : 'Save';
                this.isEditable = !this.readonly;

                this.activityService.getActivityRecord(id).subscribe({
                    next: (data) => {
                        this.is_sightseeing_combo = data.is_sightseeing_combo;
                        data.operating_start_time = DateTime.fromISO(
                            data.operating_start_time
                        )
                            .toFormat('HH:mm')
                            .toString();
                        data.operating_end_time = DateTime.fromISO(
                            data.operating_end_time
                        )
                            .toFormat('HH:mm')
                            .toString();
                        this.record = data;

                        this.formGroup.patchValue(this.record);
                        const dua = this.record.duration.toString().split(' ');
                        this.formGroup.get('duration_no').patchValue(dua[0]);
                        this.formGroup.get('duration_time').patchValue(dua[1]);
                        this.formGroup.get('inclusions').patchValue('');
                        this.formGroup
                            .get('cityfilter')
                            .patchValue(data.city_name);
                        this.ActivityInclusionsKeys =
                            this.record.inclusions.split(',');

                        if (this.record.tariff.length >= 1) {
                            for (let dt of this.record.tariff) {
                                dt.supplier_id = {
                                    id: dt.supplier_id,
                                    company_name: dt.company_name,
                                };
                                dt.currency_id = {
                                    id: dt.currency_id,
                                    currency_short_code: dt.currency_short_code,
                                };
                                dt.vehicle_id = {
                                    id: dt.vehicle_id,
                                    vehicle_name: dt.vehicle_name,
                                };
                                this.ActivityTariffList.push(dt);
                            }
                        }


                        // if (this.record.subActivity.length >= 1) {
                        //     for (let dt of this.record.subActivity) {
                        //         dt.sub_activity_id = {
                        //             id: dt.sub_activity_id,
                        //             activity_name: dt.activity_name,
                        //         };
                        //         this.subActivityList.push(dt);
                        //     }
                        // }

                        if (this.record.images.length >= 1) {
                            var profile = this.record.images.find(
                                (x) => x.img_type == 'Cover Photo'
                            )?.url;
                            if (profile != null && profile != '') {
                                this.profile_picture = profile;
                                this.profile_pictureid =
                                    this.record.images.find(
                                        (x) => x.img_type == 'Cover Photo'
                                    )?.id;
                            }
                            var otherimage = this.record.images.filter(
                                (x) => x.img_type != 'Cover Photo'
                            );
                            if (otherimage.length >= 1) {
                                for (var dt of otherimage) {
                                    this.ImageList.push({
                                        id: dt.id,
                                        image: dt.url,
                                    });
                                }
                            }
                        }
                    },
                    error: (err) => {
                        this.alertService.showToast('error', err, 'top-right', true);
                        this.disableBtn = false;
                    },
                });
            }
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
                    this.cityList = data

                    if (!this.record.city_id) {
                        this.formGroup.get("city_id").patchValue(data[0].id)
                        this.first = false;
                    }

                }
            });

        this.currencyService.getcurrencyCombo().subscribe({
            next: (res) => {
                this.currencyListAll = res;
                this.currencyList = res;

                if (!this.record.currency_id) {
                    const defaultCurrency = this.currencyList.find(
                        (currency) => currency.currency_short_code === 'INR'
                    );
                    this.activityTariffFormGroup
                        .get('currency_id')
                        .patchValue(defaultCurrency);
                }
            },
        });

        this.activityTariffFormGroup
            .get('currency_filter')
            .valueChanges.subscribe((data) => {
                this.currencyList = this.currencyListAll.filter((x) =>
                    x.currency_short_code
                        .toLowerCase()
                        .includes(data.toLowerCase())
                );
            });

        this.activityTariffFormGroup
            .get('vehicle_filter')
            .valueChanges.pipe(
                filter((search) => !!search),
                startWith(''),
                debounceTime(200),
                distinctUntilChanged(),
                switchMap((value: any) => {
                    return this.vehicleService.getVehicleCombo(value);
                })
            )
            .subscribe((data) => this.vehicleList.next(data));

        this.activityTariffFormGroup
            .get('supplierfilter')
            .valueChanges.pipe(
                filter((search) => !!search),
                startWith(''),
                debounceTime(400),
                distinctUntilChanged(),
                switchMap((value: any) => {
                    return this.kycDocumentService.getSupplierCombo(value);
                })
            )
            .subscribe((data) => this.SupplierList.next(data));

        this.subActivityFormGroup
            .get('subActivityfilter')
            .valueChanges.pipe(
                filter((search) => !!search),
                startWith(''),
                debounceTime(400),
                distinctUntilChanged(),
                switchMap((value: any) => {
                    return this.activityService.getActivityCombo(value);
                })
            )
            .subscribe((data) => this.SubActivityList.next(data));

        if (this.record.currency_id) {
            this.activityTariffFormGroup
                .get('currency_filter')
                .patchValue(this.record.currency_id.currency_short_code);
        }


        this.formGroup.get('operating_start_time').valueChanges.subscribe(value => {
            this.onSearchChange();
        })

        this.formGroup.get('operating_end_time').valueChanges.subscribe(value => {
            this.onSearchChange();
        })

    }

    ngAfterViewInit(): void {
        this.formGroup.get('operating_start_time').patchValue(this.defaultStartTime);
        this.formGroup.get('operating_end_time').patchValue(this.defaultEndTime);
    }

    onSearchChange(): void {
        const startTime: any[] = this.formGroup.get('operating_start_time').value.split(':');
        const endTime: any[] = this.formGroup.get('operating_end_time').value.split(':');
        if (startTime.length > 0 && endTime.length > 0) {
            const time1 = DateTime.fromJSDate(new Date(1999, 1, 1, startTime[0], startTime[1]));
            const time2 = DateTime.fromJSDate(new Date(1999, 1, 1, endTime[0], endTime[1]));

            const diff = time2.diff(time1, ['hours']);
            this.formGroup.get('duration_no').patchValue(diff.hours);
        }
    }

    enableDisable(): void {
        if (this.is_sightseeing_combo) {
            this.confirmationService
                .open({
                    title: 'Disable Sightseeing Combo',
                    message: 'Are you sure to disable Sightseeing Combo ?',
                })
                .afterClosed()
                .subscribe((res) => {
                    if (res === 'confirmed') {
                        this.enableDisableSightSeeing();
                    }
                });
        } else this.enableDisableSightSeeing();
    }

    enableDisableSightSeeing(): void {
        this.activityService
            .enableDisableSighseeingCombo(this.formGroup.get('id').value)
            .subscribe({
                next: (res) => {
                    this.is_sightseeing_combo = res.is_sightseeing_combo;
                    this.record.is_sightseeing_combo = res.is_sightseeing_combo;
                    if (!this.is_sightseeing_combo) this.subActivityList = [];
                },
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
        json.duration = json.duration_no + ' ' + json.duration_time;
        json.inclusions = this.ActivityInclusionsKeys.join(',');

        this.activityService.create(json).subscribe({
            next: (res) => {
                this.toasterService.showToast('success', 'Activity Saved');
                this.formGroup.get('id').patchValue(res.id);

                const desiredFormControlName = 'city_id';
                const formControlElement =
                    this.formElement1?.nativeElement.querySelector(
                        `[formControlName="${desiredFormControlName}"]`
                    );
                if (formControlElement) {
                    formControlElement.focus();
                }

                this.btnTitle = 'Save';
                this.disableBtn = false;
            },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
                this.disableBtn = false;
            },
        });
    }

    onRangeInputClicked() {
        const fakeMouseEvent = new MouseEvent('click');
        this.toggle._open(fakeMouseEvent);
    }

    AddActivityTariff() {
        if (!this.activityTariffFormGroup.valid) {
            this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
            this.activityTariffFormGroup.markAllAsTouched();
            return;
        }

        const json = this.activityTariffFormGroup.getRawValue();
        json.activity_id = this.formGroup.get('id').value;

        json.supplier_id = json.supplier_id.id;
        json.currency_id = json.currency_id.id;
        json.vehicle_id = json.vehicle_id.id;

        json.from_date = DateTime.fromJSDate(new Date(json.from_date)).toFormat(
            'yyyy-MM-dd'
        );
        json.to_date = DateTime.fromJSDate(new Date(json.to_date)).toFormat(
            'yyyy-MM-dd'
        );

        this.activityTariffService.create(json).subscribe({
            next: (res) => {
                if (json.id) {
                    const index = this.ActivityTariffList.indexOf(
                        (x) => x.id == json.id
                    );
                    const editrecord = this.ActivityTariffList.find(
                        (x) => x.id == json.id
                    );
                    Object.assign(
                        editrecord,
                        this.activityTariffFormGroup.value
                    );
                    this.ActivityTariffList[index] = editrecord;
                } else {
                    this.activityTariffFormGroup.get('id').patchValue(res.id);
                    this.ActivityTariffList.push(
                        this.activityTariffFormGroup.value
                    );
                }
                this.toasterService.showToast(
                    'success',
                    this.ActivityTariffaddbtn == 'Save'
                        ? 'Activity Tariff Save'
                        : 'Activity Tariff Create'
                );
                this.ActivityTariffaddbtn = 'Add';
                this.activityTariffFormGroup.get('id').patchValue('');
                this.activityTariffFormGroup.get('supplier_id').patchValue('');

                const desiredFormControlName = 'supplier_id';
                const formControlElement =
                    this.formElement2?.nativeElement?.querySelector(
                        `[formControlName="${desiredFormControlName}"]`
                    );

                if (formControlElement) {
                    formControlElement.focus();
                }
            },
            error: (err) => {
                this.toasterService.showToast('error', err);
            },
        });
    }

    editActivityTariff(data: any) {
        this.activityTariffFormGroup.patchValue(data);
        this.activityTariffFormGroup.get('supplierfilter');
        this.ActivityTariffaddbtn = 'Save';
    }

    removeActivityTariff(data: any) {
        this.activityTariffService.delete(data.id).subscribe({
            next: (res) => {
                this.ActivityTariffList = this.ActivityTariffList.filter(
                    (x) => x != data
                );
                this.toasterService.showToast(
                    'success',
                    'Activity Tariff Delete Successfully!',
                    'top-right',
                    true
                );
            },
            error: (err) => {
                this.toasterService.showToast('error', err, 'top-right', true);
            },
        });
    }

    public compareWith(v1: any, v2: any) {
        return v1 && v2 && v1.id === v2.id;
    }

    AddActivityInclusions(): void {
        const value = this.formGroup.get('inclusions').value;
        if (value) this.ActivityInclusionsKeys.push(value);
        this.formGroup.get('inclusions').patchValue('');
    }

    removeActivityInclusions(ActivityInclusions): void {
        const index = this.ActivityInclusionsKeys.indexOf(ActivityInclusions);
        if (index >= 0) {
            this.ActivityInclusionsKeys.splice(index, 1);
        }
    }

    onVehicleSelected() {
        const selectedVehicle =
            this.activityTariffFormGroup.get('vehicle_id').value;
        if (selectedVehicle) {
            this.vehicleSelected = true;
        } else {
            this.vehicleSelected = false;
        }
    }

    SaveSubActivity(): void {
        if (!this.subActivityFormGroup.valid) {
            this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
            this.subActivityFormGroup.markAllAsTouched();
            return;
        }

        const json = this.subActivityFormGroup.getRawValue();

        json.combo_activity_id = this.formGroup.get('id').value;
        json.sub_activity_id = json.sub_activity_id.id;

        const addJson = this.subActivityFormGroup.getRawValue();

        this.activityService.createSubActivity(json).subscribe({
            next: (res) => {
                if (json.id) {
                    const excl = this.subActivityList.find(
                        (x) => x.id === json.id
                    );
                    Object.assign(excl, addJson);
                } else {
                    addJson.id = res.id;
                    this.subActivityList.push(addJson);
                }
                this.subActivityFormGroup.reset();
                this.toasterService.showToast('success', 'Sub Activity Saved');
            },
            error: (err) => {
                this.toasterService.showToast('error', err);
            },
        });
    }

    removeSubActivity(subActivitycombo): void {
        if (!subActivitycombo.id) {
            const index = this.subActivityList.indexOf(
                this.subActivityList.find(
                    (x) =>
                        x.subActivityList === subActivitycombo.subActivityList
                )
            );
            this.subActivityList.splice(index, 1);
            this.toasterService.showToast('success', 'Sub Activity Removed');
        } else
            this.activityService
                .deleteSubActivity(subActivitycombo.id)
                .subscribe({
                    next: () => {
                        const index = this.subActivityList.indexOf(
                            this.subActivityList.find(
                                (x) => x.id === subActivitycombo.id
                            )
                        );
                        this.subActivityList.splice(index, 1);
                        this.toasterService.showToast(
                            'success',
                            'Sub Activity Removed'
                        );
                    },
                    error: (err) => {
                        this.alertService.showToast('error', err, 'top-right', true);
                        this.disableBtn = false;
                    },
                });
    }

    TariffPublish(record): void {
        const label: string = record.is_published
            ? 'Unpublish Tariff'
            : 'Publish Tariff';
        this.confirmationService
            .open({
                title: label,
                message: 'Are you sure to ' + label.toLowerCase() + ' ' + ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.activityTariffService
                        .setTariffPublish(record.id)
                        .subscribe({
                            next: () => {
                                record.is_published = !record.is_published;
                                if (record.is_published) {
                                    this.alertService.showToast(
                                        'success',
                                        'Tariff has been Publish!',
                                        'top-right',
                                        true
                                    );
                                } else {
                                    this.alertService.showToast(
                                        'success',
                                        'Tariff has been UnPublish!',
                                        'top-right',
                                        true
                                    );
                                }
                            },
                            error: (err) => {
                                this.alertService.showToast('error', err, 'top-right', true);
                                this.disableBtn = false;
                            },
                        });
                }
            });
    }

    public onProfileInput(event: any): void {
        const file = (event.target as HTMLInputElement).files[0];

        const extantion: string[] = CommonUtils.valuesArray(imgExtantions);
        var validator: DocValidationDTO = CommonUtils.isDocValid(file, extantion, null, 2);
        if (!validator.valid) {
            this.alertService.showToast('error', validator.alertMessage);
            (event.target as HTMLInputElement).value = '';
            return;
        }

        CommonUtils.getJsonFile(file, (reader, jFile) => {
            const json: any = {
                id: '',
                img_for: 'Activity',
                img_for_id: this.formGroup.get('id').value,
                img_type: 'Gallery',
                img_name: jFile,
            };

            this.productFixDepartureService.Imagecreate(json).subscribe({
                next: (res) => {
                    this.ImageList.push({
                        image: reader.result,
                        img_name: jFile,
                        id: res.id,
                    });
                    this.toasterService.showToast('success', 'Image Saved');
                    this.ActivityImage = 'Save';
                },
                error: (err) => {
                    this.toasterService.showToast('error', err);
                },
            });
        });
    }

    onProfileInputforcoverphoto(event: any) {
        const file = (event.target as HTMLInputElement).files[0];

        const extantion: string[] = CommonUtils.valuesArray(imgExtantions);
        var validator: DocValidationDTO = CommonUtils.isDocValid(file, extantion, null, 2);
        if (!validator.valid) {
            this.alertService.showToast('error', validator.alertMessage);
            (event.target as HTMLInputElement).value = '';
            return;
        }

        CommonUtils.getJsonFile(file, (reader, jFile) => {
            const json: any = {
                id: '',
                img_for: 'Activity',
                img_for_id: this.formGroup.get('id').value,
                img_type: 'Cover Photo',
                img_name: jFile,
            };
            this.productFixDepartureService.Imagecreate(json).subscribe({
                next: (res) => {
                    this.profile_picture = reader.result;
                    this.toasterService.showToast(
                        'success',
                        'Cover Image Saved'
                    );
                    this.ActivityImage = 'Save';
                },
                error: (err) => {
                    this.toasterService.showToast('error', err);
                },
            });
        });
    }

    removeImage(data: any, from: string): void {
        const label: string =
            from == 'Cover Photo' ? 'Delete Cover Photo' : 'Delete Image';

        this.conformationService
            .open({
                title: label,
                message:
                    'Are you sure to ' +
                    label.toLowerCase() + '?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    if (data.id) {
                        this.productFixDepartureService
                            .Imagedelete(data.id)
                            .subscribe({
                                next: () => {
                                    if (from == 'Cover Photo') {
                                        this.profile_picture = null;
                                    } else {
                                        this.ImageList = this.ImageList.filter(
                                            (x: any) => x != data
                                        );
                                    }
                                    this.toasterService.showToast(
                                        'success',
                                        'Image Delete Successfully!'
                                    );
                                    this.ActivityImage = 'Save';
                                },
                                error: (err) => {
                                    this.toasterService.showToast('error', err);
                                },
                            });
                    } else {
                        if (from == 'Cover Photo') {
                            this.profile_picture = null;
                        } else {
                            this.ImageList = this.ImageList.filter(
                                (x: any) => x != data
                            );
                        }
                    }
                }
            });
    }
}
