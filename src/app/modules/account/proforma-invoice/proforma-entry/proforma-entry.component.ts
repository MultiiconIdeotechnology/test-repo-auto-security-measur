import { Component, ViewChild } from '@angular/core';
import { AsyncPipe, CommonModule, NgFor, NgIf } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatSidenav } from '@angular/material/sidenav';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { DataManagerService } from 'app/services/data-manager.service';
import { RefferralService } from 'app/services/referral.service';
import { SidebarCustomModalService } from 'app/services/sidebar-custom-modal.service';
import { ToasterService } from 'app/services/toaster.service';
import { debounceTime, distinctUntilChanged, filter, startWith, Subject, switchMap, takeUntil } from 'rxjs';
import { PspSettingService } from 'app/services/psp-setting.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { AccountService } from 'app/services/account.service';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-proforma-entry',
  standalone: true,
  imports: [
    CommonModule,
    FuseDrawerComponent,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    MatSelectModule,
    MatCheckboxModule,
    NgxMatSelectSearchModule,
    MatTooltipModule,
    NgIf,
    NgFor,
    AsyncPipe,
    RouterModule,
    MatDatepickerModule,
    MatMenuModule,
    NgxMatTimepickerModule,
  ],
  templateUrl: './proforma-entry.component.html',
  styleUrls: ['./proforma-entry.component.scss']
})
export class ProformaEntryComponent {

  @ViewChild('settingsDrawer') settingsDrawer: MatSidenav;
  private destroy$: Subject<any> = new Subject<any>();
  title: string = 'Add New Proforman Invoice'
  formGroup: FormGroup;
  buttonLabel: string = 'Create';
  referralData: any = {};
  disableBtn: boolean = false;
  compnyAllList: any[] = [];
  compnyList: any[] = [];
  particularAllList: any[] = [];
  particularList: any[] = [];
  fieldList: any[] = [];



  constructor(
    private sidebarDialogService: SidebarCustomModalService,
    private builder: FormBuilder,
    private accountService: AccountService,
    private _filterService: CommonFilterService,
    private dataManagerService: DataManagerService,
    private referralService: RefferralService,
    private alertService: ToasterService,
    private pspsettingService: PspSettingService
  ) {
    this.formGroup = this.builder.group({
      id: [''],
      company_id: [''],
      companyfilter: [''],
      invoice_date: new Date(),
      customer_name: [''],
      particular: [''],
      particularfilter: [''],
      currency: [''],
      total_amount: [''],
      tax: [''],
      remark: [''],
    })
  }

  ngOnInit(): void {

    // subscribing to modalchange on create and modify
    this.sidebarDialogService.onModalChange().pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) {
        if (res['type'] == 'proforma-invoice-create') {
          this.settingsDrawer.open();
          this.title = 'Add New Proforman Invoice';
          this.buttonLabel = "Create";
        } else if (res['type'] == 'proforma-invoice-info') {
          this.settingsDrawer.open();
          this.title = 'Proforman Invoice Info';
          this.referralData = res?.data;
          this.fieldList = [
            { name: 'Customer Name', value: this.referralData.customer_name },
            { name: 'Invoice No.', value: this.referralData.invoice_no },
            { name: 'Invoice Date', value: this.referralData.invoice_date ? DateTime.fromISO(this.referralData.invoice_date).toFormat('dd-MM-yyyy').toString() : '' },
            { name: 'Currency', value: this.referralData.currency },
            { name: 'tax', value: this.referralData.tax },
            { name: 'Taxable Amount', value: this.referralData.taxable_amount },
            { name: 'Total Amount', value: this.referralData.total_amount },
          ]
        }
      }
    });

    /*************Company combo**************/
    this.formGroup
      .get('companyfilter')
      .valueChanges.pipe(
        filter((search) => !!search),
        startWith(''),
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((value: any) => {
          return this.pspsettingService.getCompanyCombo(value);
        })
      )
      .subscribe({
        next: data => {
          if (!this.compnyAllList?.length) {
            this.compnyAllList = data
          }
          this.compnyList = data
          this.formGroup.get('company_id').setValue(this.compnyList[0]?.id);
        }
      });


    /*************Particular combo**************/
    this.formGroup
      .get('particularfilter')
      .valueChanges.pipe(
        filter((search) => !!search),
        startWith(''),
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((value: any) => {
          return this.pspsettingService.TecProductMasterCombo(value);
        })
      )
      .subscribe({
        next: data => {
          if (!this.particularAllList?.length) {
            this.particularAllList = data
          }
          this.particularList = data
          this.formGroup.get('particular').setValue(this.particularList[0]?.id);
        }
      });

    /*************Currency Upparcase**************/
    this.formGroup.get('currency')?.valueChanges.subscribe(value => {
      if (value !== value?.toUpperCase()) {
        this.formGroup.get('currency')?.setValue(value.toUpperCase(), { emitEvent: false });
      }
    });
  }

  // reseting form to default value
  resetForm() {
    this.formGroup?.patchValue({
      invoice_date: new Date(),
      customer_name: '',
      currency: '',
      total_amount: '',
      tax: '',
      remark: '',
    })

    if (this.compnyAllList?.length) {
      this.compnyList = [...this.compnyAllList]; // Use spread to avoid mutation
      const defaultAgent = this.compnyList[0].id;
      this.formGroup.get("company_id").patchValue(defaultAgent);
    }

    if (this.particularAllList?.length) {
      this.particularList = [...this.particularAllList]; // Use spread to avoid mutation
      const defaultAgent = this.particularList[0].id;
      this.formGroup.get("particular").patchValue(defaultAgent);
    }


    this.disableBtn = false;

  }

  submit(): void {
    if (!this.formGroup.valid) {
      this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.formGroup.markAllAsTouched();
      return;
    }
    
    if (this.formGroup.get('total_amount').value <= 0) {
      this.alertService.showToast('error', 'Total amount must be greater than 0.', 'top-right', true);
      return;
    }
    
    const json = this.formGroup.getRawValue();
    json.invoice_date = DateTime.fromJSDate(json.invoice_date).toFormat('yyyy-MM-dd'),
    // return
    this.disableBtn = true
      this.accountService.create(json).subscribe({
        next: (data) => {
          this.alertService.showToast('success', 'Proforma Invoice created successfully');
          this.resetForm()
          if (data.id) {
            let resData = {
              id: data.id,
              invoice_no: data.invoice_no,
              invoice_date: data.invoice_date,
              customer_name: data.customer_name,
              currency: data.currency,
              taxable_amount: data.taxable_amount,
              tax: data.tax,
              total_amount: data.total_amount,
              remark: data.remark,
            }
            this.sidebarDialogService.close({ data: resData, key: 'create-response' });
            this.settingsDrawer.close();
          }

          this.disableBtn = false;
        }, error: (err) => {
          this.alertService.showToast('error', err)
          this.disableBtn = false
        }
      });

    // const json = {
    //   id: this.ismodify ? this.formGroup.get('id').value : '',
    //   kyc_profile_id: this.routId,
    //   document_id: this.formGroup.get('document_id').value.id,
    //   is_required: this.formGroup.get('is_required').value,
    //   is_required_group: this.formGroup.get('is_required_group').value
    // }
    // this.disableBtn = true
    // this.kycService.documentsCreate([json]).subscribe({
    //   next: (res) => {
    //     if (!json.id) {
    //       this.toasterService.showToast('success', 'New record added', "top-right", true);
    //     }
    //     else {
    //       this.TempDataList[this.index].document_id = this.formGroup.get('document_id').value.id;
    //       this.TempDataList[this.index].document_name = this.formGroup.get('document_id').value.document_name;
    //       this.TempDataList[this.index].document_group = this.formGroup.get('document_id').value.document_group;
    //       this.TempDataList[this.index].is_required = this.formGroup.get('is_required').value;
    //       this.TempDataList[this.index].is_required_group = this.formGroup.get('is_required_group').value;

    //       this.toasterService.showToast('success', 'Record modified', "top-right", true);
    //     }

    //     this.disableBtn = false;
    //     if (add && res) {
    //       this.formGroup.get('document_group').patchValue('')
    //       this.formGroup.get('documentfilter').patchValue('')
    //       this.formGroup.get('document_id').patchValue('')
    //       this.formGroup.get('is_required').patchValue(false)
    //       this.formGroup.get('is_required_group').patchValue(false)
    //     }
    //   }, error: (err) => {
    //     this.disableBtn = false;
    //     this.toasterService.showToast('error', err)
    //   }
    // })
  }

  public compareWith(v1: any, v2: any) {
    return v1 && v2 && v1.id === v2.id;
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;

    // Allow numbers (48-57) and decimal point (46)
    if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode !== 46) {
      return false;
    }

    // Ensure that only one decimal point is allowed
    const inputValue = event.target.value;
    if (charCode === 46 && inputValue.includes('.')) {
      return false;
    }

    return true;
  }
}
