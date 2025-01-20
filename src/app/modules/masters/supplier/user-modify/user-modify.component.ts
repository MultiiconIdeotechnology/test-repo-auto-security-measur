import { Component, ViewChild } from '@angular/core';
import { AsyncPipe, CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { SupplierEntryRightComponent } from '../supplier-entry-right/supplier-entry-right.component';
import { FuseConfig, FuseConfigService } from '@fuse/services/config';
import { Subject, takeUntil } from 'rxjs';
import { CityService } from 'app/services/city.service';
import { CurrencyService } from 'app/services/currency.service';
import { EntityService } from 'app/services/entity.service';
import { KycDocumentService } from 'app/services/kyc-document.service';
import { KycService } from 'app/services/kyc.service';
import { SupplierService } from 'app/services/supplier.service';
import { ToasterService } from 'app/services/toaster.service';
import { MatSidenav } from '@angular/material/sidenav';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';

@Component({
  selector: 'app-user-modify',
  standalone: true,
  styles: [
    `
        referral-settings {
            position: static;
            display: block;
            flex: none;
            width: auto;
        }
    `,
  ],
  imports: [
    NgIf,
    NgFor,
    NgClass,
    DatePipe,
    AsyncPipe,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatMenuModule,
    NgxMatSelectSearchModule,
    NgxMatTimepickerModule,
    FuseDrawerComponent,
    MatDividerModule,
    SupplierEntryRightComponent,
  ],
  templateUrl: './user-modify.component.html',
  styleUrls: ['./user-modify.component.scss']
})
export class UserModifyComponent {

  btnLabel = 'Submit';
  formGroup: FormGroup;
  title = 'Edit User';
  disableBtn: boolean = false;
  config: FuseConfig;

  edit: boolean = false;


  private _unsubscribeAll: Subject<any> = new Subject<any>();
  @ViewChild('settingsDrawer') public settingsDrawer: MatSidenav;
  record: any;

  constructor(
    private builder: FormBuilder,
    private supplierService: SupplierService,
    private cityService: CityService,
    private kycDocumentService: KycDocumentService,
    private currencyService: CurrencyService,
    private alertService: ToasterService,
    private entityService: EntityService,
    private kycService: KycService,
    private _fuseConfigService: FuseConfigService,

  ) {
    this.entityService.onUsersupplierEntityCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (item) => {
        this.settingsDrawer.toggle()
        this.record = item?.data;
        this.edit = false;

        if (item?.edit) {
          this.edit = false;
          this.formGroup.patchValue(this.record)
        }


      }
    })

  }

  ngOnInit(): void {

    this._fuseConfigService.config$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((config: FuseConfig) => {
        this.config = config;
      });

    this.formGroup = this.builder.group({
      id: [''],
      user_name: [''],
      email_address: ['', Validators.email],
      mobile_number: [''],
    });



    // this.formGroup.get('email_address').valueChanges.subscribe(text => {
    //   this.formGroup.get('email_address').patchValue(text.toLowerCase(), { emitEvent: false });
    // })
  }

  isValidEmail(email: string): boolean {
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }

  submit(): void {
    if (!this.formGroup.valid) {
      this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.formGroup.markAllAsTouched();
      return;
    }

    this.disableBtn = true;
    const json = this.formGroup.getRawValue();
    this.supplierService.createUser(json).subscribe({
      next: () => {
        this.disableBtn = false;
        this.alertService.showToast('success', "User has been Updated!", "top-right", true);
        this.entityService.raiserefreshuserSupplierEntityCall(true);
        this.settingsDrawer.close();

      }, error: (err) => {
        this.disableBtn = false;
        this.alertService.showToast('error', err, "top-right", true);

      }
    })
  }

}
