import { Component, ViewChild } from '@angular/core';
import { AsyncPipe, CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { WPendingComponent } from 'app/modules/account/withdraw/pending/pending.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { FuseConfig, Themes, FuseConfigService } from '@fuse/services/config';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { UserService } from 'app/core/user/user.service';
import { AgentService } from 'app/services/agent.service';
import { EntityService } from 'app/services/entity.service';
import { ToasterService } from 'app/services/toaster.service';
import { of, ReplaySubject, Subject, switchMap, takeUntil } from 'rxjs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-change-email-number',
  standalone: true,
  styles: [
    `
        app-change-email-number {
            position: static;
            display: block;
            flex: none;
            width: auto;
        }
    `,
  ],
  imports: [
    FuseDrawerComponent,
    MatDividerModule,
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
    WPendingComponent,
    CommonModule,
    MatCheckboxModule,
    FormsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './change-email-number.component.html',
  styleUrls: ['./change-email-number.component.scss']
})
export class ChangeEmailNumberComponent {

  @ViewChild('settingsDrawer') public settingsDrawer: MatSidenav;
  config: FuseConfig;
  layout: string;
  scheme: 'dark' | 'light';
  theme: string;
  themes: Themes;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  mobileVerifyFlag: boolean = false;
  emailVerifyFlag: boolean = false;

  notVerifyMobileFlag: boolean = false;
  notVerifyEmailFlag: boolean = false;

  contactForm: FormGroup;
  verifyForm: FormGroup;
  emailForm: FormGroup;

  MobileCodeList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
  for: any;
  user: any;
  userDetail: any;
  data: any;
  title: any;

  constructor(
    public agentService: AgentService,
    private conformationService: FuseConfirmationService,
    private _fuseConfigService: FuseConfigService,
    private matDialog: MatDialog,
    private alertService: ToasterService,
    private entityService: EntityService,
    private fb: FormBuilder,
    private _userService: UserService,
  ) {

    this._userService.user$
      .pipe((takeUntil(this._unsubscribeAll)))
      .subscribe((user: any) => { this.user = user; });

    this.entityService.onChangeEmailNumberCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (data) => {
        this.data = data
        this.userDetail = data?.data
        this.settingsDrawer.toggle()
        this.verifyForm.patchValue({ code: '' });
        this.emailForm.patchValue({ email: '' });
        this.contactForm.patchValue({ mobile_number: '' });

        // this.title = this.data?.flag == 'Mobile' ? 'Update Mobile Number' : ''

        if (this.mobileVerifyFlag === false && this.data?.flag == 'mobile') {
          this.title = 'Update Mobile Number'
        }
        else if (this.mobileVerifyFlag === true || this.emailVerifyFlag === true || (this.data?.flag == 'verify-mobile' && this.mobileVerifyFlag === false) || (this.data?.flag == 'verify-email' && this.emailVerifyFlag === false)) {
          this.title = 'Verify OTP'
        } else if (this.emailVerifyFlag === false && this.data?.flag == 'email') {
          this.title = 'Update Email Address'
        }


        if (this.data?.flag == 'verify-email' || this.data?.flag == 'verify-mobile') {
          setTimeout(() => {
            this.sendOTP();
          }, 2000);
        }

      }
    })
  }

  ngOnInit(): void {
    this.mobileCodeCombo();
    this.contactForm = this.fb.group({
      mobilefilter: [''],
      mobile_code: [''],
      mobile_number: [''],
    });

    this.verifyForm = this.fb.group({
      code: ['', [Validators.minLength(6), Validators.maxLength(6)]],
    });

    this.emailForm = this.fb.group({
      email: ['', [Validators.email]],
    });

    this.contactForm.patchValue({
      mobile_number: this.data?.data?.mobile_number
    });

    this.emailForm.patchValue({
      email: this.data?.data?.email
    });
  }

  mobileCodeCombo() {
    this.agentService.getMobileCodeCombo().subscribe((res: any) => {
      this.MobileCodeList.next(res);
      this.contactForm.get('mobile_code').patchValue('91');
    });
  }

  filterMobile(value: string) {
    this.agentService.getMobileCodeCombo(value).pipe(
      switchMap(MobileCodeList => {
        if (value) {
          const mobilefilter = MobileCodeList.filter(item =>
            (item.mobile_code?.toLowerCase().includes(value?.toLowerCase())) || (item.country_code?.toLowerCase().includes(value?.toLowerCase())));
          return of(mobilefilter);
        } else {
          return of(MobileCodeList);
        }
      })
    ).subscribe(res => {
      this.MobileCodeList.next(res);
    });
  }

  sendOTP(): void {
    if (this.contactForm.invalid) {
      this.alertService.showToast('error', 'Invalid Mobile Number, please try again')
      return;
    }
    else if (this.emailForm.invalid) {
      this.alertService.showToast('error', 'Invalid Email Address, please try again')
      return;
    }
    else if (this.emailForm.get('email')?.invalid) {
      this.emailVerifyFlag = false;
      return;
    }
    else if (this.data?.flag == 'email') {
      this.emailVerifyFlag = false;
      this.agentService.emailVerificationOTP({ email: this.emailForm.get('email')?.value, id: this.userDetail?.id, for: "Agent" }).subscribe({
        next: (res) => {
          this.emailVerifyFlag = true;
          // this.entityService.raiseChangeEmailNumberCall(true)
          // Swal.fire({
          //     icon: 'info',
          //     html: `A message with OTP has been sent to email address <b>${this.emailForm.get('email')?.value}<b>`,
          //     customClass: 'swal-model',
          // });
          //this.settingsDrawer.close(true);
        }, error: (err) => {
          this.alertService.showToast('error', err)
        }
      })
    } else if (this.data?.flag == 'mobile') {
      this.mobileVerifyFlag = false;
      this.agentService.mobileVerificationOTP({ mobile_code: this.contactForm.get('mobile_code')?.value, mobile_number: this.contactForm.get('mobile_number')?.value, id: this.userDetail?.id, for: "Agent" }).subscribe({
        next: (res) => {
          this.mobileVerifyFlag = true;
          // this.entityService.raiseChangeEmailNumberCall(true)

          // Swal.fire({
          //     icon: 'info',
          //     html: `A message with OTP has been sent to number <b>${this.contactForm.get('mobile_number')?.value}</b>`,
          //     customClass: 'swal-model',
          // });
        }, error: (err) => {
          this.alertService.showToast('error', err)
        }
      })
    }
    else if (this.data?.flag == 'verify-email') {
      //this.emailVerifyFlag = false;
      this.agentService.emailVerificationOTP({ email: this.data.data?.email, id: this.userDetail?.id, for: "Agent" }).subscribe({
        next: (res) => {
          this.emailVerifyFlag = true;
          // this.entityService.raiseChangeEmailNumberCall(true)

          // Swal.fire({
          //     icon: 'info',
          //     html: `A message with OTP has been sent to email address <b>${this.emailForm.get('email')?.value}<b>`,
          //     customClass: 'swal-model',
          // });
          //this.settingsDrawer.close(true);
        }, error: (err) => {
          this.alertService.showToast('error', err)
        }
      })
    }
    else if (this.data?.flag == 'verify-mobile') {
      // this.mobileVerifyFlag = false;
      this.agentService.mobileVerificationOTP({ mobile_code: this.data.data?.mobile_code, mobile_number: this.data.data?.mobile_number, id: this.userDetail?.id, for: "Agent" }).subscribe({
        next: (res) => {
          this.mobileVerifyFlag = true;
          // this.entityService.raiseChangeEmailNumberCall(true)

          // Swal.fire({
          //     icon: 'info',
          //     html: `A message with OTP has been sent to number <b>${this.contactForm.get('mobile_number')?.value}</b>`,
          //     customClass: 'swal-model',
          // });
        }, error: (err) => {
          this.alertService.showToast('error', err)
        }
      })
    }
  }

  verifyOTP(): void {
    if (this.verifyForm.invalid) {
      this.alertService.showToast('error', 'Invalid OTP, please try again')
      return;
    }
    else if (this.data?.flag == 'verify-email') {
      this.for = "Agent";
      this.agentService.agentEmailVerify(this.data.data?.email, this.verifyForm.get('code')?.value, this.for).subscribe({
        next: (res) => {
          // Swal.fire({
          //   icon: 'success',
          //   title: 'Email Address verified',
          //   customClass: 'swal-model',
          // });
          this.settingsDrawer.close();
          // this.entityService.raiseChangeEmailNumberCall(true)

        }, error: (err) => {
          this.alertService.showToast('error', err)
        }
      })
    } else if (this.data?.data.flag == 'verify-mobile') {
      this.for = "Agent";
      this.agentService.agentMobileVerify(this.verifyForm.get('code')?.value, this.contactForm.get('mobile_code')?.value, this.contactForm.get('mobile_number')?.value, this.for).subscribe({
        next: (res) => {
          Swal.fire({
            title: 'WhatsApp number verified',
            icon: 'success'
          });

          this.settingsDrawer.close();
          // this.entityService.raiseChangeEmailNumberCall(true)

        }, error: (err) => {
          this.alertService.showToast('error', err)
        }
      })
    }
    else if (this.data?.flag == 'email') {
      this.for = "Agent";
      this.agentService.agentEmailVerify(this.emailForm.get('email')?.value, this.verifyForm.get('code')?.value, this.for).subscribe({
        next: (res) => {
          // Swal.fire({
          //   icon: 'success',
          //   title: 'Email Address verified',
          //   customClass: 'swal-model',
          // });
          this.alertService.showToast('success', 'Email Updated')
          this.settingsDrawer.close();
          this.entityService.raiserefreshChangeEmailNumberCall(true)
          this.mobileVerifyFlag = false;
          this.emailVerifyFlag = false;

        }, error: (err) => {
          this.alertService.showToast('error', err)
        }
      })
    } else {
      this.for = "Agent";
      this.agentService.agentMobileVerify(this.verifyForm.get('code')?.value, this.contactForm.get('mobile_code')?.value, this.contactForm.get('mobile_number')?.value, this.for).subscribe({
        next: (res) => {
          // Swal.fire({
          //   icon: 'success',
          //   title: 'Update number succsessfully',
          //   customClass: 'swal-model',
          // });
          this.alertService.showToast('success', 'Number Updated')
          this.settingsDrawer.close();
          this.entityService.raiserefreshChangeEmailNumberCall(true)
          this.mobileVerifyFlag = false;
          this.emailVerifyFlag = false;

        }, error: (err) => {
          this.alertService.showToast('error', err)
        }
      })
    }


  }

  sendMessage(): void {
    if (this.data?.flag == 'email') {
      this.agentService.emailVerificationOTP({ email: this.emailForm.get('email')?.value, id: this.userDetail?.id, for: "Agent" }).subscribe({
        next: (res) => {
          // Swal.fire({
          //     icon: 'info',
          //     html: `A message with OTP has been sent to email address <b>${this.emailForm.get('email')?.value}<b>`,
          //     customClass: 'swal-model',
          // });
          //this.settingsDrawer.close(true);
        }, error: (err) => {
          this.alertService.showToast('error', err)
        }
      })
    }
    else if (this.data?.flag == 'verify-email') {
      this.agentService.emailVerificationOTP({ email: this.emailForm.get('email')?.value, id: this.userDetail?.id, for: "Agent" }).subscribe({
        next: (res) => {
          // Swal.fire({
          //     icon: 'info',
          //     html: `A message with OTP has been sent to email address <b>${this.emailForm.get('email')?.value}<b>`,
          //     customClass: 'swal-model',
          // });
          //this.settingsDrawer.close(true);
        }, error: (err) => {
          this.alertService.showToast('error', err)
        }
      })
    }
    else if (this.data?.flag == 'verify-mobile') {
      this.agentService.mobileVerificationOTP({ mobile_code: this.contactForm.get('mobile_code')?.value, mobile_number: this.contactForm.get('mobile_number')?.value, id: this.userDetail?.id, for: "Agent" }).subscribe({
        next: (res) => {
          // Swal.fire({
          //     icon: 'info',
          //     html: `A message with OTP has been sent to email address <b>${this.emailForm.get('email')?.value}<b>`,
          //     customClass: 'swal-model',
          // });
          //this.settingsDrawer.close(true);
        }, error: (err) => {
          this.alertService.showToast('error', err)
        }
      })
    }
    else {
      this.agentService.mobileVerificationOTP({ mobile_code: this.contactForm.get('mobile_code')?.value, mobile_number: this.contactForm.get('mobile_number')?.value, id: this.userDetail?.id, for: "Agent" }).subscribe({
        next: (res) => {
          // Swal.fire({
          //     icon: 'info',
          //     html: `A message with OTP has been sent to number <b>${this.contactForm.get('mobile_code')?.value} ${this.contactForm.get('mobile_number')?.value}</b>`,
          //     customClass: 'swal-model',
          // });
          //this.settingsDrawer.close(true);
        }, error: (err) => {
          this.alertService.showToast('error', err)
        }
      })
    }
  }


}
