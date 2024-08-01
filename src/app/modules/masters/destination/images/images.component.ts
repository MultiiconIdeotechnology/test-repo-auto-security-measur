import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { imageType, imageRecSize, imgExtantions } from 'app/common/const';
import { holidayProductDTO } from 'app/modules/Inventory/Holiday/product-entry/product-entry.component';
import { ProductFixDepartureService } from 'app/services/product-fix-departure.service';
import { ToasterService } from 'app/services/toaster.service';
import { CommonUtils, DocValidationDTO } from 'app/utils/commonutils';

@Component({
  selector: 'app-images',
  templateUrl: './images.component.html',
  styleUrls: ['./images.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
})
export class ImagesComponent {

  record: any = {};
  ImageList: any[] = [];
  profile_pictureid: any;
  profile_picture: any;
  readonly: boolean = false;
  titleName:any

  constructor(
    public matDialogRef: MatDialogRef<ImagesComponent>,
    private confirmationService: FuseConfirmationService,
    private alertService: ToasterService,
    private conformationService: FuseConfirmationService,
    private productFixDepartureService: ProductFixDepartureService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data?.data?? {}
    this.titleName = data.name 
  }
  
  ngOnInit(): void {
    
    if (this.record.image?.length >= 1) {
      var profile = this.record.image.find((x) => x.img_type == 'Cover Photo')?.url;

      if (profile != null && profile != '') {
        this.profile_picture = profile;

        this.profile_pictureid = this.record.image.find((x) => x.img_type == 'Cover Photo')?.id;
      }
      var otherimage = this.record.image.filter((x) => x.img_type != 'Cover Photo');
      if (otherimage.length >= 1) {
        for (var dt of otherimage) {
          this.ImageList.push({
            id: dt.id,
            image: dt.url,
          });
        }
      }
    }
  }

  onProfileInputforcoverphoto(event: any) {
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
            img_for: this.titleName,
            img_for_id: this.record.id,
            img_type: 'Cover Photo',
            img_name: jFile,
        };
        this.productFixDepartureService.Imagecreate(json).subscribe({
            next: (res) => {
                this.profile_picture = reader.result;
                this.alertService.showToast(
                    'success',
                    'Cover Image Saved'
                );
            },
            error: (err) => {
                this.alertService.showToast('error', err);
            },
        });
    });
}

  public onProfileInput(event: any): void {

    const filew: File = event.target.files[0];
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
        img_for: this.titleName,
        img_for_id: this.record.id,
        img_type: 'Gallery',
        img_name: jFile,
      };
      this.productFixDepartureService.Imagecreate(json).subscribe({
        next: (res) => {
          this.ImageList.push({
            image: reader.result,
            img_name: jFile,
            id: res.id,
          });
          this.alertService.showToast('success', 'Image Saved');
        },
        error: (err) => {
          this.alertService.showToast('error', err);
        },
      });
    });
  }


  RemoveImage(data: any, from: string): void {
    const label: string =
      from == 'Cover Photo' ? 'Delete Cover Photo' : 'Delete Image';

    this.conformationService
      .open({
        title: label,
        message: 'Are you sure to ' + label.toLowerCase() + '?',
      })
      .afterClosed()
      .subscribe((res) => {
        if (res === 'confirmed') {
          if (data.id) {
            this.productFixDepartureService
              .Imagedelete(data.id)
              .subscribe({
                next: () => {
                  if (from == 'Cover Photo') {
                    this.profile_picture = null;
                  } else {
                    this.ImageList = this.ImageList.filter(
                      (x: any) => x != data
                    );
                  }
                  this.alertService.showToast(
                    'success',
                    'Image Delete Successfully!'
                  );
                },
                error: (err) => {
                  this.alertService.showToast('error', err);
                },
              });
          } else {
            if (from == 'Cover Photo') {
              this.profile_picture = null;
            } else {
              this.ImageList = this.ImageList.filter(
                (x: any) => x != data
              );
            }
          }
        }
      });
  }

  changecheck(i: any) {
    for (let img of this.ImageList) {
      img.checked = false;
      if (img == i) {
        img.checked = true;
      }
    }
  }

}
