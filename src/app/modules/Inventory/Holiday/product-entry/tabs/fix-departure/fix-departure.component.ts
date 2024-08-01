import { CityService } from 'app/services/city.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ReplaySubject, debounceTime, distinctUntilChanged, filter, startWith, switchMap } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { holidayProductDTO } from '../../product-entry.component';
import { HolidayProductService } from 'app/services/holiday-product.service';
import { ToasterService } from 'app/services/toaster.service';

@Component({
  selector: 'app-fix-departure',
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
  templateUrl: './fix-departure.component.html',
  styleUrls: ['./fix-departure.component.scss']
})
export class FixDepartureComponent implements OnInit {

  formGroup: FormGroup;
  cityList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
  cityFilter = new FormControl();
  todayDateTime = new Date();
  @Input()
  data: holidayProductDTO;
  @Output() dataEvent = new EventEmitter<any>();

  constructor(
    private builder: FormBuilder,
    private alertService: ToasterService,
    private holidayProductService: HolidayProductService,
    private cityService: CityService
  ) {

  }
  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      product_id: [''],
      departure_city_id: [''],
      departure_date: [''],
    })


    this.cityFilter.valueChanges.pipe(
      filter(search => !!search),
      startWith(''),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((value: string) => {
        return this.cityService.getCityCombo(value)
      })
    ).subscribe(data => {
      this.cityList.next(data);
    })
  }

  public compareWith(v1: any, v2: any) {
    return v1 && v2 && v1.id === v2.id;
  }

  edit(data): void {
    this.formGroup.patchValue(data);
    this.cityFilter.patchValue(data.departure_city_id.display_name)
  }

  delete(data): void {
    this.holidayProductService.deleteProductFixDeparture(data.id).subscribe({
      next: () => {
        const index = this.data.fix_departures.indexOf(this.data.fix_departures.find(x => x.id == data.id));
        this.data.fix_departures.splice(index, 1);
        if (!this.data.fix_departures.some(x => x.id === this.formGroup.get('id').value) && this.formGroup.get('id').value)
          this.formGroup.reset();
      },
      error: (err) => {this.alertService.showToast('error',err,'top-right',true);
                
            },
    })
  }

  add(): void {
    const json = this.formGroup.getRawValue();
    const reqJson = this.formGroup.getRawValue();
    reqJson.product_id = this.data.basic_detail.id;
    reqJson.departure_city_id = reqJson.departure_city_id.id;
    this.holidayProductService.createProductFixDeparture(reqJson).subscribe({
      next: (res) => {
        if (json.id) {
          var data = this.data.fix_departures.find(x => x.id == json.id);
          if (data)
            Object.assign(data, json);
        } else {
          json.id = res.id;
          this.data.fix_departures.push(json)
        }
        this.formGroup.get('departure_date').patchValue('');
        document.getElementById('focus').focus();
      }, error: (err) => {
        this.alertService.showToast('error', err);
      }
    });

  }

  newEntry(): void {

  }

}
