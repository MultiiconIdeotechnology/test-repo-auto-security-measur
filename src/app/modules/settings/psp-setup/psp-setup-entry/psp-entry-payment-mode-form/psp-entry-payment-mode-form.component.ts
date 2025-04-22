import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators, FormGroupDirective } from '@angular/forms';
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
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FuseConfirmationService } from '@fuse/services/confirmation';

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
    MatIconModule,
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
  profileId: any

  constructor(
    private builder: FormBuilder,
    private pspSetupService: PspSetupService,
    private toasterService: ToasterService,
    private walletService: WalletService,
    private activatedRoute: ActivatedRoute,
    private conformationService: FuseConfirmationService,
  ) { }


  ngOnInit(): void {

    this.activatedRoute.queryParams.subscribe((params: any) => {
      this.profileId = params['id'];
      console.log(">>>", this.profileId)
      if (this.profileId) {
         this.getPgProfileById(this.profileId)
      }
    })

    this.pspSetupService.managePgProfile$.pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res && res.status == 'success' && res?.id) {
        console.log("res?.id", res?.id)
        this.profileId = res?.id;
      }
    })

    this.formGroup = this.builder.group({
      id: [''],
      profile_id: [''],
      psp_name:[''],
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

  getPgProfileById(id: any) {
    this.isLoading = true;
    this.pspSetupService.getPgProfileFromId(id).subscribe({
      next: (resp: any) => {
        this.isLoading = false;
        if (resp) {
          console.log("getprofilebyid", resp)
          this.tableList = resp?.payment_getway_settings || [];
          // this.toasterService.showToast('success', 'Profile name saved successfully');
        }
      },
      error: (err) => {
        this.toasterService.showToast('error', err)
        this.isLoading = false;
      },
    });
  }

  edit(record: any) {
    // this.formGroup.get('id').patchValue(record.id);
    console.log("record>>>", record)
    if(record){
      this.formGroup.patchValue(record);
      this.formGroup.get('psp_id').patchValue({id:record.psp_id, provider:record.psp_name})
    }
  }

  deleteRow(record:any, index:number){
      console.log("index", index)
      const label: string = 'Delete PSP Settings';
      this.conformationService.open({
          title: label,
          message:`Are you sure you want to delete PG Settings?`
        })
        .afterClosed()
        .subscribe((res) => {
          if (res === 'confirmed') {
  
            // const executeMethod = () => {
            this.pspSetupService.deletePgSettings(record.id).subscribe({
              next: (res: any) => {
                console.log("res>>>", res)
                if (res && res['status']) {
                  this.toasterService.showToast(
                    'success',
                    'PSP Setting has been Deleted!',
                    'top-right',
                    true
                  );
                  this.tableList.splice(index, 1);
                  this.tableList = [...this.tableList];
                } else {
                  console.log("Response status is false")
                }
              },
              error: (err) => {
                this.toasterService.showToast('error', err)
                this.isLoading = false;
              },
            });
            // }
          }
        });
  }

  submit(formDirective:FormGroupDirective) {
    this.isLoading = true;
    let pspObj = this.formGroup.get('psp_id')?.value;
    let tableObj = this.formGroup.value;
    let payload = this.formGroup.value;
    payload.psp_id = payload.psp_id?.id;
    payload.profile_id = this.profileId;
    tableObj.psp_name = pspObj?.provider;

    console.log("payload", payload)
    this.pspSetupService
      .managePGSettings(payload)
      .subscribe({
        next: (resp: any) => {
          if (payload?.id) {
            this.tableList.forEach((item: any, index: any) => {
              if (item.id == resp.id) {
                console.log("tableObj", tableObj)
                this.tableList[index] = tableObj;
                this.toasterService.showToast('success', 'Profile name updated successfully');
                formDirective.resetForm();
              }
            })

          } else {
            this.formGroup.get('id').patchValue(resp.id);
            tableObj.id = resp.id;
            this.tableList.push(tableObj)
            this.toasterService.showToast('success', 'Profile name saved successfully');
            formDirective.resetForm();
          }
          this.isLoading = false;
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
