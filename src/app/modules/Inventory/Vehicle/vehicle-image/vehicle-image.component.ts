import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ProductFixDepartureService } from 'app/services/product-fix-departure.service';
import { ToasterService } from 'app/services/toaster.service';
import { CommonUtils } from 'app/utils/commonutils';

@Component({
    selector: 'app-vehicle-image',
    templateUrl: './vehicle-image.component.html',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        CommonModule,
        MatTooltipModule,
        MatDividerModule,
    ],
})
export class VehicleImageComponent {
    record: any = {};
    title = 'Add Image';
    readonly: boolean = false;
    ImageformGroup: FormGroup;
    ImageList: any[] = [];
    ItineraryImageList: any[] = [];
    profile_picture: any;
    profile_pictureid: any;
    ActivityImage = 'Add';

    constructor(
        private builder: FormBuilder,
        public matDialogRef: MatDialogRef<VehicleImageComponent>,
        private conformationService: FuseConfirmationService,
        public alertService: ToasterService,
        public productFixDepartureService: ProductFixDepartureService,
        public toasterService: ToasterService,
        public route: ActivatedRoute,
        @Inject(MAT_DIALOG_DATA) public data: any = {}
    ) {
        this.record = data;
    }

    ngOnInit(): void {
        this.ImageformGroup = this.builder.group({
            profile_picture: [''],
        });

        // this.ImageList = this.record.model.images;

        this.ImageList = [];
        if (this.record.model.images.length >= 1) {
            var profile = this.record.model.images.find(
                (x) => x.img_type == 'Cover Photo'
            )?.url;
            if (profile != null && profile != '') {
                this.profile_picture = profile;
                this.profile_pictureid = this.record.model.images.find(
                    (x) => x.img_type == 'Cover Photo'
                )?.id;
            }
            var otherImages = this.record.model.images.filter(
                (x) => x.img_type != 'Cover Photo'
            );
            for (var img of otherImages) {
                this.ImageList.push({
                    id: img.id,
                    image: img.url,
                });
            }
        }
    }

    onProfileInput(event: any): void {
        const file = (event.target as HTMLInputElement).files[0];

        CommonUtils.getJsonFile(file, (reader, jFile) => {
            const json: any = {
                id: '',
                img_for: 'Vehicle',
                img_for_id: this.data.Id,
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
                    this.toasterService.showToast('success', 'Image Saved');
                    this.ActivityImage = 'Save';
                },
                error: (err) => {
                    this.toasterService.showToast('error', err);
                },
            });
        });
    }

    onProfileInputforcoverphoto() {
        const file = (event.target as HTMLInputElement).files[0];

        CommonUtils.getJsonFile(file, (reader, jFile) => {
            const json: any = {
                id: '',
                img_for: 'Vehicle',
                img_for_id: this.data.Id,
                img_type: 'Cover Photo',
                img_name: jFile,
            };
            this.productFixDepartureService.Imagecreate(json).subscribe({
                next: (res) => {
                    this.profile_picture = reader.result;
                    this.toasterService.showToast(
                        'success',
                        'Cover Image Saved'
                    );
                    this.ActivityImage = 'Save';
                },
                error: (err) => {
                    this.toasterService.showToast('error', err);
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
                message:
                    'Are you sure to ' +
                    label.toLowerCase() + '?',
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
                                    this.toasterService.showToast(
                                        'success',
                                        'Image Delete Successfully!'
                                    );
                                    this.ActivityImage = 'Save';
                                },
                                error: (err) => {
                                    this.toasterService.showToast('error', err);
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
}
