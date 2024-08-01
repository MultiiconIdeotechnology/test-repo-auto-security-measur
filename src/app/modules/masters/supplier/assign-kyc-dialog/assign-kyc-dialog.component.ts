import { Component, Inject } from '@angular/core';
import { AsyncPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { KycService } from 'app/services/kyc.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ToasterService } from 'app/services/toaster.service';

@Component({
  selector: 'app-assign-kyc-dialog',
  templateUrl: './assign-kyc-dialog.component.html',
  styleUrls: ['./assign-kyc-dialog.component.scss'],
  standalone: true,
  imports: [
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
    MatSnackBarModule,
    NgxMatSelectSearchModule,
  ]
})
export class AssignKycDialogComponent {

  record: any = {};
  formGroup: FormGroup;
  profileList: any[] = [];
  AllprofileList: any[] = [];

  constructor(
    public matDialogRef: MatDialogRef<AssignKycDialogComponent>,
    private builder: FormBuilder,
    private alertService: ToasterService,
    private kycService: KycService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    if (data) {
      this.record = data
    }
  }


  ngOnInit(): void {

    this, this.kycService.getkycprofileCombo("employee").subscribe(data => {
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
    if(!this.formGroup.valid){
      this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.formGroup.markAllAsTouched();
      return;
}

    this.matDialogRef.close(this.formGroup.value);
  }

}
