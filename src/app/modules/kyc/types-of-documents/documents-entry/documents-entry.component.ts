import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgClass, DatePipe, AsyncPipe, NgFor } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { DocumentService } from 'app/services/document.service';
import { EmployeeService } from 'app/services/employee.service';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Linq } from 'app/utils/linq';
import { ToasterService } from 'app/services/toaster.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-documents-entry',
  templateUrl: './documents-entry.component.html',
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
    MatSlideToggleModule,
    MatTooltipModule
  ],
})
export class DocumentsEntryComponent {

  disableBtn: boolean = false
  readonly: boolean = false;
  record: any = {};
  fieldList: {};

  constructor(
    public matDialogRef: MatDialogRef<DocumentsEntryComponent>,
    private builder: FormBuilder,
    private documentsService: DocumentService,
    private toasterService: ToasterService,
    private employeeService: EmployeeService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data?.data ?? {}
  }

  formGroup: FormGroup;
  title = "Add New"
  btnLabel = "Create"

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      document_name: [''],
      document_group: [''],
      maximum_size: [''],
      file_extentions: [''],
      remark_caption: [''],
      is_remark_required: [false]
    });
    this.formGroup.get('document_group').patchValue('Address Proof')

    //   this.formGroup.get('document_name').valueChanges.subscribe(text => {
    //     this.formGroup.get('document_name').patchValue(Linq.convertToTitleCase(text), { emitEvent: false });
    //  }) 

    if (this.record.id) {
      this.formGroup.patchValue(this.record)
      this.readonly = this.data.readonly;
      if (this.readonly) {
        this.fieldList = [
          { name: "Document Name", value: this.record.document_name },
          { name: "Document Group", value: this.record.document_group },
          { name: "Maximun Size", value: this.record.maximum_size },
          { name: "File Extention", value: this.record.file_extentions },
          { name: "Remark Required", value: this.record.is_remark_required ? 'Yes' : 'No' },
          { name: "Remark Caption", value: this.record.remark_caption },
        ]
      }

      this.title = this.readonly ? ("Document - " + this.record.document_name) : 'Modify Document';
      this.btnLabel = this.readonly ? "Close" : 'Save';
    }
  }

  submit(): void {
    if (!this.formGroup.valid) {
      this.toasterService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.formGroup.markAllAsTouched();
      return;
    }

    this.disableBtn = true;
    const json = this.formGroup.getRawValue();
    json.remark_caption = json.is_remark_required ? json.remark_caption : ''
    this.documentsService.create(json).subscribe({
      next: () => {
        this.matDialogRef.close(true);
        this.disableBtn = false;
      }, error: (err) => {
        this.toasterService.showToast('error', err)
        this.disableBtn = false;
      }
    })
  }

}


