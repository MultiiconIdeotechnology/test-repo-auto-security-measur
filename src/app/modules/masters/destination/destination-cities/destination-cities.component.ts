import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { filter, startWith, debounceTime, distinctUntilChanged, switchMap, ReplaySubject } from 'rxjs';
import { CityService } from 'app/services/city.service';
import { DestinationService } from 'app/services/destination.service';
import { ToasterService } from 'app/services/toaster.service';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { module_name } from 'app/security';

@Component({
    selector: 'app-destination-cities',
    templateUrl: './destination-cities.component.html',
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
        .width-content{
            width: max-content;
        }
    `,
    ],
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
        MatSnackBarModule,
        MatSlideToggleModule,
        MatChipsModule,
        NgxMatSelectSearchModule,
    ]
})
export class DestinationCitiesComponent {

    record: any = {};
    formGroup: FormGroup;
    destinationCityFormGroup: FormGroup;
    destinationCityList: any[] = [];
    cityList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
    isLoading: boolean;



    constructor(
        public matDialogRef: MatDialogRef<DestinationCitiesComponent>,
        private builder: FormBuilder,
        private destinationService: DestinationService,
        protected toasterService: ToasterService,
        protected alertService: ToasterService,
        public cityService: CityService,
        @Inject(MAT_DIALOG_DATA) public data: any = {}
    ) {

        this.record = data || {}
        if (this.record.data != null && this.record.data.cities != null)
            this.destinationCityList = this.record.data.cities;
    }

    title = "Destination Cities"

    ngOnInit() {
        this.destinationCityFormGroup = this.builder.group({
            id: [''],
            destination_id: [''],
            destination_city_id: [''],
            cityfilter: [''],
            destination_city_name: [''],
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

    SaveDestinationCity(): void {
        if (!this.destinationCityFormGroup.valid) {
            this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
            this.destinationCityFormGroup.markAllAsTouched();
            return;
        }

        const json = this.destinationCityFormGroup.getRawValue();

        json.destination_id = this.record.id;
        json.destination_city_id = json.destination_city_id.id;
        json.display_name = this.destinationCityFormGroup.get('destination_city_id').value.display_name
        this.destinationService.createDestinationCity(json).subscribe({
            next: (res) => {
                if (json.id) {
                    const index = this.destinationCityList.find(
                        (x) => x.id === json.id
                    );
                    Object.assign(index, json);
                } else {
                    json.id = res.id;
                    this.destinationCityList.push(json);
                }
                this.destinationCityFormGroup.reset();
                this.toasterService.showToast(
                    'success',
                    'Destination City Saved!'
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
                'Destination City Removed!'
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
                            'Destination City Removed!'
                        );
                    },
                    error: (err) => {
                        this.alertService.showToast('error', err, 'top-right', true);

                    },
                });
    }



}
