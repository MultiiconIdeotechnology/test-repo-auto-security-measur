import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder } from '@angular/forms';
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
import { holidayProductDTO } from '../../product-entry.component';
import { HolidayProductService } from 'app/services/holiday-product.service';
import { ToasterService } from 'app/services/toaster.service';

@Component({
  selector: 'app-pricings',
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
  templateUrl: './pricings.component.html',
  styleUrls: ['./pricings.component.scss']
})
export class PricingsComponent implements OnInit {

  formGroup: FormGroup;
  @Input()
  data: holidayProductDTO;
  @Output() dataEvent = new EventEmitter<any>();

  constructor(
    private builder: FormBuilder,
    private productService: HolidayProductService,
    private alertService: ToasterService,
  ) {

  }

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      product_id: [''],
      from_date: [''],
      to_date: [''],
      from_pax: [0],
      to_pax: [0],
      single_sharing: [0],
      double_sharing: [0],
      triple_sharing: [0],
      child_with_bed: [0],
      child_with_no_bed: [0],
    })
  }

  add(): void {
    const json = this.formGroup.getRawValue();
    json.product_id = this.data.basic_detail.id;
    this.productService.createProductPricing(json).subscribe({
      next: (res) => {
        if (json.id) {
          const record = this.data.pricings.find(x => x.id == res.id);
          Object.assign(record, json);
        } else {
          json.id  = res.id;
          this.data.pricings.push(json);
        }
      }, error: err => this.alertService.showToast('error', err)
    });
    this.resetForm();
  }

  edit(data): void {
    this.formGroup.patchValue(data);
  }

  delete(data): void {
    this.productService.deleteProductPricing(data.id).subscribe({
      next: () => {
        const record = this.data.pricings.find(x => x.id == data.id)
        const index = this.data.pricings.indexOf(record);
        this.data.pricings.splice(index, 1);
        this.resetForm();
      },
      error: (err) => {this.alertService.showToast('error',err,'top-right',true);
    
  },

    })
  }

  resetForm(): void {
    this.formGroup.get('id').patchValue('');
    this.formGroup.get('from_date').patchValue('');
    this.formGroup.get('to_date').patchValue('');
    this.formGroup.get('from_pax').patchValue(0);
    this.formGroup.get('to_pax').patchValue(0);
    this.formGroup.get('single_sharing').patchValue(0);
    this.formGroup.get('double_sharing').patchValue(0);
    this.formGroup.get('triple_sharing').patchValue(0);
    this.formGroup.get('child_with_bed').patchValue(0);
    this.formGroup.get('child_with_no_bed').patchValue(0);
  }
}
