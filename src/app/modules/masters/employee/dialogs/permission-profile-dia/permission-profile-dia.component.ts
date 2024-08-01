import { FormBuilder, FormGroup } from '@angular/forms';
import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { PermissionProfileService } from 'app/services/permission-profile.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ToasterService } from 'app/services/toaster.service';

@Component({
  selector: 'app-permission-profile-dia',
  templateUrl: './permission-profile-dia.component.html',
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
export class PermissionProfileDiaComponent {

  record: any = {};
  formGroup: FormGroup;
  profileList: any[] = [];
  AllprofileList: any[] = [];

  constructor(
    public matDialogRef: MatDialogRef<PermissionProfileDiaComponent>,
    private builder: FormBuilder,
    private alertService: ToasterService,
    private permissionProfileService: PermissionProfileService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    if (data) {
      this.record = data
    }
  }


  ngOnInit(): void {

    this, this.permissionProfileService.getPermissionProfileCombo("employee").subscribe(data => {
      this.profileList = data;
      this.AllprofileList = data;
    })

    this.formGroup = this.builder.group({
      id: [''],
      permission_profile_id: [''],
      permission_profile_name: [''],
      permissionfilter: ['']
    });

    this.formGroup.patchValue(this.record)

    this.formGroup.get('permissionfilter').valueChanges
      .subscribe(data => {
        this.profileList = this.AllprofileList.filter(x => x.profile_name.toLowerCase().includes(data.toLowerCase()));
      });
  }

  submit(): void {
    if (!this.formGroup.valid) {
      this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.formGroup.markAllAsTouched();
      return;
    }
    this.matDialogRef.close(this.formGroup.value);
  }
}
