import { ReplaySubject, debounceTime, distinctUntilChanged, filter, startWith, switchMap } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf, NgClass, DatePipe, AsyncPipe, NgFor } from '@angular/common';
import { AfterViewInit, Component, Inject, inject } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { CityService } from 'app/services/city.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { VehicleService } from 'app/services/vehicle.service';
import { DateTime } from 'luxon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToasterService } from 'app/services/toaster.service';
import { HotelService } from 'app/services/hotel.service';
import { ProductFixDepartureService } from 'app/services/product-fix-departure.service';

@Component({
  selector: 'app-product-fix-departure-entry',
  templateUrl: './product-fix-departure-entry.component.html',
  styleUrls: ['./product-fix-departure-entry.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    NgClass,
    MatButtonModule,
    MatIconModule,
    DatePipe,
    AsyncPipe,
    NgxMatSelectSearchModule,
    MatDatepickerModule,
    NgxMatTimepickerModule,
    MatSlideToggleModule,
    MatTooltipModule
  ]
})
export class ProductFixDepartureEntryComponent {

  disableBtn: boolean = false
  readonly: boolean = false;
  record: any = {};
  shortList: any[] = [];
  CitytList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
  fieldList: {};

  SupplierList: ReplaySubject<any[]> = new ReplaySubject<any[]>();

  constructor(
    public matDialogRef: MatDialogRef<ProductFixDepartureEntryComponent>,
    private builder: FormBuilder,
    private productFixDepartureService: ProductFixDepartureService,
    public cityService: CityService,
    public alertService: ToasterService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data?.data ?? {}
  }

  formGroup: FormGroup;
  title = "Create Hotel"
  btnLabel = "Create"

  keywords = [];

  announcer = inject(LiveAnnouncer);

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      product_id: [''],
      departure_city_id: [''],
      departure_date: [''],
      
    });

    // this.formGroup.get('cityFilter').valueChanges.pipe(
    //   filter(search => !!search),
    //   startWith(''),
    //   debounceTime(400),
    //   distinctUntilChanged(),
    //   switchMap((value: any) => {
    //     return this.cityService.getCityCombo(value);
    //   })
    // ).subscribe(data => this.CitytList.next(data))

    if (this.record.id) {
      this.productFixDepartureService.getProductFixDepartureRecord(this.record.id).subscribe({
        next: (data) => {
          this.readonly = this.data.readonly;

          this.formGroup.patchValue(data);
          this.formGroup.get('cityFilter').patchValue(data.city_name)
          if (this.readonly)
            this.formGroup.get('city_id').patchValue(data.city_name)
          this.title = this.readonly ? 'Product Fix Departure - ' + this.record.product_name : 'Modify Product Fix Departure';
          this.btnLabel = this.readonly ? 'Close' : 'Save';
        },
        error: err => {
          this.alertService.showToast('error', err)
          
        }

      });
    }
  }

  submit(): void {
    this.disableBtn = true;
    const json = this.formGroup.getRawValue();
    this.productFixDepartureService.create(json).subscribe({
      next: () => {
        this.matDialogRef.close(true);
        this.disableBtn = false;
      }, error: (err) => {
        this.disableBtn = false;
        this.alertService.showToast('error', err, "top-right", true);
      }
    })
  }
}


