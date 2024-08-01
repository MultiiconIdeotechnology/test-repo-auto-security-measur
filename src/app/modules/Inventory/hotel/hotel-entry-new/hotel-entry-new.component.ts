import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { imgExtantions, Routes } from 'app/common/const';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
    ReactiveFormsModule,
    FormsModule,
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';
import {
    ReplaySubject,
    debounceTime,
    distinctUntilChanged,
    filter,
    startWith,
    switchMap,
} from 'rxjs';
import { CityService } from 'app/services/city.service';
import { HotelRoomService } from 'app/services/hotel-room.service';
import { KycDocumentService } from 'app/services/kyc-document.service';
import { HotelTariffService } from 'app/services/hotel-tariff.service';
import { HotelService } from 'app/services/hotel.service';
import { ToasterService } from 'app/services/toaster.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import {
    MatDatepickerModule,
    MatDatepickerToggle,
} from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { ProductFixDepartureService } from 'app/services/product-fix-departure.service';
import { CommonUtils, DocValidationDTO } from 'app/utils/commonutils';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Linq } from 'app/utils/linq';

@Component({
    selector: 'app-hotel-entry-new',
    templateUrl: './hotel-entry-new.component.html',
    styleUrls: ['./hotel-entry-new.component.scss'],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        ReactiveFormsModule,
        MatInputModule,
        MatDividerModule,
        MatFormFieldModule,
        MatSelectModule,
        RouterModule,
        NgClass,
        MatButtonModule,
        MatIconModule,
        DatePipe,
        AsyncPipe,
        NgxMatSelectSearchModule,
        MatDatepickerModule,
        NgxMatTimepickerModule,
        MatSlideToggleModule,
        MatChipsModule,
        MatTooltipModule,
        MatTabsModule,
        FormsModule,
        MatCheckboxModule,
        MatMenuModule,
    ],
})
export class HotelEntryNewComponent {
    HotelListRoute = Routes.inventory.hotel_route;
    hotelForm: FormGroup;
    hotelRoomsFrom: FormGroup;
    hotelTariffForm: FormGroup;

    SupplierList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
    first: boolean = true
    CitytList: any[] = [];
    // CitytList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
    @ViewChild(MatDatepickerToggle) toggle: MatDatepickerToggle<Date>;

    readonly: boolean = false;
    btnTitle: string = 'Create';
    HotelRoomsaddbtn = 'Add';
    HotelTariffaddbtn = 'Add';
    isEditable: boolean = false;
    record: any = {};
    star_category: number = 1;
    iconList: any[] = [
        { id: 1, isselect: true },
        { id: 2, isselect: false },
        { id: 3, isselect: false },
        { id: 4, isselect: false },
        { id: 5, isselect: false },
        { id: 6, isselect: false },
        { id: 7, isselect: false },
    ];
    BedTypeList: any[] = ['Twin Bed', 'Double Bed', 'Queen Bed'];

    AmenitiesKeys: string[] = [];
    RoomInclusionsKeys: string[] = [];
    RoomAmenitiesKeys: string[] = [];

    readonly separatorKeysCodes = [ENTER, COMMA] as const;
    readonly separatorKeysCodes1 = [ENTER, COMMA] as const;
    readonly separatorKeysCodes2 = [ENTER, COMMA] as const;

    HotelRoomsList: any[] = [];
    HotelTariffList: any[] = [];

    addOnBlur = true;
    disableBtn: boolean = false;
    id: string;
    index: number;
    HotelTariffindex: number;

    ImageformGroup: FormGroup;
    ImageList: any[] = [];
    ItineraryImageList: any[] = [];
    profile_picture: any;
    profile_pictureid: any;
    HotelImage = 'Add';

    constructor(
        private builder: FormBuilder,
        public route: ActivatedRoute,
        public toasterService: ToasterService,
        private conformationService: FuseConfirmationService,
        private cityService: CityService,
        public alertService: ToasterService,
        private hotelService: HotelService,
        private hotelRoomService: HotelRoomService,
        private hotelTariffService: HotelTariffService,
        private kycDocumentService: KycDocumentService,
        public productFixDepartureService: ProductFixDepartureService
    ) { }

    ngOnInit(): void {
        this.hotelForm = this.builder.group({
            id: [''],
            hotel_name: [''],
            city_id: [''],
            city_name: [''],
            star_category: [''],
            hotel_address: [''],
            location: [''],
            longitude: [''],
            latitude: [''],
            contact_number: [''],
            email_address: ['', Validators.email],
            booking_policy: [''],
            cancellation_policy: [''],
            hotel_amenities: [''],

            cityFilter: [''],
        });

        this.hotelRoomsFrom = this.builder.group({
            id: [''],
            hotel_id: [''],
            room_name: [''],
            bed_type: ['Twin Bed'],
            room_size: [''],
            room_inclusions: [''],
            room_amenities: [''],
            is_breakfast_included: [false],
            is_dinner_included: [false],
        });

        this.hotelTariffForm = this.builder.group({
            id: [''],
            hotel_id: [''],
            room_id: [''],
            supplier_id: [''],
            from_date: [''],
            to_date: [''],
            single_sharing: [0],
            double_sharing: [0],
            triple_sharing: [0],
            child_with_bed: [0],
            child_with_no_bed: [0],

            supplierfilter: [''],
        });

        this.ImageformGroup = this.builder.group({
            profile_picture: [''],
        });

        // this.hotelForm.get('hotel_name').valueChanges.subscribe(text => {
        //     this.hotelForm.get('hotel_name').patchValue(Linq.convertToTitleCase(text), { emitEvent: false });
        //  }) 

        //  this.hotelRoomsFrom.get('room_name').valueChanges.subscribe(text => {
        //     this.hotelRoomsFrom.get('room_name').patchValue(Linq.convertToTitleCase(text), { emitEvent: false });
        //  }) 

        this.hotelForm.get('email_address').valueChanges.subscribe(text => {
            this.hotelForm.get('email_address').patchValue(text.toLowerCase(), { emitEvent: false });
        })

        this.hotelForm
            .get('cityFilter')
            .valueChanges.pipe(
                filter((search) => !!search),
                startWith(''),
                debounceTime(400),
                distinctUntilChanged(),
                switchMap((value: any) => {
                    return this.cityService.getCityCombo(value);
                })
            )
            .subscribe({
                next: (data) => {
                    this.CitytList = data
                    if (!this.record.city_id) {
                        this.hotelForm.get("city_id").patchValue(data[0].id)
                        this.first = false
                    }
                }
            });

        this.hotelTariffForm
            .get('supplierfilter')
            .valueChanges.pipe(
                filter((search) => !!search),
                startWith(''),
                debounceTime(400),
                distinctUntilChanged(),
                switchMap((value: any) => {
                    return this.kycDocumentService.getSupplierCombo(value);
                })
            )
            .subscribe((data) => this.SupplierList.next(data));

        this.route.paramMap.subscribe((params) => {
            this.id = params.get('id');
            const readonly = params.get('readonly');

            if (this.id) {
                this.readonly = readonly ? true : false;
                this.btnTitle = readonly ? 'Close' : 'Save';
                this.isEditable = !this.readonly;
                this.hotelService.getHotelDetail(this.id).subscribe({
                    next: (data: any) => {
                        this.record = data;
                        this.hotelForm
                            .get('cityFilter')
                            .patchValue(data.city_name);
                        this.hotelForm.patchValue(this.record);
                        this.selectStar({ id: data.star_category });
                        if (
                            data.hotel_amenities != '' &&
                            data.hotel_amenities != null
                        ) {
                            this.AmenitiesKeys =
                                data.hotel_amenities.split(',');
                        }
                        if (this.record.hotel_rooms.length > 0) {
                            for (let dt of this.record.hotel_rooms) {
                                this.HotelRoomsList.push({
                                    id: dt.id,
                                    isHotelTariff: false,
                                    room_name: dt.room_name,
                                    bed_type: dt.bed_type,
                                    room_size: dt.room_size,
                                    is_breakfast_included:
                                        dt.is_breakfast_included,
                                    is_dinner_included: dt.is_dinner_included,
                                    room_inclusions: dt.room_inclusions,
                                    room_amenities: dt.room_amenities,
                                });
                            }
                        }

                        if (this.record.hotel_tariff.length > 0) {
                            for (let json of this.record.hotel_tariff) {
                                this.HotelTariffList.push({
                                    id: json.id,
                                    room_id: json.room_id,
                                    supplier_id: json.supplier_id,
                                    supplier_name: json.supplier_name,
                                    from_date: json.from_date,
                                    to_date: json.to_date,
                                    child_with_bed: json.child_with_bed,
                                    child_with_no_bed: json.child_with_no_bed,
                                    single_sharing: json.single_sharing,
                                    double_sharing: json.double_sharing,
                                    triple_sharing: json.triple_sharing,
                                });
                            }
                        }

                        if (this.record.images.length >= 1) {
                            var profile = this.record.images.find(
                                (x) => x.img_type == 'Cover Photo'
                            )?.url;
                            if (profile != null && profile != '') {
                                this.profile_picture = profile;
                                this.profile_pictureid =
                                    this.record.images.find(
                                        (x) => x.img_type == 'Cover Photo'
                                    )?.id;
                            }
                            var otherimage = this.record.images.filter(
                                (x) => x.img_type != 'Cover Photo'
                            );
                            if (otherimage.length >= 1) {
                                for (var dt of otherimage) {
                                    this.ImageList.push({
                                        id: dt.id,
                                        image: dt.url,
                                    });
                                }
                            }
                        }
                    }, error: err => this.alertService.showToast('error', err)
                });
            }
        });
    }

    selectStar(data: any) {
        this.star_category = data.id;
        this.iconList.forEach((x) => {
            if (x.id <= data.id) {
                x.isselect = true;
            } else {
                x.isselect = false;
            }
        });
    }

    AddAmenities(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();

        if (value) {
            this.AmenitiesKeys.push(value);
        }

        event.chipInput!.clear();
    }

    removeAmenities(Amenities): void {
        const index = this.AmenitiesKeys.indexOf(Amenities);
        if (index >= 0) {
            this.AmenitiesKeys.splice(index, 1);
        }
    }

    AddRoomInclusions(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();

        if (value) {
            this.RoomInclusionsKeys.push(value);
        }

        event.chipInput!.clear();
    }

    removeRoomInclusions(RoomInclusions): void {
        const index = this.RoomInclusionsKeys.indexOf(RoomInclusions);
        if (index >= 0) {
            this.RoomInclusionsKeys.splice(index, 1);
        }
    }

    AddRoomAmenities(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();

        if (value) {
            this.RoomAmenitiesKeys.push(value);
        }

        event.chipInput!.clear();
    }

    removeRoomAmenities(RoomAmenities): void {
        const index = this.RoomAmenitiesKeys.indexOf(RoomAmenities);
        if (index >= 0) {
            this.RoomAmenitiesKeys.splice(index, 1);
        }
    }

    SubmitHotel() {
        if (!this.hotelForm.valid) {
            this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
            this.hotelForm.markAllAsTouched();
            return;
        }

        this.disableBtn = true;
        const json = this.hotelForm.getRawValue();
        json.hotel_amenities = this.AmenitiesKeys.join(',');
        json.star_category = this.star_category;

        this.hotelService.create(json).subscribe({
            next: (res) => {
                this.hotelForm.get('id').patchValue(res.id);
                this.toasterService.showToast(
                    'success',
                    this.id
                        ? 'Record modified'
                        : 'New record added',
                    'top-right',
                    true
                );
                this.disableBtn = false;
            },
            error: (err) => {
                this.disableBtn = false;
                this.toasterService.showToast('error', err, 'top-right', true);
            },
        });
    }

    public compareWith(v1: any, v2: any) {
        return v1 && v2 && v1.id === v2.id;
    }

    AddHotelRoom() {
        if (!this.hotelRoomsFrom.valid) {
            this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
            this.hotelRoomsFrom.markAllAsTouched();
            return;
        }

        const json = this.hotelRoomsFrom.getRawValue();
        json.room_inclusions = this.RoomInclusionsKeys.join(',');
        json.room_amenities = this.RoomAmenitiesKeys.join(',');

        json.hotel_id = this.hotelForm.get('id').value;

        this.hotelRoomService.create(json).subscribe({
            next: (res) => {
                if (
                    this.hotelRoomsFrom.get('id').value == '' ||
                    this.hotelRoomsFrom.get('id').value == null
                ) {
                    this.HotelRoomsList.push({
                        id: res.id,
                        isHotelTariff: false,
                        room_name: json.room_name,
                        bed_type: json.bed_type,
                        room_size: json.room_size,
                        is_breakfast_included: json.is_breakfast_included,
                        is_dinner_included: json.is_dinner_included,
                        room_inclusions: this.RoomInclusionsKeys.join(','),
                        room_amenities: this.RoomAmenitiesKeys.join(','),
                    });
                } else {
                    this.HotelRoomsList[this.index] = {
                        id: res.id,
                        isHotelTariff: false,
                        room_name: json.room_name,
                        bed_type: json.bed_type,
                        room_size: json.room_size,
                        is_breakfast_included: json.is_breakfast_included,
                        is_dinner_included: json.is_dinner_included,
                        room_inclusions: this.RoomInclusionsKeys.join(','),
                        room_amenities: this.RoomAmenitiesKeys.join(','),
                    };
                }
                this.toasterService.showToast(
                    'success',
                    this.hotelRoomsFrom.get('id').value == '' ||
                        this.hotelRoomsFrom.get('id').value == null
                        ? 'New record added'
                        : 'Record modified',
                    'top-right',
                    true
                );
                this.HotelRoomsaddbtn = 'Add';
                this.hotelRoomsFrom.get('id').patchValue('');
                this.hotelRoomsFrom.get('room_name').patchValue('');
                this.hotelRoomsFrom.get('room_size').patchValue('');
                // this.hotelRoomsFrom.markAsUntouched();
                this.RoomInclusionsKeys = [];
                this.RoomAmenitiesKeys = [];
            },
            error: (err) => {
                this.toasterService.showToast('error', err, 'top-right', true);
            },
        });
    }

    editRoom(room: any) {
        this.index = this.HotelRoomsList.indexOf(room);
        this.hotelRoomsFrom.patchValue(room);
        this.HotelRoomsaddbtn = 'Save';
        this.RoomInclusionsKeys = room.room_inclusions.split(',');
        this.RoomAmenitiesKeys = room.room_amenities.split(',');
    }

    removeRoom(room: any) {
        this.hotelRoomService.delete(room.id).subscribe({
            next: (res) => {
                this.HotelRoomsList = this.HotelRoomsList.filter(
                    (x) => x != room
                );
                this.toasterService.showToast(
                    'success',
                    'Hotel Room Delete Successfully!',
                    'top-right',
                    true
                );
            },
            error: (err) => {
                this.toasterService.showToast('error', err, 'top-right', true);
            },
        });
    }

    showAddHotelTariff(data: any) {
        this.hotelTariffForm.reset();
        this.hotelTariffForm.get('id').patchValue('');
        data.isHotelTariff = true;
    }

    AddHotelTariff(data: any) {
        const json = this.hotelTariffForm.getRawValue();
        json.hotel_id = this.hotelForm.get('id').value;
        json.room_id = data.id;
        json.supplier_id = this.hotelTariffForm.get('supplier_id').value.id;

        this.hotelTariffService.create(json).subscribe({
            next: (res) => {
                if (
                    this.hotelTariffForm.get('id').value == '' ||
                    this.hotelTariffForm.get('id').value == null
                ) {
                    this.HotelTariffList.push({
                        id: res.id,
                        room_id: json.room_id,
                        supplier_id: json.supplier_id,
                        supplier_name:
                            this.hotelTariffForm.get('supplier_id').value
                                .company_name,
                        from_date: json.from_date,
                        to_date: json.to_date,
                        child_with_bed: json.child_with_bed,
                        child_with_no_bed: json.child_with_no_bed,
                        single_sharing: json.single_sharing,
                        double_sharing: json.double_sharing,
                        triple_sharing: json.triple_sharing,
                    });
                } else {
                    this.HotelTariffList[this.HotelTariffindex] = {
                        id: res.id,
                        room_id: json.room_id,
                        supplier_id: json.supplier_id,
                        supplier_name:
                            this.hotelTariffForm.get('supplier_id').value
                                .company_name,
                        from_date: json.from_date,
                        to_date: json.to_date,
                        child_with_bed: json.child_with_bed,
                        child_with_no_bed: json.child_with_no_bed,
                        single_sharing: json.single_sharing,
                        double_sharing: json.double_sharing,
                        triple_sharing: json.triple_sharing,
                    };
                }
                this.toasterService.showToast(
                    'success',
                    this.hotelTariffForm.get('id').value == '' ||
                        this.hotelTariffForm.get('id').value == null
                        ? 'New record added'
                        : 'Record modified',
                    'top-right',
                    true
                );
                this.HotelTariffaddbtn = 'Add';
                data.isHotelTariff = false;
            },
            error: (err) => {
                this.toasterService.showToast('error', err, 'top-right', true);
            },
        });
    }

    editHotelTariff(data: any, room: any) {
        room.isHotelTariff = true;
        this.HotelTariffindex = this.HotelTariffList.indexOf(data);
        this.hotelTariffForm.patchValue(data);
        this.hotelTariffForm
            .get('supplierfilter')
            .patchValue(data.supplier_name);
        this.hotelTariffForm.get('supplier_id').patchValue({
            id: data.supplier_id,
            company_name: data.supplier_name,
        });
        this.HotelTariffaddbtn = 'Save';
    }

    removeHotelTariff(data: any) {
        this.hotelTariffService.delete(data.id).subscribe({
            next: (res) => {
                this.HotelTariffList = this.HotelTariffList.filter(
                    (x) => x != data
                );
                this.toasterService.showToast(
                    'success',
                    'Hotel Tariff Delete Successfully!',
                    'top-right',
                    true
                );
            },
            error: (err) => {
                this.toasterService.showToast('error', err, 'top-right', true);
            },
        });
    }

    onRangeInputClicked() {
        const fakeMouseEvent = new MouseEvent('click');
        this.toggle._open(fakeMouseEvent);
    }

    GetResult(id: string): boolean {
        return this.HotelTariffList.filter((x) => x.room_id == id).length > 0
            ? true
            : false;
    }

    getroominclusions(data: string) {
        var st = data.split(',');
        return st;
    }

    public onProfileInput(event: any): void {


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
                img_for: 'Hotel',
                img_for_id: this.hotelForm.get('id').value,
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
                    this.HotelImage = 'Save';
                },
                error: (err) => {
                    this.toasterService.showToast('error', err);
                },
            });
        });

        // const filew: File = event.target.files[0];
        // this.getImageDimensions(filew);

    }

    /*****Imge Width *****/
    getImageDimensions(filew: File): void {
        const reader = new FileReader();

        reader.onload = (e: any) => {
            const img = new Image();
            img.onload = () => {
                const width = img.width;
                const height = img.height;

            };
            img.src = e.target.result;
        };

        reader.readAsDataURL(filew);
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
                img_for: 'Hotel',
                img_for_id: this.hotelForm.get('id').value,
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
                    this.HotelImage = 'Save';
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
                                    this.toasterService.showToast(
                                        'success',
                                        'Image Delete Successfully!'
                                    );
                                    this.HotelImage = 'Save';
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

    changecheck(i: any) {
        for (let img of this.ImageList) {
            img.checked = false;
            if (img == i) {
                img.checked = true;
            }
        }
    }
}
