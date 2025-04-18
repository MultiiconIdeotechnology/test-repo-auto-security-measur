import { Routes } from 'app/common/const';
import { Component } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
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
  disableBtn: boolean = false
  readonly: boolean = false;
  pspSetupRoute = Routes.settings.psp_setup_route;
  record: any = {};
  private destroy$ = new Subject<void>();
  isProfileFormSuccess:boolean = false;

  formGroup: FormGroup;

  constructor(
    private builder: FormBuilder,
    private pspSetupService: PspSetupService,
  ) { }


  ngOnInit(): void {
    this.pspSetupService.managePgProfile$.pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if(res && res.status == 'success'){
        this.isProfileFormSuccess = true;
        console.log("res", res)
      }
    })
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
