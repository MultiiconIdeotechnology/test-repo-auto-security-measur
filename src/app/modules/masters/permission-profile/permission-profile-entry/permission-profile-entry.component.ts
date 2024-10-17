import { Component, Inject } from '@angular/core';
import { NgIf, NgClass, DatePipe, AsyncPipe, NgFor } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ToasterService } from 'app/services/toaster.service';
import { PermissionProfileService } from 'app/services/permission-profile.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Linq } from 'app/utils/linq';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-permission-profile-entry',
  templateUrl: './permission-profile-entry.component.html',
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
    MatSlideToggleModule,
    NgxMatSelectSearchModule,
    MatTooltipModule
  ]
})
export class PermissionProfileEntryComponent {
  disableBtn: boolean = false
  readonly: boolean = false;
  record: any = {};
  fieldList: {};


  login_areas: any[] = [
    {value: 'Employee', viewValue: 'Employee'},
    {value: 'Agent', viewValue: 'Agent'},
    {value: 'Sub Agent', viewValue: 'Sub Agent'},
    {value: 'Supplier', viewValue: 'Supplier'},
  ];

  constructor(
    public matDialogRef: MatDialogRef<PermissionProfileEntryComponent>,
    private builder: FormBuilder,
    private permissionProfileService: PermissionProfileService,
    private alertService: ToasterService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) { 
    this.record = data?.data ?? {}
  }

  formGroup: FormGroup;
  title = "Create Permission Profile"
  btnLabel = "Create"

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      profile_name: [''],
      is_default: [false],
      applied_on: [''],
      applied_on_list: [''],
      login_area: [''],
      login_areas:[''],
    });

  //   this.formGroup.get('profile_name').valueChanges.subscribe(text => {
  //     this.formGroup.get('profile_name').patchValue(Linq.convertToTitleCase(text), { emitEvent: false });
  //  }) 

   if(this.record.id){
    this.permissionProfileService.getPermissionProfileRecord(this.record.id).subscribe({
      next:(data)=> {
        this.readonly = this.data.readonly;
        if(this.readonly) {
          this.formGroup.get('is_default').disable();

          this.fieldList = [
            { name: 'Profile Name', value: data.profile_name},
            { name: 'Login Area', value: data.login_area },
            { name: 'Is Default', value: data.is_default? 'Yes':'No' },
          ]
        }
        this.formGroup.patchValue(this.record)
        this.title = this.readonly ? ("Permission Profile - " + this.record.profile_name) : 'Modify Permission Profile';
        this.btnLabel = this.readonly ? "Close" : 'Save';
      },
      error: (err) => {this.alertService.showToast('error',err,'top-right',true);
                this.disableBtn = false;
            },
    });
    }
  }

  submit(): void {
    this.disableBtn = true;
    const json = this.formGroup.getRawValue();
    this.permissionProfileService.create(json).subscribe({
      next: () => {
       this.matDialogRef.close(true);
       this.disableBtn = false;
      }, error: (err) => {
        this.disableBtn = false;
        this.alertService.showToast('error', err, "top-right", true);
      }
    })
  }
}
