import { Routes } from 'app/common/const';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
    ReplaySubject,
    debounceTime,
    distinctUntilChanged,
    filter,
    startWith,
    switchMap,
} from 'rxjs';
import {
    AsyncPipe,
    DatePipe,
    JsonPipe,
    NgClass,
    NgFor,
    NgIf,
} from '@angular/common';
import {
    AfterContentChecked,
    ChangeDetectorRef,
    Component,
    inject,
} from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
} from '@angular/forms';
import { CityService } from 'app/services/city.service';
import { DestinationService } from 'app/services/destination.service';
import { ToasterService } from 'app/services/toaster.service';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
    selector: 'app-destination-form-entry',
    templateUrl: './destination-form-entry.component.html',
    styles: [
        `
            .panel mat-icon.only-show-on-hover {
                visibility: hidden;
                float: right;
            }
            .panel:hover mat-icon.only-show-on-hover {
                visibility: visible;
            }
            .panel2 .only-show-on-hover {
                visibility: hidden;
                float: right;
            }
            .panel2:hover .only-show-on-hover {
                visibility: visible;
            }
            .panel3 mat-icon.only-show-on-hover {
                visibility: hidden;
                float: right;
            }
            .panel3:hover mat-icon.only-show-on-hover {
                visibility: visible;
            }
        `,
    ],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        JsonPipe,
        DatePipe,
        AsyncPipe,
        NgClass,
        ReactiveFormsModule,
        RouterModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
        MatSlideToggleModule,
        MatChipsModule,
        MatTabsModule,
        MatTooltipModule,
        NgxMatSelectSearchModule
    ],
})
export class DestinationFormEntryComponent implements AfterContentChecked {
    destinationListRoute = Routes.masters.destination_route;

    formGroup: FormGroup;
    destinationCityFormGroup: FormGroup;
    productExclusionFormGroup: FormGroup;

    disableBtn: boolean = false;
    readonly: boolean = false;
    record: any = {};
    title: string = 'Create Destination';
    destinationCityList: any[] = [];
    btnLabel = 'Save';
    announcer = inject(LiveAnnouncer);
    DestintionExclusionKeys: string[] = [];
    productExclusions: any[] = [];
    btnTitle: string = 'Create';
    isEditable: boolean = false;
    cityList: ReplaySubject<any[]> = new ReplaySubject<any[]>();

    //mat chips
    chipControl = new FormControl();
    readonly separatorKeysCodes = [ENTER, COMMA] as const;

    constructor(
        private builder: FormBuilder,
        private destinationService: DestinationService,
        protected toasterService: ToasterService,
        public route: ActivatedRoute,
        public cityService: CityService,
        private changeDetector: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.formGroup = this.builder.group({
            id: [''],
            destination_name: [''],
            is_enable: [false],
        });

        this.destinationCityFormGroup = this.builder.group({
            id: [''],
            destination_id: [''],
            destination_city_id: [''],
            cityfilter: [''],
            destination_city_name: [''],
        });

        this.productExclusionFormGroup = this.builder.group({
            id: [''],
            destination_id: [''],
            exclusion: [''],
        });

        this.route.paramMap.subscribe((params) => {
            const id = params.get('id');
            const readonly = params.get('readonly');

            if (id) {
                this.readonly = readonly ? true : false;
                this.title = readonly
                    ? 'Destination Detail'
                    : 'Modify Destination Detail';
                this.btnTitle = readonly ? 'Close' : 'Save';
                this.isEditable = !this.readonly;

                this.destinationService.getdestinationRecord(id).subscribe({
                    next: (data) => {
                        this.record = data;
                        this.formGroup.patchValue(this.record);

                        if (this.record.cities.length >= 1) {
                            for (let dt of this.record.cities) {
                                dt.destination_city_id = {
                                    id: dt.destination_city_id,
                                    display_name: dt.display_name,
                                };
                                this.destinationCityList.push(dt);
                            }
                        }
                        this.productExclusions = data.exclusion;
                    },
                });
            }
        });

        this.destinationCityFormGroup
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
            .subscribe((data) => this.cityList.next(data));
    }

    AddDestintionExclusion(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();
        if (value) {
            this.DestintionExclusionKeys.push(value);
        }
        event.chipInput!.clear();
    }

    removeDestintionExclusion(DestintionExclusion): void {
        const index = this.DestintionExclusionKeys.indexOf(DestintionExclusion);
        if (index >= 0) {
            this.DestintionExclusionKeys.splice(index, 1);
        }
    }

    submit(): void {
        if(!this.formGroup.valid){
            this.toasterService.showToast('error', 'Please fill all required fields.', 'top-right', true);
            this.formGroup.markAllAsTouched();
            return;
        }

        this.disableBtn = true;
        const json = this.formGroup.getRawValue();
        json.exclusion = this.DestintionExclusionKeys.join(',');

        this.destinationService.create(json).subscribe({
            next: (res) => {
                this.toasterService.showToast('success', 'Destination Saved');
                this.formGroup.get('id').patchValue(res.id);
                this.btnTitle = 'Save';
                this.disableBtn = false;
            },
            error: () => {
                this.disableBtn = false;
            },
        });
    }

    public compareWith(v1: any, v2: any) {
        return v1 && v2 && v1.id === v2.id;
    }

    SaveDestinationCity(): void {
        const json = this.destinationCityFormGroup.getRawValue();
        json.destination_id = this.formGroup.get('id').value;
        json.destination_city_id = json.destination_city_id.id;

        const addJson = this.destinationCityFormGroup.getRawValue();

        this.destinationService.createDestinationCity(json).subscribe({
            next: (res) => {
                if (json.id) {
                    const index = this.destinationCityList.find(
                        (x) => x.id === json.id
                    );
                    Object.assign(index, addJson);
                } else {
                    addJson.id = res.id;
                    this.destinationCityList.push(addJson);
                }
                this.destinationCityFormGroup.reset();
                this.toasterService.showToast(
                    'success',
                    'Destination City Saved'
                );
            },
            error: (err) => {
                this.toasterService.showToast('error', err);
            },
        });
    }

    removeDestinationCity(destinationCitycombo): void {
        if (!destinationCitycombo.id) {
            const index = this.destinationCityList.indexOf(
                this.destinationCityList.find(
                    (x) =>
                        x.destinationCityList ===
                        destinationCitycombo.destinationCityList
                )
            );
            this.destinationCityList.splice(index, 1);
            this.toasterService.showToast(
                'success',
                'Destination City Removed'
            );
        } else
            this.destinationService
                .deleteDestinationCity(destinationCitycombo.id)
                .subscribe({
                    next: () => {
                        const index = this.destinationCityList.indexOf(
                            this.destinationCityList.find(
                                (x) => x.id === destinationCitycombo.id
                            )
                        );
                        this.destinationCityList.splice(index, 1);
                        this.toasterService.showToast(
                            'success',
                            'Destination City Removed'
                        );
                    },
                });
    }

    saveDefault(ex): void {
        if (ex.id) return;
        this.productExclusionFormGroup.patchValue(ex);
        this.SaveProductExclusions();
        const index = this.productExclusions.indexOf(
            this.productExclusions.find((x) => x.exclusion === ex.exclusion)
        );
        this.productExclusions.splice(index, 1);
    }

    SaveProductExclusions(): void {
        const json = this.productExclusionFormGroup.getRawValue();
        json.destination_id = this.formGroup.get('id').value;

        this.destinationService.createProductExclusion(json).subscribe({
            next: (res) => {
                if (json.id) {
                    const excl = this.productExclusions.find(
                        (x) => x.id === json.id
                    );
                    Object.assign(excl, json);
                } else {
                    json.id = res.id;
                    this.productExclusions.push(json);
                }
                this.productExclusionFormGroup.reset();
                this.toasterService.showToast(
                    'success',
                    'Product Exclusion Saved'
                );
            },
            error: (err) => {
                this.toasterService.showToast('error', err);
            },
        });
    }

    removeProductExclusion(exclusion): void {
        if (!exclusion.id) {
            const index = this.productExclusions.indexOf(
                this.productExclusions.find(
                    (x) => x.exclusion === exclusion.exclusion
                )
            );
            this.productExclusions.splice(index, 1);
            this.toasterService.showToast(
                'success',
                'Product Exclusion Removed'
            );
        } else
            this.destinationService
                .deleteProductExclusion(exclusion.id)
                .subscribe({
                    next: () => {
                        const index = this.productExclusions.indexOf(
                            this.productExclusions.find(
                                (x) => x.id === exclusion.id
                            )
                        );
                        this.productExclusions.splice(index, 1);
                        this.toasterService.showToast(
                            'success',
                            'Product Exclusion Removed'
                        );
                    },
                });
    }

    modifyDestintionExclusion(exclusion): void {
        this.productExclusionFormGroup.patchValue(exclusion);
    }

    ngAfterContentChecked(): void {
        this.changeDetector.detectChanges();
    }
}
