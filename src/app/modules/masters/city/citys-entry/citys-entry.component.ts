import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, ActivatedRoute, RouterOutlet } from '@angular/router';
import { Routes } from 'app/common/const';
import { CityService } from 'app/services/city.service';
import { DesignationService } from 'app/services/designation.service';
import { ToasterService } from 'app/services/toaster.service';
import { Linq } from 'app/utils/linq';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ReplaySubject, filter, startWith, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
    selector: 'app-citys-entry',
    templateUrl: './citys-entry.component.html',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        DatePipe,
        AsyncPipe,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
        MatSlideToggleModule,
        NgxMatSelectSearchModule,
        MatTooltipModule,
        MatAutocompleteModule,
      
        RouterOutlet,
        MatOptionModule,
        MatDividerModule
    ]
})
export class CitysEntryComponent {
    readonly: boolean = false;
    record: any = {};
    btnTitle: string = 'Create';
    fieldList: {};

    cityListRoute = Routes.masters.city_route;
    disableBtn: boolean = false;
    countryList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
    cityList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
    stateList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
    MobileCodeList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
    mobilecodelist: any[] = [];
    statelist: any[] = [];
    formGroup: FormGroup;
    title = "Create City"
    btnLabel = "Create"


    constructor(
        public matDialogRef: MatDialogRef<CitysEntryComponent>,
        public formBuilder: FormBuilder,
        public cityService: CityService,
        public router: Router,
        public route: ActivatedRoute,
        public designationService: DesignationService,
        public alertService: ToasterService,
        @Inject(MAT_DIALOG_DATA) public data: any = {}
    ) {
        this.record = data?.data ?? {}
    }


    ngOnInit(): void {
        this.formGroup = this.formBuilder.group({
            id: [''],
            country: [''],
            countryfilter: [''],
            state_name: ['',Validators.required],
            statefilter: [''],
            city_name: ['',[Validators.required, Validators.minLength(3)]],
            display_name: [''],
            country_code: [''],
            mobile_code: [''],
            gst_state_code: [''],
            latitude: [''],
            longitude: [''],
            mobileCodefilter: [''],
        });

        //   this.formGroup.get('city_name').valueChanges.subscribe(text => {
        //       this.formGroup.get('city_name').patchValue(Linq.convertToTitleCase(text), { emitEvent: false });
        //   })

        this.cityService.getMobileCodeCombo().subscribe((res: any) => {
            this.MobileCodeList.next(res);
            this.mobilecodelist = res;
        });

        // this.route.paramMap.subscribe((params) => {
        //     const id = params.get('id');
        //     const readonly = params.get('readonly');

        if (this.record.id) {
            // this.readonly = readonly ? true : false;
            // this.btnTitle = readonly ? 'Close' : 'Save';
            this.cityService.getCityRecord(this.record.id).subscribe({
                next: (data) => {
                    // this.record = data;
                    this.readonly = this.data.readonly;
                    this.formGroup.patchValue(data);
                    this.formGroup
                        .get('countryfilter')
                        .patchValue(data.country);
                    this.formGroup
                        .get('statefilter')
                        .patchValue(data.state_name);
                    if (this.readonly) {
                        this.fieldList = [
                            { name: 'Country', value: data.country, },
                            { name: 'State', value: data.state_name, },
                            { name: 'City', value: data.city_name, },
                            { name: 'Display Name', value: data.display_name, },
                            { name: 'Country Code', value: data.country_code, },
                            { name: 'Mobile Code', value: data.mobile_code, },
                            { name: 'GST State Code', value: data.gst_state_code, },
                            { name: 'Latitude', value: data.latitude, },
                            { name: 'Longitude', value: data.longitude, },
                        ];
                    }
                    this.title = this.readonly ? ("City - " + this.record.country) : 'Modify City';
                    this.btnLabel = this.readonly ? "Close" : 'Save';
                },
                error: (err) => {
                    this.alertService.showToast(
                        'error',
                        err,
                        'top-right',
                        true
                    );
                    this.disableBtn = false;
                },
            });
        }
        else {
            this.formGroup.get('mobile_code').setValue('91');
        }
        // });

        this.formGroup
            .get('country')
            .valueChanges.pipe(
                filter((search) => !!search),
                startWith(''),
                debounceTime(400),
                distinctUntilChanged(),
                switchMap((value: any) => {
                    return this.cityService.getCountryCombo(value);
                })
            )
            .subscribe((data) => this.countryList.next(data));

        this.formGroup
            .get('state_name')
            .valueChanges.pipe(
                filter((search) => !!search),
                startWith(''),
                debounceTime(400),
                distinctUntilChanged(),
                switchMap((value) => {
                    return this.cityService.getStateCombo(
                        this.formGroup.get('country').value,
                        value
                    );
                })
            )
            .subscribe((data) => this.stateList.next(data));

        this.formGroup.get('country').valueChanges.subscribe((value) => {
            if (value) {
                this.updateStateSelect(value);
            }
        });
    }

    updateStateSelect(value: string) {
        if (value) {
            this.cityService.getStateCombo(value, '').subscribe((data) => {
                this.stateList.next(data);
            });
        }
    }

    filterMobileCode(value: string) {
        const Filter = this.mobilecodelist.filter(
            (x) =>
                x.country_code.toLowerCase().includes(value.toLowerCase()) ||
                x.mobile_code.toLowerCase().includes(value.toLowerCase())
        );
        this.MobileCodeList.next(Filter);
    }

    submit(): void {
        if(!this.formGroup.valid){
            this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
            this.formGroup.markAllAsTouched();
            return;
        }

        if (this.readonly) {
            this.router.navigate([this.cityListRoute]);
            return;
        }
        const json = this.formGroup.getRawValue();
        json['display_name'] =
            this.formGroup.get('city_name').value +
            ', ' +
            this.formGroup.get('state_name').value +
            ', ' +
            this.formGroup.get('country').value;
        this.disableBtn = true;
        this.cityService.create(json).subscribe({
            next: () => {
                this.router.navigate([this.cityListRoute]);
                this.disableBtn = false;
                this.matDialogRef.close(true);
                if (json.id) {
                    this.alertService.showToast('success', 'Record modified', 'top-right', true);
                }
                else {
                    this.alertService.showToast('success', 'New record added', 'top-right', true);
                }
            },
            error: (err) => {
                this.alertService.showToast('error',err,'top-right',true);
                this.disableBtn = false;
            },
        });
    }

}
