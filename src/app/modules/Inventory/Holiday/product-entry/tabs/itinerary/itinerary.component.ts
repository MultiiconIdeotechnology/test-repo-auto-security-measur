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
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { CommonUtils, DocValidationDTO } from 'app/utils/commonutils';
import { MatDividerModule } from '@angular/material/divider';
import { holidayProductDTO } from '../../product-entry.component';
import { HolidayProductService } from 'app/services/holiday-product.service';
import { imageType, imgExtantions } from 'app/common/const';
import { ToasterService } from 'app/services/toaster.service';
import { ProductFixDepartureService } from 'app/services/product-fix-departure.service';

@Component({
  selector: 'app-itinerary',
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
    MatDividerModule,
  ],
  templateUrl: './itinerary.component.html',
  styleUrls: ['./itinerary.component.scss']
})
export class ItineraryComponent {

  formGroup: FormGroup;
  @Input()
  data: holidayProductDTO;
  @Output() dataEvent = new EventEmitter<any>();

  constructor(
    private builder: FormBuilder,
    private confirmationService: FuseConfirmationService,
    private productService: HolidayProductService,
    private alertService: ToasterService,
    private productFixDepartureService: ProductFixDepartureService,
  ) {

  }

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      product_id: [''],
      day_no: [1],
      day_itinerary_highlight: [''],
      day_itinerary: [''],
    })
  }

  public onProfileInput(event: any, itinerary: any): void {
    const file = (event.target as HTMLInputElement).files[0];

    const extantion: string[] = CommonUtils.valuesArray(imgExtantions);
    var validator: DocValidationDTO = CommonUtils.isDocValid(file, extantion, null, 2);
    if (!validator.valid) {
      this.alertService.showToast('error', validator.alertMessage);
      (event.target as HTMLInputElement).value = '';
      return;
    }

    CommonUtils.getJsonFile(file, (reader, jFile) => {
      const json: any = {
        id: '',
        img_for: 'Itinerary',
        img_for_id: itinerary.id,
        img_type: imageType.gallery,
        img_name: jFile,
      };

      this.productFixDepartureService.Imagecreate(json).subscribe({
        next: (res) => {
          json.id = res.id;
          json.image = reader.result
          itinerary.images.push(json);
        },
        error: (err) => {
          this.alertService.showToast('error', err);
        },
      });
    });
  }

  public removeImage(data: any, img: any): void {
    this.confirmationService.open({
      title: 'Delete Itinerary Image',
      message: `Are you sure to delete image from Day ${data.day_no} ?`,
    })
      .afterClosed().subscribe((res) => {
        if (res === 'confirmed') {
          if (data.id) {
            this.productFixDepartureService.Imagedelete(img.id).subscribe({
              next: () => {
                const index = data.images.indexOf(data.images.find(x => x.id == img.id));
                data.images.splice(index, 1);
              },
              error: (err) => {
                this.alertService.showToast('error', err);
              },
            });
          }
        }
      });
  }



  add(): void {
    const json = this.formGroup.getRawValue();
    if (this.data.itinerary.length >= this.data.basic_detail.no_of_days && !json.id)
    return this.alertService.showToast('error', 'Can not add more than ' + this.data.basic_detail.no_of_days + ' days itineraries')
    const reqJson = this.formGroup.getRawValue();
    reqJson.product_id = this.data.basic_detail.id;

    this.productService.createProductItinerary(reqJson).subscribe({
      next: (res) => {
        if (json.id) {
          const record = this.data.itinerary.find(x => x.id == res.id);
          Object.assign(record, json);
        } else {
          json.id = res.id;
          this.data.itinerary.push(json);
        }
        this.resetForm();
      }, error: err => this.alertService.showToast('error', err)
    })
  }

  edit(data): void {
    this.formGroup.patchValue(data);
  }

  delete(data): void {
    this.productService.deleteProductItinerary(data.id).subscribe({
      next: () => {
        const index = this.data.itinerary.indexOf(this.data.itinerary.find(x => x.id == data.id))
        this.data.itinerary.splice(index, 1);
        this.resetForm()
      }, error: err => this.alertService.showToast('error', err)
    })
  }

  resetForm(): void {
    this.formGroup.get('id').patchValue('');
    this.formGroup.get('day_itinerary_highlight').patchValue('');
    this.formGroup.get('day_itinerary').patchValue('');
    this.formGroup.get('day_no').patchValue(this.data.itinerary.length + 1);
  }

}
