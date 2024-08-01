import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { KycService } from 'app/services/kyc.service';
import { LeadsService } from 'app/services/leads.service';
import { ToasterService } from 'app/services/toaster.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-assign-kyc',
  templateUrl: './assign-kyc.component.html',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    NgClass,
    MatButtonModule,
    MatIconModule,
    DatePipe,
    AsyncPipe,
    NgxMatSelectSearchModule,
    MatSnackBarModule
  ]
})
export class AssignKycComponent {

  record: any = {};
  formGroup: FormGroup;
  profileList: ReplaySubject<any[]> = new ReplaySubject<any[]>()
  agentProfileList: any[] = [];
  AllprofileList: any[] = [];



  constructor(
    public matDialogRef: MatDialogRef<AssignKycComponent>,
    private builder: FormBuilder,
    private leadsService: LeadsService,
    private alertService: ToasterService,
    private kycService: KycService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    if (data) {
      this.record = data
    }

  }

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      kycProfileId: [''],
      kycfilter: [''],
    });

    // if (this.record.markup_profile_name) {
    //   this.formGroup.get('profilefilter').patchValue(this.record.markup_profile_name);
    //   this.formGroup.get('KycProfileId').patchValue(this.record.markup_profile_id);
    // }

    this.kycService.getkycprofileCombo('agent').subscribe({
      next: (res) => {
        this.agentProfileList = res
        // this.agentProfileList = [
        //   { id: '', profile_for: 'Agent', profile_name: 'All' },
        //   ...res,
        // ];
        this.AllprofileList = [...this.agentProfileList];

        if (!this.record.kycProfileId)
          this.formGroup
            .get('kycProfileId')
            .patchValue(this.agentProfileList[0]);
      },
    })

    this.formGroup.get('kycfilter').valueChanges.subscribe((data) => {
      this.agentProfileList = this.AllprofileList.filter((x) =>
        x.profile_name.toLowerCase().includes(data.toLowerCase())
      );
    });


  }

  submit() {
    var newdata = this.formGroup.get('kycProfileId').value;
    const profile_id = newdata.id

    const Fdata = {}
    Fdata['id'] = this.record.data.id;
    Fdata['kycProfileId'] = profile_id

    this.leadsService.mapKycProfile(Fdata).subscribe({
      next: () => {
        this.alertService.showToast('success', "Profile kyc Assigned", "top-right", true);
        this.matDialogRef.close(true);
      }, error: (err) => {
        this.alertService.showToast('error', err, 'top-right', true);
      },


    })
  }


}
