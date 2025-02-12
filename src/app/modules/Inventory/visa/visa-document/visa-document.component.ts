import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToasterService } from 'app/services/toaster.service';
import { VisaService } from 'app/services/visa.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';

@Component({
  selector: 'app-visa-document',
  templateUrl: './visa-document.component.html',
  styleUrls: ['./visa-document.component.scss'],
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
    MatDatepickerModule,
    MatSlideToggleModule,
    MatTooltipModule,
    NgxMatTimepickerModule,
    NgxMatSelectSearchModule,
  ],
})
export class VisaDocumentComponent {
  record: any = {};
  document_types: any[] = [
    { value: 'Passport Size Photo', viewValue: 'Passport Size Photo' },
    { value: 'Passport Front Page', viewValue: 'Passport Front Page' },
    { value: 'Passport Last Page', viewValue: 'Passport Last Page' },
    { value: 'Pan Card', viewValue: 'Pan Card' },
    { value: 'Onward Ticket', viewValue: 'Onward Ticket' },
    { value: 'Return Ticket', viewValue: 'Return Ticket' },
    { value: 'Hotel Voucher', viewValue: 'Hotel Voucher' },
    { value: 'Bank Statement', viewValue: 'Bank Statement' },
    { value: 'Income Tax Return (ITR)', viewValue: 'Income Tax Return (ITR)' },
    { value: 'Birth Certificate', viewValue: 'Birth Certificate' },
    { value: 'US / UK / Schengen Visa', viewValue: 'US / UK / Schengen Visa' },
    { value: 'Travel Insurance', viewValue: 'Travel Insurance' },
    { value: 'Covid Vaccination Certificate', viewValue: 'Covid Vaccination Certificate' },
    



  ];
  recordList: any;
  constructor(
    public matDialogRef: MatDialogRef<VisaDocumentComponent>,
    private builder: FormBuilder,
    private visaService: VisaService,
    public alertService: ToasterService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data?.data ?? {};
  }


  formGroup: FormGroup;

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      document_type: [''],
      is_required: [false],
    });

    this.visaService.getVisaDocumentsList(this.record.id).subscribe({
      next: (res) => {
        this.recordList = res
      }, error: err => this.alertService.showToast('error', err)
    })

  }


  add(): void {
    const json = this.formGroup.getRawValue();
    json['visa_master_id'] = this.record.id

    this.visaService.createDocument(json).subscribe({
      next: (res) => {
        if (json.id) {
          const record = this.recordList.find(x => x.id == res.id);
          Object.assign(record, json);

        } else {
          json.id = res.id;
          this.recordList.push(json);
        }
        document.getElementById('focus').focus();
        this.formGroup.get('document_type').patchValue('');
        this.formGroup.get('id').patchValue('');

      }, error: err => this.alertService.showToast('error', err)
    })
    this.formGroup.get('document_type').patchValue('');
    this.formGroup.get('id').patchValue('');

  }

  edit(data): void {
    this.formGroup.patchValue(data);
  }

  delete(data): void {
    this.visaService.documentsDelete(data.id).subscribe({
      next: () => {
        const index = this.recordList.indexOf(this.recordList.find(x => x.id == data.id))
        this.recordList.splice(index, 1);
        if (!this.recordList.some(x => x.id === this.formGroup.get('id').value) && this.formGroup.get('id').value)
          this.formGroup.reset();
      }
      , error: err => this.alertService.showToast('error', err)
    })
  }
}
