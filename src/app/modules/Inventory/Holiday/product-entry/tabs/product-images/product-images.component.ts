import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonUtils, DocValidationDTO } from 'app/utils/commonutils';
import { holidayProductDTO } from '../../product-entry.component';
import { imageRecSize, imageType, imgExtantions } from 'app/common/const';
import { ToasterService } from 'app/services/toaster.service';
import { ProductFixDepartureService } from 'app/services/product-fix-departure.service';

@Component({
  selector: 'app-product-images',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './product-images.component.html',
  styleUrls: ['./product-images.component.scss']
})
export class ProductImagesComponent {
  profile_picture: string;
  @Output() dataEvent = new EventEmitter<any>()

  @Input()
  data: holidayProductDTO;

  imageType = imageType;
  imageRecSize = imageRecSize;

  constructor(
    private confirmationService: FuseConfirmationService,
    private alertService: ToasterService,
    private productFixDepartureService: ProductFixDepartureService
  ) {

  }

  public onProfileInput(event: any, imgType: string): void {
    let num = 0;

    const no_of_files: number = imgType === imageType.cover ? 1 : (event.target as HTMLInputElement).files.length;
    let imgJson: any[] = [];
    for (var i = 0; i < no_of_files; i++) {

      const file = (event.target as HTMLInputElement).files[i];
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
          img_for: 'Holiday Product',
          img_for_id: this.data.basic_detail.id,
          img_type: imgType,
          img_name: jFile,
        };

        imgJson.push(json);

        num++;
        if (num == no_of_files) {
          if (imgJson.length > 0)
            this.productFixDepartureService.createMultiple(imgJson).subscribe({
              next: (res) => {
                this.data.images.push(...res.imgs);
              },
              error: (err) => {
                this.alertService.showToast('error', err);
              },
            });
        }
      });
    }


  }

  public removeImage(data: any, from: string): void {
    const label: string =
      from == imageType.cover ? 'Delete Cover Photo' : 'Delete Image';

    this.confirmationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + '?',
    })
      .afterClosed().subscribe((res) => {
        if (res === 'confirmed') {
          if (data.id) {
            this.productFixDepartureService.Imagedelete(data.id).subscribe({
              next: () => {
                const index = this.data.images.indexOf(this.data.images.find(x => x.id == data.id));
                this.data.images.splice(index, 1);
              },
              error: (err) => {
                this.alertService.showToast('error', err);
              },
            });
          }
        }
      });
  }

  public CoverImageNotExist(): boolean {
    return !this.data.images.some(x => x.img_type === imageType.cover)
  }


}
