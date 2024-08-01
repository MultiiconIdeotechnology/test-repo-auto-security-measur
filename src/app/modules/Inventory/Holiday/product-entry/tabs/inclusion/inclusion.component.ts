import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { holidayProductDTO } from '../../product-entry.component';
import { HolidayProductService } from 'app/services/holiday-product.service';
import { inventoryType, mealPlan } from 'app/common/const';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ToasterService } from 'app/services/toaster.service';

@Component({
  selector: 'app-inclusion',
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
    MatAutocompleteModule
  ],
  templateUrl: './inclusion.component.html',
  styleUrls: ['./inclusion.component.scss']
})
export class InclusionComponent implements OnInit {
  selectedCity: any = {};
  mealPlanes: string[] = [];
  @Input()
  data: holidayProductDTO;
  InventoryType = inventoryType;
  InclusionSuggesions: any[] = [];

  starts: any[] = []
  commonInc = false;

  selectedTab:
    | 'Hotel'
    | 'Activity'
    | 'Transfer'
    | 'Other'
    | '';

  inventoryTypes: any[] = [];

  @Output() dataEvent = new EventEmitter<any>();
  roomCategoryList: any[] = [];
  AllroomCategoryList: any[] = [];
  formGroup: FormGroup;

  constructor(
    private holidayService: HolidayProductService,
    private toasterService: ToasterService,
    private builder: FormBuilder
  ) {
    this.inventoryTypes = CommonUtils.valuesArray(inventoryType)
    this.mealPlanes = CommonUtils.valuesArray(mealPlan)
    for (var i = 1; i <= 7; i++)
      this.starts.push(i);
  }

  ngOnInit(): void {

    this.formGroup = this.builder.group({
      id: [''],
      product_id: [''],
      city_id: [''],
      inventory_type: [''],
      inclusion: [''],
      description: [''],
      star_rating: [2],
      meal_plan: [mealPlan.BreakfastOnly],
      room_category: [''],
      no_of_nights: [1, [Validators.min(1), Validators.max(1)]]
    })

    this.holidayService.getRoomCategoryCombo().subscribe(data => {
      this.AllroomCategoryList = data;
      this.roomCategoryList = data;
    });

    this.formGroup.get('inclusion').valueChanges.subscribe(text => {
      switch (this.selectedTab) {
        case inventoryType.Hotel:
          this.filterHotels(text);
          break;
        case inventoryType.Activity:
          this.filterActivity(text);
          break;
        case inventoryType.Transfer:
          this.filterTransfer(text);
          break;
      }
    });

    this.formGroup.get('room_category').valueChanges.subscribe(text => {
      this.filterCtegories(text);
    })
  }

  filterHotels(event): void {
    this.getInclusionTypeWise().form.filtered_hotels = this.getInclusionTypeWise().form.hotels?.filter(c => c.hotel_name.toLowerCase().includes(event.toLowerCase()))
    this.InclusionSuggesions = this.getInclusionTypeWise().form.filtered_hotels?.map(x => x.hotel_name);
  }

  filterActivity(event): void {
    this.getInclusionTypeWise().form.filtered_activities = this.getInclusionTypeWise().form.activities.filter(c => c.activity_name.toLowerCase().includes(event.toLowerCase()))
    this.InclusionSuggesions = this.getInclusionTypeWise().form.filtered_activities.map(x => x.activity_name);
  }

  filterTransfer(event): void {
    this.getInclusionTypeWise().form.filtered_transfers = this.getInclusionTypeWise().form.transfers.filter(c => c.transfer_to.toLowerCase().includes(event.toLowerCase()) || c.transfer_from.toLowerCase().includes(event.toLowerCase()))
    this.InclusionSuggesions = this.getInclusionTypeWise().form.filtered_transfers.map(x => (`${x.transfer_from} ${x.transfer_to}`));
  }

  filterCtegories(event): void {
    this.roomCategoryList = this.AllroomCategoryList.filter(c => c.toLowerCase().includes(event.toLowerCase()) || c.toLowerCase().includes(event.toLowerCase()))
  }

  cityChange(city): void {
    if (city) {
      this.commonInc = false;
      this.selectedCity = city;
      this.resetForm();
      this.TabChange(this.inventoryTypes[0])
    }
  }

  TabChange(tab): void {
    this.selectedTab = tab;
    this.resetForm();

    if (this.selectedTab === inventoryType.Hotel) {
      this.formGroup.get('no_of_nights').setValidators([Validators.max(this.selectedCity.no_of_nights)]);
      this.formGroup.get('no_of_nights').updateValueAndValidity();
    } else {
      this.formGroup.get('no_of_nights').setValidators([Validators.max(1), Validators.min(1)]);
      this.formGroup.get('no_of_nights').updateValueAndValidity();
    }
  }

  getInclusionTypeWise(): any {
    return this.selectedCity?.inventoryTypes?.find(x => x.type === this.selectedTab) || { form: {} }
  }

  getCommonInclusions(): any {
    return this.data.inclusions.filter(x => !x.city_id);
  }

  add(): void {

    const invalid = [];
    const controls = this.formGroup.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }

    if (this.formGroup.invalid)
      return;

    const data = this.formGroup.getRawValue();
    data.product_id = this.data.basic_detail.id;
    data.city_id = this.selectedCity.city_id?.id;
    data.inventory_type = this.selectedTab;
    const reqJson = data;
    this.holidayService.createProductInclusions(reqJson).subscribe({
      next: (res) => {
        if (data.id) {
          var mainrecord: InclusionDTO = this.data.inclusions.find(x => x.id == data.id && !x.is_field);
          Object.assign(mainrecord, data);
          if (this.selectedTab) {
            var record: InclusionDTO = this.getInclusionTypeWise().inclusions.find(x => x.id == data.id && !x.is_field);
            Object.assign(record, data);
          }
        } else {
          data.id = res.id;
          this.data.inclusions.push(data);
          if (this.selectedTab)
            this.getInclusionTypeWise().inclusions.push(data);
        }
        this.resetForm();
      }, error: (err) => {
        this.toasterService.showToast('error', err);
      }
    })

    // this.dataEvent.emit(this.inclusionList);
  }

  edit(data: InclusionDTO): void {
    this.resetForm();
    this.formGroup.patchValue(data);
  }

  delete(data: InclusionDTO): void {
    this.holidayService.deleteProductInclusions(data.id).subscribe({
      next: (res) => {
        if (this.selectedTab) {
          const index = this.getInclusionTypeWise().inclusions.indexOf(this.getInclusionTypeWise().inclusions.find(x => x.id == data.id));
          this.getInclusionTypeWise().inclusions.splice(index, 1);
        }
        const index1 = this.data.inclusions.indexOf(this.data.inclusions.find(x => x.id == data.id));
        this.data.inclusions.splice(index1, 1);
        this.resetForm();
      },
      error: (err) => {
        this.toasterService.showToast('error', err, 'top-right', true);
        
      },

    })
  }

  resetForm(): void {
    const form = new InclusionDTO();
    this.formGroup.patchValue(form);
  }

  convertToNum(value): number {
    return Number(value);
  }

}


export class InclusionDTO {
  id: string = '';
  product_id: string = '';
  city_id: string = '';
  inventory_type:
    | 'Hotel'
    | 'Activity'
    | 'Transfer'
    | 'Other';
  inclusion: string = '';
  hotels: any[] = [];
  filtered_hotels: any[] = [];
  activities: any[] = [];
  filtered_activities: any[] = [];
  transfers: any[] = [];
  filtered_transfers: any[] = [];
  description: string = '';
  star_rating: number = 2;
  meal_plan: string = mealPlan.BreakfastOnly;
  room_category: string = '';
  no_of_nights: number = 1;
}
