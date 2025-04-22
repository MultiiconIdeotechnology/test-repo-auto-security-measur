import { Routes } from 'app/common/const';
import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { PspEntyProfileFormComponent } from './psp-enty-profile-form/psp-enty-profile-form.component';
import { PspEntryPaymentModeFormComponent } from './psp-entry-payment-mode-form/psp-entry-payment-mode-form.component';
import { PspSetupService } from 'app/services/psp-setup.service';
import { takeUntil, Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ToasterService } from 'app/services/toaster.service';
import { SidebarCustomModalService } from 'app/services/sidebar-custom-modal.service';

@Component({
  selector: 'app-psp-setup-entry',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatRadioModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatDatepickerModule,
    MatChipsModule,
    NgxMatSelectSearchModule,
    PspEntyProfileFormComponent,
    PspEntryPaymentModeFormComponent,
    RouterLink
  ],
  templateUrl: './psp-setup-entry.component.html',
  styleUrls: ['./psp-setup-entry.component.scss']
})
export class PspSetupEntryComponent {
  @ViewChild('pspEntryProfile') pspEntryProfileComponent!: PspEntyProfileFormComponent;
  @ViewChild('pspEntryPaymentMode') pspEntryPaymentModeComponent!: PspEntryPaymentModeFormComponent;

  disableBtn: boolean = false
  readonly: boolean = false;
  pspSetupRoute = Routes.settings.psp_setup_route;
  record: any = {};
  private destroy$ = new Subject<void>();
  isProfileFormSuccess:boolean = false;
  profileFormData:any;
  profileId:any;
  formGroup: FormGroup;

  constructor(
    private pspSetupService: PspSetupService,
    private activatedRoute: ActivatedRoute,
    private toasterService:ToasterService,
    private router: Router,
    private modalService: SidebarCustomModalService,
  ) {
    this.activatedRoute.queryParams.subscribe((params:any) => {
       this.profileId = params['id'];
      console.log(">>>", this.profileId)
      if(this.profileId){
        this.isProfileFormSuccess = true;
      }
   })
   }


  ngAfterViewInit(): void {
    // -- get the localStorage data if the psp-entry-profile-form saved to reflect changes.
    this.pspSetupService.managePgProfile$.pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if(res){
        this.profileFormData = JSON.parse(localStorage.getItem('pspSetupProfile'));
      }
    })

    // check if the localStorage has profileFormData
    this.profileFormData = JSON.parse(localStorage.getItem('pspSetupProfile'));
    if(this.profileFormData && this.profileFormData?.id){
      this.getPgProfileById(this.profileFormData?.id);
    }

    
  }

  getPgProfileById(id: any) {
    this.pspSetupService.getPgProfileFromId(id).subscribe({
      next: (resp: any) => {
        if (resp) {
          console.log("getprofilebyid", resp)
          this.pspEntryPaymentModeComponent.tableList = resp?.payment_getway_settings || [];
          this.pspEntryProfileComponent.formGroup.patchValue({
            id:resp?.id,
            profile_name:resp?.profile_name
          })
          // this.toasterService.showToast('success', 'Profile name saved successfully');
        }
      },
      error: (err) => {
        this.toasterService.showToast('error', err)
      },
    });
  }

  onPspSetupRoute(){
    this.modalService.closeModal();
    this.router.navigate([this.pspSetupRoute])
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
