import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup } from '@angular/forms';
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
  selector: 'app-special-notes',
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
  templateUrl: './special-notes.component.html',
  styleUrls: ['./special-notes.component.scss']
})
export class SpecialNotesComponent {

  @Input()
  data: holidayProductDTO;

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
      special_note: ['']
    })
  }

  add(): void {
    const json = this.formGroup.getRawValue();
    const reqJson = this.formGroup.getRawValue();
    reqJson.product_id = this.data.basic_detail.id;

    this.productService.createProductSpecialNotes(reqJson).subscribe({
      next: (res) => {
        if (json.id) {
          const record = this.data.special_notes.find(x => x.id == res.id);
          Object.assign(record, json);
        } else {
          json.id = res.id;
          this.data.special_notes.push(json);
        }
        this.formGroup.reset();
      }, error: err => this.alertService.showToast('error', err)
    })
  }

  edit(data): void {
    this.formGroup.patchValue(data);
  }

  delete(data): void {
    this.productService.deleteProductSpecialNotes(data.id).subscribe({
      next: () => {
        const index = this.data.special_notes.indexOf(this.data.special_notes.find(x => x.id == data.id))
        this.data.special_notes.splice(index, 1);
      }, error: err => this.alertService.showToast('error', err)
    })
  }

}
