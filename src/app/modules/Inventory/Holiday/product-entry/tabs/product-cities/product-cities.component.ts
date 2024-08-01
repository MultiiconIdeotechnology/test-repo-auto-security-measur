import { Linq } from 'app/utils/linq';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { CommonUtils } from 'app/utils/commonutils';
import { InclusionDTO } from '../inclusion/inclusion.component';
import { holidayProductDTO } from '../../product-entry.component';
import { HolidayProductService } from 'app/services/holiday-product.service';
import { inventoryType } from 'app/common/const';
import { HotelService } from 'app/services/hotel.service';
import { TransferService } from 'app/services/transfer.service';
import { ActivityService } from 'app/services/activity.service';
import { ToasterService } from 'app/services/toaster.service';

@Component({
  selector: 'app-product-cities',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    NgxMatSelectSearchModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatMenuModule,
  ],
  templateUrl: './product-cities.component.html',
  styleUrls: ['./product-cities.component.scss']
})
export class ProductCitiesComponent implements OnInit {

  citiesforValidation: any[] = []
  formGroup: FormGroup;
  cityList: any[] = [];
  cityFilteredList: any[] = [];
  cityFilter = new FormControl();
  @Output() dataEvent = new EventEmitter<any>()

  @Input()
  data: holidayProductDTO;

  maxNights: number = 0;
  maxDays: number = 0;

  constructor(
    private builder: FormBuilder,
    private productService: HolidayProductService,
    private hotelService: HotelService,
    private transferService: TransferService,
    private activityService: ActivityService,
    private alertService: ToasterService,
  ) {

  }

  ngOnInit(): void {

    this.formGroup = this.builder.group({
      id: [''],
      product_id: [''],
      destination_id: [''],
      city_id: [''],
      no_of_nights: ['', [Validators.max(0), Validators.min(0)]],
      no_of_days: [''],
      order_by_no: [0],
    })

    this.cityFilter.valueChanges.subscribe((text) => {
      this.cityFilteredList = this.cityList.filter(x => x.display_name.toLowerCase().includes(text.toLowerCase()));
    });

    this.formGroup.get('no_of_nights').valueChanges.subscribe(val => {
      if (!this.formGroup.get('id').value)
        this.formGroup.get('no_of_days').patchValue(val + 1)
    })

  }

  validateDays(): void {
    setTimeout(() => {
      this.getCitiesforValidation(() => {
        const days = this.data.basic_detail.no_of_days - Linq.sum(this.citiesforValidation, (x: any) => x.no_of_days);
        if (this.formGroup.get('no_of_days').value > days)
          this.formGroup.get('no_of_days').patchValue(days);
        this.formGroup.get('no_of_days').setValidators([Validators.max(days), Validators.min(0)]);
        this.formGroup.get('no_of_days').updateValueAndValidity();
      });
    })
  }

  validateNights(): void {
    setTimeout(() => {
      this.getCitiesforValidation(() => {
        const nights = this.data.basic_detail.no_of_nights - Linq.sum(this.citiesforValidation, (x: any) => x.no_of_nights);
        if (this.formGroup.get('no_of_nights').value > nights)
          this.formGroup.get('no_of_nights').patchValue(nights);
        this.formGroup.get('no_of_nights').setValidators([Validators.max(nights), Validators.min(0)]);
        this.formGroup.get('no_of_nights').updateValueAndValidity();
      })
    })
  }

  getCitiesforValidation(callBack: () => void): void {
    let cities: any[] = JSON.parse(JSON.stringify(this.data.cities));
    setTimeout(() => {
      const json = JSON.parse(JSON.stringify(this.formGroup.getRawValue()));
      if (!json.id) {
        this.citiesforValidation = cities;
        callBack();
      }
      else {
        const recIndex = cities.indexOf(cities.find(x => x.id == json.id));
        cities.splice(recIndex, 1);
        this.citiesforValidation = cities;
        callBack();
      }
    })

  }

  public compareWith(v1: any, v2: any) {
    return v1 && v2 && v1.id === v2.id;
  }

  edit(data): void {
    this.formGroup.patchValue(data);
    this.cityFilter.patchValue(data.city_id.display_name, { emitEvent: false });
    this.validateNights();
    this.validateDays();
  }

  delete(data): void {
    this.productService.deleteProductCities(data.id).subscribe({
      next: () => {
        const index = this.data.cities.indexOf(this.data.cities.find(x => x.id == data.id));
        this.data.cities.splice(index, 1);
        // if (!this.data.cities.some(x => x.id === this.formGroup.get('id').value) && this.formGroup.get('id').value)
        this.resetForm();
      },
      error: (err) => {this.alertService.showToast('error',err,'top-right',true);
                
            },
    })
  }

  add(): void {
    setTimeout(() => {
      const json = this.formGroup.getRawValue();

      const reqJson = this.formGroup.getRawValue();
      reqJson.product_id = this.data.basic_detail.id;
      reqJson.destination_id = this.data.basic_detail.destination_id;
      reqJson.city_id = reqJson.city_id.id;

      this.productService.createProductCities(reqJson).subscribe({
        next: (res) => {
          if (json.id) {
            var record = this.data.cities.find(x => x.id == json.id);
            Object.assign(record, json);
            this.dataEvent.emit(this.data.cities);
            this.resetForm();
          } else {
            json.id = res.id;
            const form = new InclusionDTO();
            form.no_of_nights = json.no_of_nights;

            this.hotelService.getHotelComboCityWise([json.city_id.id]).subscribe((hotels) => {
              form.hotels = hotels.filter(f => f.city_id === json.city_id.id);
              form.filtered_hotels = hotels.filter(f => f.city_id === json.city_id.id);

              this.transferService.getProductTransferActivityCombo([json.city_id.id]).subscribe((transfer) => {
                form.transfers = transfer.filter(f => f.city_id === json.city_id.id);
                form.filtered_transfers = transfer.filter(f => f.city_id === json.city_id.id);

                this.activityService.getProductActivityCombo([json.city_id.id]).subscribe((activity) => {
                  form.activities = activity.filter(f => f.city_id === json.city_id.id);
                  form.filtered_activities = activity.filter(f => f.city_id === json.city_id.id);

                  json.inventoryTypes = CommonUtils.valuesArray(inventoryType).map(x => ({ type: x, inclusions: [], form: form }));
                  this.data.cities.push(json);

                  this.dataEvent.emit(this.data.cities);
                  this.resetForm();
                })
              })

            })
          }

        }, error: err => this.alertService.showToast('error', err)
      })
    })
  }

  resetForm(): void {
    this.formGroup.get('id').patchValue('');
    this.formGroup.get('order_by_no').patchValue(this.data.cities.length + 1);
    this.formGroup.get('no_of_nights').patchValue(this.data.basic_detail.no_of_nights - Linq.sum(this.data.cities, (x: any) => x.no_of_nights));
    this.formGroup.get('no_of_days').patchValue(this.data.basic_detail.no_of_days - Linq.sum(this.data.cities, (x: any) => x.no_of_days));
    this.formGroup.get('city_id').patchValue('');
    document.getElementById('focus').focus();
    this.validateNights();
    this.validateDays();
  }
}
