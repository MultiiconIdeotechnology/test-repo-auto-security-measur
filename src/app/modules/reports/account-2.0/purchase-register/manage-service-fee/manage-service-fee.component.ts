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
    NgxMatSelectSearchModule
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
  serviceForList: any[] = [];
  serviceForCtrl = new FormControl('');

  constructor(
    private sidebarDialogService: SidebarCustomModalService,
    private builder: FormBuilder,
    private alertService: ToasterService,
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
      suplier_service_charge: record.suplier_service_charge,
      suplier_service_charge_gst: record.suplier_service_charge_gst,
      purchase_base_price: record.purchase_base_price,
      purchase_tax: record.purchase_tax,
    })
  }

  onServiceFor(event: any) {
    console.log("onServiceFor")
  }

  submit() {
  //   if (this.formGroup.invalid) {
  //     this.alertService.showToast('error', 'Please fill up required fields');
  //     return;
  //   }

  //   this.isLoading = true;
  //   let serviceForObj = this.formGroup.get('service_for')?.value;
  //   let payload = this.formGroup.value;
  //   // payload.service_for = serviceForObj.id;

  //   this.whatsappConfigService.createEvent(payload).subscribe({
  //     next: (res: any) => {
  //       if (res) {
  //         let tag = this.buttonLabel == 'create' ? 'created' : 'updated';
  //         this.alertService.showToast('success', `Event ${tag} successfully`);
  //         let resData = {
  //           service_for_id: payload.service_for_id,
  //           service_for: payload.service_for,
  //           suplier_service_charge: payload.suplier_service_charge,
  //           suplier_service_charge_gst: payload.suplier_service_charge_gst,
  //           purchase_base_price: payload.purchase_base_price,
  //           purchase_tax: payload.purchase_tax,
  //         }
          // this.sidebarDialogService.close({ res:payload.id, key: 'manager-service-status' });
  //         this.settingsDrawer.close();
  //       }
  //       this.isLoading = false;
  //     },
  //     error: (err: any) => {
  //       this.alertService.showToast('error', err);
  //       this.isLoading = false;
  //     }
  //   })
  }
}
