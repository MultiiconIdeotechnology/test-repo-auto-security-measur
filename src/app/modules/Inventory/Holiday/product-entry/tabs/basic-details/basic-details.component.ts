import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { Observable, ReplaySubject, debounceTime, distinctUntilChanged, filter, startWith, switchMap } from 'rxjs';
import { HolidayProductService } from 'app/services/holiday-product.service';
import { CommonUtils } from 'app/utils/commonutils';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ToasterService } from 'app/services/toaster.service';
import { holidayProductDTO } from '../../product-entry.component';
import { themes } from 'app/common/const';
import { CurrencyService } from 'app/services/currency.service';
import { EmployeeService } from 'app/services/employee.service';

@Component({
  selector: 'app-basic-details',
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
  ],
  templateUrl: './basic-details.component.html',
  styleUrls: ['./basic-details.component.scss']
})
export class BasicDetailsComponent implements OnInit {

  formGroup: FormGroup;
  @Output() dataEvent = new EventEmitter<any>();
  destinationList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
  supplierList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
  currencyList: any[] = [];
  destination_search = new FormControl();
  supplier_search = new FormControl();
  themeList: any[] = [];
  @Input()
  data: holidayProductDTO;

  constructor(
    private builder: FormBuilder,
    private productService: HolidayProductService,
    private alertService: ToasterService,
    private currencyService: CurrencyService,
    private employeeService: EmployeeService
  ) {
    this.themeList = CommonUtils.valuesArray(themes)
  }

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      destination_id: [''],
      supplier_id: [''],
      product_name: [''],
      base_currency_id: [''],
      no_of_nights: [4],
      no_of_days: [5],
      is_fix_departure: [false],
      theme: [''],
    });

    this.currencyService.getcurrencyCombo().subscribe(data => {
      this.currencyList = data;
      if(!this.formGroup.get('base_currency_id').value)
      this.formGroup.get('base_currency_id').patchValue(this.currencyList.find(x => x.currency_short_code.includes("INR")).id)
    });

    this.destination_search.valueChanges.pipe(
      filter(search => !!search),
      startWith(''),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((value: string) => {
        return this.productService.getDestinationCombo(value)
      })
    ).subscribe(data => {
      this.destinationList.next(data);
    })

    this.supplier_search.valueChanges.pipe(
      filter(search => !!search),
      startWith(''),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((value: string) => {
        return this.employeeService.getSupplierCombo(value)
      })
    ).subscribe(data => {
      this.supplierList.next(data);
    })

    this.formGroup.get('no_of_nights').valueChanges.subscribe(val => this.formGroup.get('no_of_days').patchValue(val + 1))
  }

  Save(): void {
    if (this.formGroup.invalid)
      return;
    const json = this.formGroup.getRawValue();
    json.theme = json.theme ? json.theme?.join(',') : '';
    this.productService.create(json).subscribe({
      next: (data) => {
        if (!json.id)
          json.next = true;

        json.id = data.id;
        this.dataEvent.emit(json);
        this.formGroup.get('id').patchValue(data.id);
      }, error: err => this.alertService.showToast('error', err)
    })
  }

  cancel(): void {
    this.dataEvent.emit(false);
  }
}
