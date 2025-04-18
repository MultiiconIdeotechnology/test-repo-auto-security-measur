import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { MatMenuModule } from '@angular/material/menu';
import { PspSetupService } from 'app/services/psp-setup.service';
import { ToasterService } from 'app/services/toaster.service';
import { WalletService } from 'app/services/wallet.service';
import { takeUntil, Subject } from 'rxjs';

@Component({
  selector: 'app-psp-entry-payment-mode-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    CommonModule,
    MatSelectModule,
    NgxMatSelectSearchModule,
    PrimeNgImportsModule,
    MatMenuModule,
  ],
  templateUrl: './psp-entry-payment-mode-form.component.html',
  styleUrls: ['./psp-entry-payment-mode-form.component.scss']
})
export class PspEntryPaymentModeFormComponent {

  disableBtn: boolean = false
  formGroup: FormGroup;
  readonly: boolean = false;
  pgList: any[] = ["PG", "Credit Card", "Debit Card", "UPI", "Net Banking", "Internation Card"];
  pspList: any[] = [];
  pgFilter: FormControl = new FormControl('');
  tableList: any = [];
  sortColumn: string = "";
  istableDataLoading: boolean = false;
  isLoading: boolean = false;
  private destroy$ = new Subject<void>();
  profileId:any

  constructor(
    private builder: FormBuilder,
    private pspSetupService: PspSetupService,
    private toasterService: ToasterService,
    private walletService: WalletService,
  ) { }


  ngOnInit(): void {

    this.pspSetupService.managePgProfile$.pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if(res && res.key == 'add'){
        if (res && res.status == 'success' && res?.id) {
          this.profileId = res?.id;
        }
      } 
    })

    this.formGroup = this.builder.group({
      id: [''],
      profile_id:[''],
      psp_id: ['', Validators.required],
      mode: ['', Validators.required],
      description: ['', Validators.required],
    });

    this.getPSPList('');
  }

  public compareWith(v1: any, v2: any) {
    return v1 && v2 && v1.id === v2.id;
  }

  getPSPList(value: string) {
    this.walletService.getPaymentGatewayCombo(value).subscribe((data) => {
      this.pspList = data;

      // for (let i in this.pspList) {
      // 	this.pspList[i].id_by_value = this.pspList[i].provider;
      // }
    })
  }

  submit() {
    this.isLoading = true;
    let payload = this.formGroup.value;
    payload.profile_id = this.profileId;
    this.pspSetupService
      .managePGSettings(this.formGroup.value)
      .subscribe({
        next: (resp: any) => {
          this.isLoading = false;
          if (resp) {
            this.tableList.push(this.formGroup.value)
            this.toasterService.showToast('success', 'Profile name saved successfully');
          }
        },
        error: (err) => {
          this.toasterService.showToast('error', err)
          this.isLoading = false;
        },
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
