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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ToasterService } from 'app/services/toaster.service';

@Component({
  selector: 'app-exclusion',
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
    MatAutocompleteModule,
  ],
  templateUrl: './exclusion.component.html',
  styleUrls: ['./exclusion.component.scss']
})
export class ExclusionComponent implements OnInit {

  @Input()
  data: holidayProductDTO;

  defaultExclusions: any[] = [];
  AlldefaultExclusions: any[] = [];

  @Output() dataEvent = new EventEmitter<any>();

  formGroup: FormGroup;

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
      exclusion: ['']
    });

    this.formGroup.get('exclusion').valueChanges.subscribe(text => {
      this.defaultExclusions = this.AlldefaultExclusions.filter(x => x.exclusion.toLowerCase().includes(text.toLowerCase()));
    })
  }

  add(): void {
    const json = this.formGroup.getRawValue();
    const reqJson = this.formGroup.getRawValue();
    reqJson.product_id = this.data.basic_detail.id;

    this.productService.createProductExclusions(reqJson).subscribe({
      next: (res) => {
        if (json.id) {
          const record = this.data.exclusions.find(x => x.id == res.id);
          Object.assign(record, json);
        } else {
          json.id = res.id;
          this.data.exclusions.push(json);
        }
        document.getElementById('focus').focus();
        this.formGroup.reset();
      }, error: err => this.alertService.showToast('error', err)
    })
  }

  edit(data): void {
    this.formGroup.patchValue(data);
  }

  delete(data): void {
    this.productService.deleteProductExclusions(data.id).subscribe({
      next: () => {
        const index = this.data.exclusions.indexOf(this.data.exclusions.find(x => x.id == data.id))
        this.data.exclusions.splice(index, 1);
        if (!this.data.exclusions.some(x => x.id === this.formGroup.get('id').value) && this.formGroup.get('id').value)
          this.formGroup.reset();
      }, error: err => this.alertService.showToast('error', err)
    })
  }

}
