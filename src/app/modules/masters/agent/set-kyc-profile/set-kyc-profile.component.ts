import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { KycService } from 'app/services/kyc.service';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
  selector: 'app-set-kyc-profile',
  templateUrl: './set-kyc-profile.component.html',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    AsyncPipe,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    NgxMatSelectSearchModule,
  ]
})
export class SetKycProfileComponent {
  record: any = {};
  formGroup: FormGroup;
  profileList: any[] = [];
  AllprofileList: any[] = [];

  constructor(
    public matDialogRef: MatDialogRef<SetKycProfileComponent>,
    private builder: FormBuilder,
    private kycService: KycService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    if (data) {
      this.record = data
    }
  }


  ngOnInit(): void {

    this, this.kycService.getkycprofileCombo("agent").subscribe(data => {
      this.profileList = data;
      this.AllprofileList = data;
    })

    this.formGroup = this.builder.group({
      id: [''],
      kyc_profile_id: [''],
      kyc_profile_name: [''],
      kycfilter: ['']
    });

    this.formGroup.patchValue(this.record)

    this.formGroup.get('kycfilter').valueChanges
      .subscribe(data => {
        this.profileList = this.AllprofileList.filter(x => x.profile_name.toLowerCase().includes(data.toLowerCase()));
      });
  }

  submit(): void {
    this.matDialogRef.close(this.formGroup.value);
  }
}
