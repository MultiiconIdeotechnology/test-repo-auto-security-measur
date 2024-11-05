import { Component, Inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { FuseAlertComponent } from '@fuse/components/alert';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SetUpTwoFactorAuthComponent } from '../set-up-two-factor-auth.component';

@Component({
  selector: 'app-step-one',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink, FuseAlertComponent, NgIf, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCheckboxModule, MatProgressSpinnerModule
  ],
  templateUrl: './step-one.component.html',
  styleUrls: ['./step-one.component.scss']
})
export class StepOneComponent {
  twoFaFormGroup: FormGroup;

  constructor(
    private builder: FormBuilder,
    public matDialogRef: MatDialogRef<SetUpTwoFactorAuthComponent>,
  ) {

  }

  ngOnInit(): void {
    this.twoFaFormGroup = this.builder.group({
      enablePassword: ['', Validators.required],
    });
  }
}