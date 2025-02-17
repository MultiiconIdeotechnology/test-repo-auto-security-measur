import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { combineLatest, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SidebarCustomModalService } from 'app/services/sidebar-custom-modal.service';
import { MatSidenav } from '@angular/material/sidenav';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { CashbackReadComponent } from './cashback-read/cashback-read.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CashbackParameterService } from 'app/services/cashback-parameters.service';
import { ToasterService } from 'app/services/toaster.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatOptionModule } from '@angular/material/core';
import { OnlyFloatDirective } from '@fuse/directives/floatvalue.directive';

@Component({
  selector: 'app-cashback-parameter-entry',
  standalone: true,
  imports: [
    CommonModule,
    FuseDrawerComponent,
    CashbackReadComponent,
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatOptionModule,
    FuseDrawerComponent,
    OnlyFloatDirective
  ],
  templateUrl: './cashback-parameter-entry.component.html',
  styleUrls: ['./cashback-parameter-entry.component.scss']
})
export class CashbackParameterEntryComponent {
  @ViewChild('settingsDrawer') public settingsDrawer: MatSidenav;
  modalType: string | null = null;
  modalData: any;
  record: any;
  btnLabel: string = 'Create';
  private subscription: Subscription;
  private cashbackSubscription: Subscription;
  private companySubscription: Subscription;
  cashbackId: any;
  formGroup: FormGroup;
  tempCashBackId:any;

  cashforList: any[] = [
    { label: 'Company', value: 'Company' },
    { label: 'Agent', value: 'Agent' }
  ]

  transactionTypeList: any[] = [
    { label: 'Domestic', value: 'Domestic' },
    { label: 'International', value: 'International' }
  ]

  constructor(
    private modalService: SidebarCustomModalService,
    private cashbackService: CashbackParameterService,
    private formBuilder: FormBuilder,
    private alertService: ToasterService,
  ) { }

  ngOnInit(): void {
    this.subscription = this.modalService.onModalChange().subscribe(modal => {
      if (modal) {
        this.settingsDrawer.toggle();
        this.modalType = modal.type;
        this.modalData = modal.data;

        if (this.modalData && this.modalData.data) {
          this.record = { ...this.modalData.data };
          this.formGroup.patchValue(this.record);
        } else {
          this.formGroup?.reset(
            {
              id:"",
              cashback_for_id:"",
              cashback_for:"",
              transaction_type:"",
              from_amount:0,
              to_amount:0,
              fix_cashback:0,
              from_range:0,
              to_range:0,
              minimum_amount:0,
            }
          );
        }

        if (this.modalType == 'edit') {
          this.btnLabel = 'Save'
        } else {
          this.btnLabel = 'Create'
        }
      } else {
        this.modalType = null;
        this.modalData = null;
      }
    });

    this.cashbackSubscription = this.cashbackService.cashBackId$.subscribe(id => {
      this.cashbackId = id;
    });

    this.companySubscription = this.cashbackService.companyList$.subscribe(data => {
      this.cashforList = data;
      this.tempCashBackId = data.find((item:any) => item.company_name == 'BONTON HOLIDAYS PVT. LTD.')?.company_id;
    })

    this.formGroup = this.formBuilder.group({
      id: [''],
      cashback_for_id: [''],
      cashback_for: ['', Validators.required],
      transaction_type: ['', Validators.required],
      from_amount: [0, Validators.required],
      to_amount: [0, [Validators.required]],
      fix_cashback: [0, Validators.required],
      from_range: [0, [Validators.required]],
      to_range: [0, [Validators.required]],
      minimum_amount: [0, [Validators.required]],
    });

    this.onUpdateCashbackValue();

    // Subscribe to value changes of the three inputs
      combineLatest([
        this.formGroup.get('from_range')!.valueChanges,
        this.formGroup.get('to_range')!.valueChanges,
        this.formGroup.get('minimum_amount')!.valueChanges
      ]).pipe(
        debounceTime(300)
      ).subscribe(([fromRange, toRange, minAmount]) => {
        if (fromRange && toRange && minAmount) {
          this.formGroup.get('fix_cashback')?.reset(0);
          this.formGroup.get('fix_cashback')?.disable();
          this.formGroup.get('fix_cashback')?.clearValidators();
        } else {
          this.formGroup.get('fix_cashback')?.enable();
          this.formGroup.get('fix_cashback')?.setValidators(Validators.required);
        }
      });
  }

  // To change the value in form input based on selection of fix cashback
  onUpdateCashbackValue() {
    this.formGroup.get('fix_cashback').valueChanges.subscribe((val: any) => {
      const formRangeInput = this.formGroup.get('from_range');
      const toRangeInput = this.formGroup.get('to_range');
      const minAmountInput = this.formGroup.get('minimum_amount');

      if (val > 0) {
        formRangeInput?.reset(0);
        formRangeInput?.disable();
        formRangeInput.clearValidators();

        toRangeInput?.reset(0);
        toRangeInput?.disable();
        toRangeInput.clearValidators();

        minAmountInput?.reset(0);
        minAmountInput?.disable();
        minAmountInput.clearValidators();
      } else {
        formRangeInput?.setValidators(Validators.required);
        toRangeInput?.setValidators(Validators.required);
        minAmountInput?.setValidators(Validators.required);
        formRangeInput?.enable();
        toRangeInput?.enable();
        minAmountInput?.enable();
      }

      // Ensure validation updates
      formRangeInput.updateValueAndValidity();
      toRangeInput.updateValueAndValidity();
      minAmountInput.updateValueAndValidity();
    });

  }

  submit() {

    if (!this.formGroup.valid) {
      this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.formGroup.markAllAsTouched();
      return;
    }
    
    const formData = this.formGroup.getRawValue();
    if(formData.from_amount >= formData.to_amount){
      this.alertService.showToast('error', 'From Amount cannot be greater or equal to To Amount', 'top-right', true);
      // this.formGroup.get('from_amount').reset();
      // this.formGroup.get('from_amount').markAsTouched();
      // this.formGroup.get('to_amount').reset();
      // this.formGroup.get('to_amount').markAsTouched();
      return;
    }
    
    if(!formData.fix_cashback || formData.fix_cashback == 0){
      if(formData.from_range >= formData.to_range){
        this.alertService.showToast('error', 'From Range cannot be greater or equal to To Range', 'top-right', true);
        // this.formGroup.get('from_range').reset();
        // this.formGroup.get('from_range').markAsTouched();
        // this.formGroup.get('to_range').reset();
        // this.formGroup.get('to_range').markAsTouched();
        return;
      }
      
    }
    
    formData.cashback_for_id = this.cashbackId || this.tempCashBackId;

    this.cashbackService.create(formData).subscribe({
      next: (res: any) => {
        if (res && res['status']) {
          if (formData.id) {
            this.cashbackService.updateCashbackItem(formData);
            this.alertService.showToast('success', 'Record has been modified', 'top-right', true);
          }
          else {
            formData.id = res['id'];
            // formData.cashback_for_id = this.tempCashBackId;
            this.cashbackService.addCashbackItem(formData)
            this.alertService.showToast('success', 'New record has been added', 'top-right', true);
          }
          this.settingsDrawer.close();
          this.modalService.closeModal();
        }
      },
      error: (err) => {
        this.alertService.showToast('error', err, 'top-right', true);
      },
    });
  }

  closeSidebar(): void {
    this.modalService.closeModal();
    this.settingsDrawer.close();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.cashbackSubscription.unsubscribe();
    this.companySubscription.unsubscribe();
  }
}
