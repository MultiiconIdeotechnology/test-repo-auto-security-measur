import { DateTime } from 'luxon';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BasicDetailsComponent } from './tabs/basic-details/basic-details.component';
import { ToasterService } from 'app/services/toaster.service';
import { FixDepartureComponent } from './tabs/fix-departure/fix-departure.component';
import { ProductCitiesComponent } from './tabs/product-cities/product-cities.component';
import { InclusionComponent, InclusionDTO } from './tabs/inclusion/inclusion.component';
import { ExclusionComponent } from './tabs/exclusion/exclusion.component';
import { SpecialNotesComponent } from './tabs/special-notes/special-notes.component';
import { PricingsComponent } from './tabs/pricings/pricings.component';
import { FlightsComponent } from './tabs/flights/flights.component';
import { ItineraryComponent } from './tabs/itinerary/itinerary.component';
import { ProductImagesComponent } from './tabs/product-images/product-images.component';
import { HolidayProductService } from 'app/services/holiday-product.service';
import { CommonUtils } from 'app/utils/commonutils';
import { inventoryType } from 'app/common/const';
import { HotelService } from 'app/services/hotel.service';
import { TransferService } from 'app/services/transfer.service';
import { ActivityService } from 'app/services/activity.service';
import { DestinationService } from 'app/services/destination.service';

@Component({
  selector: 'app-product-entry',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    BasicDetailsComponent,
    FixDepartureComponent,
    ProductCitiesComponent,
    InclusionComponent,
    ExclusionComponent,
    SpecialNotesComponent,
    PricingsComponent,
    FlightsComponent,
    ItineraryComponent,
    ProductImagesComponent,
  ],
  templateUrl: './product-entry.component.html',
  styleUrls: ['./product-entry.component.scss']
})
export class ProductEntryComponent implements OnInit {

  currentTab: any = {};

  @ViewChild('basic') basic: BasicDetailsComponent;
  @ViewChild('fix') fix: FixDepartureComponent;
  @ViewChild('cities') cities: ProductCitiesComponent;
  @ViewChild('inclusion') inclusion: InclusionComponent;
  @ViewChild('exclusion') exclusion: ExclusionComponent;
  @ViewChild('itinerary') itinerary: ItineraryComponent;
  @ViewChild('flights') flights: FlightsComponent;
  @ViewChild('images') images: ProductImagesComponent;
  @ViewChild('notes') notes: SpecialNotesComponent;
  @ViewChild('pricings') pricings: PricingsComponent;

  product_changed: boolean;

  holiday_product = new holidayProductDTO();

  TabList: any[] = [
    { id: 1, name: 'Basic Details' },
    { id: 2, name: 'Fix Departure' },
    { id: 3, name: 'Cities' },
    { id: 4, name: 'Inclusions' },
    { id: 5, name: 'Exclusions' },
    { id: 6, name: 'Itinerary' },
    { id: 7, name: 'Flights' },
    { id: 8, name: 'Images' },
    { id: 9, name: 'Special Notes' },
    { id: 10, name: 'Pricing' },
  ]

  constructor(
    public matDialogRef: MatDialogRef<ProductEntryComponent>,
    private alerService: ToasterService,
    private holidayService: HolidayProductService,
    private hotelService: HotelService,
    private transferService: TransferService,
    private activityService: ActivityService,
    private destinationService: DestinationService,
    @Inject(MAT_DIALOG_DATA) public data: any = {},
  ) {

  }

  ngOnInit(): void {
    this.currentTab = this.TabList[0];

    if (this.data.id) {
      this.holidayService.getHolidayAgentProductDetails(this.data.id).subscribe({
        next: (rec: holidayProductDTO) => {
          this.assignData(rec);
        },
        error: (err) => {
          this.alerService.showToast('error', err)
              
          },
      })
    }
  }

  assignData(data: holidayProductDTO): void {
    Object.assign(this.holiday_product, data);
    this.holiday_product.basic_detail.theme = data.basic_detail.theme.split(',');
    this.basic.formGroup.patchValue(this.holiday_product.basic_detail);
    this.basic.destination_search.patchValue(data.basic_detail.destination_name);
    this.basic.supplier_search.patchValue(data.basic_detail.supplier_name);
    this.cities.resetForm();
    this.loadDestinationCities();
    this.hotelService.getHotelComboCityWise(this.holiday_product.cities.map(x => x.city_id.id)).subscribe((hotels) => {
      this.transferService.getProductTransferActivityCombo(this.holiday_product.cities.map(x => x.city_id.id)).subscribe((transfer) => {
        this.activityService.getProductActivityCombo(this.holiday_product.cities.map(x => x.city_id.id)).subscribe((activity) => {
          this.holiday_product.cities.map(x => {
            const form = new InclusionDTO();
            form.no_of_nights = x.no_of_nights;
            form.hotels = hotels.filter(f => f.city_id === x.city_id.id);
            form.filtered_hotels = hotels.filter(f => f.city_id === x.city_id.id);

            form.transfers = transfer.filter(f => f.city_id === x.city_id.id);
            form.filtered_transfers = transfer.filter(f => f.city_id === x.city_id.id);

            form.activities = activity.filter(f => f.city_id === x.city_id.id);
            form.filtered_activities = activity.filter(f => f.city_id === x.city_id.id);

            x.inventoryTypes = CommonUtils.valuesArray(inventoryType).map(a => ({ type: a, inclusions: [], form: form }));
            x.inventoryTypes.forEach(y => {
              y.inclusions.push(...this.holiday_product.inclusions.filter(i => i.inventory_type == y.type && i.city_id == x.city_id.id));
            })
            return x;
          })
        })

      })

    });
    this.inclusion.cityChange(this.holiday_product.cities[0]);
    this.getDefaultExclusion(this.holiday_product.basic_detail.destination_id);
    this.itinerary.resetForm();
    this.holiday_product.flights.map(x => {
      x.departure_time = DateTime.fromJSDate(new Date(x.departure_date_time)).toFormat('HH:mm');
      x.arrival_time = DateTime.fromJSDate(new Date(x.arrival_date_time)).toFormat('HH:mm');
      return x;
    });

  }

  loadDestinationCities(): void {
    this.holidayService.getDestinationCityCombo(this.holiday_product.basic_detail.destination_id).subscribe({
      next: (data) => {
        this.cities.cityList = data;
        this.cities.cityFilteredList = data;
      }
    })
  }

  getDefaultExclusion(id): void {
    this.destinationService.getDefaultExclusions(id).subscribe(data => {
      this.exclusion.defaultExclusions = data;
      this.exclusion.AlldefaultExclusions = data;
    })
  }


  TabChange(tab): void {
    if (tab.id !== 1 && !this.holiday_product.basic_detail.id) {
      this.alerService.showToast('warn', 'Fill-up basic details before further process')
      return;
    }
    this.currentTab = tab;

  }

  getTabList(): any {
    if (!this.holiday_product.basic_detail.is_fix_departure)
      return this.TabList.filter(x => x.id !== 2);
    else
      return this.TabList;
  }

  dataEvent(data, tab_id): void {
    switch (tab_id) {
      case 1:
        if (data) {
          this.holiday_product.basic_detail = data;
          if (data.next)
            this.TabChange(this.TabList.find(x => x.id == (tab_id + (data.is_fix_departure ? 1 : 2))))
          this.loadDestinationCities();
          this.getDefaultExclusion(this.holiday_product.basic_detail.destination_id);
          this.cities.resetForm();
          this.product_changed = true;
        } else {
          this.matDialogRef.close(this.product_changed)
        }
        break;
      case 2:
        break;
      case 3:
        this.inclusion.cityChange(data[0]);
        break;
      case 4:
        break;
      case 5:
        break;
      case 6:
        break;
      case 7:
        break;
      case 8:
        break;
      case 9:
        break;
      case 10:
        break;
    }
  }
}

export class holidayProductDTO {
  basic_detail: any = {};
  fix_departures: any[] = [];
  cities: any[] = [];
  inclusions: any[] = [];
  exclusions: any[] = [];
  itinerary: any[] = [];
  flights: any[] = [];
  images: any[] = [];
  special_notes: any[] = [];
  pricings: any[] = [];
}
