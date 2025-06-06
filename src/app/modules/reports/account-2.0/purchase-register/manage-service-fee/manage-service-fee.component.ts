import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';
import { Subject, takeUntil } from 'rxjs';
import { SidebarCustomModalService } from 'app/services/sidebar-custom-modal.service';
import { ToasterService } from 'app/services/toaster.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { OnlyFloatDirective } from '@fuse/directives/floatvalue.directive';
import { AccountService } from 'app/services/account.service';

@Component({
  selector: 'app-manage-service-fee',
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
    MatTooltipModule,
    MatSelectModule,
    NgxMatSelectSearchModule,
    OnlyFloatDirective
  ],
  templateUrl: './manage-service-fee.component.html',
  styleUrls: ['./manage-service-fee.component.scss']
})
export class ManageServiceFeeComponent {
  @ViewChild('settingsDrawer') settingsDrawer: MatSidenav;
  private destroy$: Subject<any> = new Subject<any>();
  title: string = 'Add New Event '
  formGroup: FormGroup;
  isLoading: boolean = false;
  buttonLabel: any = 'Create';
  serviceForList: any[] = ['Airline', 'Bus', 'Hotel','Visa', 'Insurance', 'Holiday'];
  serviceForCtrl = new FormControl('');
  record:any;

  constructor(
    private sidebarDialogService: SidebarCustomModalService,
    private builder: FormBuilder,
    private alertService: ToasterService,
    private accountService: AccountService,
    // private whatsappConfigService: WhatsappConfigService,
  ) {
    this.formGroup = this.builder.group({
      service_for_id: ['', Validators.required],
      service_for: ['', Validators.required],
      suplier_service_charge: ['', Validators.required],
      suplier_service_charge_gst: ['', Validators.required],
      purchase_base_price: ['', Validators.required],
      purchase_tax: ['', Validators.required],
    })
  }

  ngOnInit(): void {
    this.sidebarDialogService.onModalChange().pipe((takeUntil(this.destroy$))).subscribe((res: any) => {
      if (res) {
        if (res['type'] === 'purchase-manage-service-fee') {
          this.buttonLabel = 'Save';
          this.record = res?.data;
          this.formPatchValue(res?.data);
          this.title = 'Manage Service Fee';
          this.settingsDrawer.open()
        }

        // else if (res['type'] === 'whatsapp-event-edit') {
        //   this.buttonLabel = 'Save';
        //   this.title = `Event : ${res.data?.event_name}`
        //   this.settingsDrawer.open();
        // }
      }
    })
  }

  formPatchValue(record: any) {
    this.formGroup.patchValue({
      service_for_id: record.service_for_id,
      service_for: record.service_for,
      suplier_service_charge: record.service_Charge,
      suplier_service_charge_gst: record.sgst,
      purchase_base_price: record.base_Fare,
      purchase_tax: record.purchase_TDS,
    })
  }

  // onServiceFor(event: any) {
  //   console.log("onServiceFor")
  // }

  submit() {
    //   if (this.formGroup.invalid) {
    //     this.alertService.showToast('error', 'Please fill up required fields');
    //     return;
    //   }

    this.isLoading = true;
    let serviceForObj = this.formGroup.get('service_for')?.value;
    let payload = this.formGroup.value;
    // payload.service_for = serviceForObj.id;

    this.accountService.manageServiceFee(payload).subscribe({
      next: (res: any) => {
        if (res) {
          if(res.status == true){
            this.alertService.showToast('success', 'Service fee saved successfully');
            let resData = {
              id : this.record?.id,
              service_for_id: payload.service_for_id,
              service_for: payload.service_for,
              service_Charge: payload.suplier_service_charge,
              sgst: payload.suplier_service_charge_gst,
              base_Fare: payload.purchase_base_price,
              purchase_TDS: payload.purchase_tax,
            }
            this.sidebarDialogService.close({ data: resData, key: 'manager-service-status' });
          } else {
            this.alertService.showToast('error', res.error_message)
          }
          this.settingsDrawer.close();
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        this.alertService.showToast('error', err);
        this.isLoading = false;
      }
    })
  }
}
