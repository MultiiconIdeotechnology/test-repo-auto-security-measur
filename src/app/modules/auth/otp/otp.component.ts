import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from 'app/core/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToasterService } from 'app/services/toaster.service';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  standalone: true,
  imports: [MatDividerModule, MatFormFieldModule, ReactiveFormsModule, MatInputModule]
})
export class OtpComponent implements OnInit {
  contactForm: FormGroup;
  userOTP: any;
  otpDigits: string[] = ['', '', '', '', '', ''];

  @ViewChild('otpInput0') otpInput0: ElementRef;
  @ViewChild('otpInput1') otpInput1: ElementRef;
  @ViewChild('otpInput2') otpInput2: ElementRef;
  @ViewChild('otpInput3') otpInput3: ElementRef;
  @ViewChild('otpInput4') otpInput4: ElementRef;
  @ViewChild('otpInput5') otpInput5: ElementRef;

  constructor(
    private matDialogRef: MatDialogRef<OtpComponent>,
    private _builder: FormBuilder,
    private _authService: AuthService,
    private _activatedRoute: ActivatedRoute,
    private alertService: ToasterService,
    private _router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void {
    this.contactForm = this._builder.group({
      otpDigit0: new FormControl('', Validators.maxLength(1)),
      otpDigit1: new FormControl('', Validators.maxLength(1)),
      otpDigit2: new FormControl('', Validators.maxLength(1)),
      otpDigit3: new FormControl('', Validators.maxLength(1)),
      otpDigit4: new FormControl('', Validators.maxLength(1)),
      otpDigit5: new FormControl('', Validators.maxLength(1)),
    });
  }

  verifyOTP(): void {

    this._authService.Login(this.userOTP, this.data, false).subscribe({
      next: res => {
        this.matDialogRef.close();
        const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';
        // Navigate to the redirect url
        this._router.navigateByUrl(redirectURL);
      }, error: err => {
        this.alertService.showToast('error', err)
      }
    })
  }

  onOtpInput(event: any, index: number): void {
    const inputElement = event.target;
    const inputValue = inputElement.value;
    const inputLength = inputValue.length;

    if (inputLength === 1 && index < 5) {
      this.setFocusOnInput(index + 1);
    } else if (inputLength === 0 && index > 0) {
      this.setFocusOnInput(index - 1);
    } else if (inputLength > 1) {
      inputElement.value = inputValue.charAt(inputLength - 1);
    }

    this.otpDigits[index] = inputElement.value;

    if (inputLength === 1 && index === 5) {
      this.userOTP = this.otpDigits.join('');
      this.verifyOTP();
    }
  }

  setFocusOnInput(index: number): void {
    const inputElement = this[`otpInput${index}`]?.nativeElement;
    if (inputElement) {
      inputElement.focus();
    }
  }

  onOtpPaste(event: ClipboardEvent): void {
    event.preventDefault();

    const clipboardData = event.clipboardData || window['clipboardData'];
    const pastedText = clipboardData.getData('text');
    const digits = pastedText.match(/\d/g);

    if (digits && digits.length === 6) {
      for (let i = 0; i < 6; i++) {
        this.otpDigits[i] = digits[i];
      }
      this.userOTP = this.otpDigits.join('');
      this.verifyOTP();
    }
  }

  clearOtpInputs(): void {
    for (let i = 0; i < 6; i++) {
      const inputElement = this[`otpInput${i}`]?.nativeElement;
      if (inputElement) {
        inputElement.value = '';
      }
      this.otpDigits[i] = '';
    }
    this.userOTP = '';
  }

}
