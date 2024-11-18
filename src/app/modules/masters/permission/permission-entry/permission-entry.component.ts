import { Component, Inject } from '@angular/core';
import { NgIf, NgClass, DatePipe, AsyncPipe, NgFor } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PermissionService } from 'app/services/permission.service';
import { ToasterService } from 'app/services/toaster.service';
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
  selector: 'app-permission-entry',
  templateUrl: './permission-entry.component.html',
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
export class PermissionEntryComponent {
  disableBtn: boolean = false
  readonly: boolean = false;
  record: any = {};
  fieldList: {};

  login_areas: any[] = [
    {value: 'Employee', viewValue: 'Employee'},
    {value: 'Supplier', viewValue: 'Supplier'},
    {value: 'Client', viewValue: 'Client'},
  ];

  constructor(
    public matDialogRef: MatDialogRef<PermissionEntryComponent>,
    private builder: FormBuilder,
    private permissionService: PermissionService,
    private alertService: ToasterService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) { 
    this.record = data?.data ?? {}
  }

  formGroup: FormGroup;
  title = "Create Permission"
  btnLabel = "Create"

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      module_name: [''],
      operation_type: [''],
      description: [''],
      group_name: [''],
      category_name: [''],
      login_area: [''],
      login_areas:[''],
    });

  //   this.formGroup.get('module_name').valueChanges.subscribe(text => {
  //     this.formGroup.get('module_name').patchValue(Linq.convertToTitleCase(text), { emitEvent: false });
  //  }) 

  //  this.formGroup.get('group_name').valueChanges.subscribe(text => {
  //   this.formGroup.get('group_name').patchValue(Linq.convertToTitleCase(text), { emitEvent: false });
  //  }) 

  //  this.formGroup.get('category_name').valueChanges.subscribe(text => {
  //   this.formGroup.get('category_name').patchValue(Linq.convertToTitleCase(text), { emitEvent: false });
  //  }) 

    if(this.record.id) {
      this.permissionService.getPermissionRecord(this.record.id).subscribe({
        next:(data)=> {
          this.readonly = this.data.readonly;
          if(this.readonly) {

            this.fieldList = [
              { name: 'Module', value: data.module_name},
              { name: 'Operation Type', value: data.operation_type },
              { name: 'Description', value: data.description },
              { name: 'Group Name', value: data.group_name },
              { name: 'Category Name', value: data.category_name },
              { name: 'Login Area', value: data.login_area },
              { name: 'Is Default', value: data.is_default? 'Yes':'No' },
            ]
          }
          this.formGroup.patchValue(this.record)
  
          this.title = this.readonly ? ("Permission - " + this.record.module_name) : 'Modify Permission';
          this.btnLabel = this.readonly ? "Close" : 'Save';
        },
        error: (err) => {this.alertService.showToast('error',err,'top-right',true);
                this.disableBtn = false;
            },
      });
    }
    
  }

  submit(): void {
    if(!this.formGroup.valid){
      this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.formGroup.markAllAsTouched();
      return;
}

    this.disableBtn = true;
    const json = this.formGroup.getRawValue();
    this.permissionService.create(json).subscribe({
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
