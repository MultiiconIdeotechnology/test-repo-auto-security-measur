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
import { StepOneComponent } from './step-one/step-one.component';
import { StepTwoComponent } from './step-two/step-two.component';
import { StepThreeComponent } from './step-three/step-three.component';

@Component({
    selector: 'app-set-up-two-factor-auth',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink, FuseAlertComponent, NgIf, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCheckboxModule, MatProgressSpinnerModule,
        StepOneComponent,
        StepTwoComponent,
        StepThreeComponent
    ],
    templateUrl: './set-up-two-factor-auth.component.html',
    styleUrls: ['./set-up-two-factor-auth.component.scss']
})
export class SetUpTwoFactorAuthComponent {
    stepKey = 'setUp'

    stepArr: any[] = [
        { step: 1, key: 'setUp', label: 'SETUP', isActive: false, isCompleted: true },
        { step: 2, key: 'connectMobile', label: 'CONNECT MOBILE', isActive: true, isCompleted: false },
        { step: 3, key: 'savesCode', label: 'SAVES CODES', isActive: false, isCompleted: false },
    ]

    constructor(
        public matDialogRef: MatDialogRef<SetUpTwoFactorAuthComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any = {},
    ) { }

    ngOnInit(): void {

    }

}