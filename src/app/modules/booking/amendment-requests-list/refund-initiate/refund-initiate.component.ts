import { AsyncPipe, CommonModule, DatePipe, NgIf } from '@angular/common';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { imgExtantions } from 'app/common/const';
import { ToasterService } from 'app/services/toaster.service';
import { CommonUtils, DocValidationDTO } from 'app/utils/commonutils';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
  selector: 'app-refund-initiate',
  templateUrl: './refund-initiate.component.html',
  standalone: true,
  styles: [
    `
        .app-refund-initiate {

            @screen md {
                @apply w-128;
            }

            .mat-mdc-dialog-container {

                .mat-mdc-dialog-surface {
                    padding: 0 !important;
                }
            }
        }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    NgIf,
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
    MatDatepickerModule,
    MatTooltipModule,


  ]
})
export class RefundInitiateComponent implements OnInit {

  document: any;
  formGroup: FormGroup;
  maxDateValid = new Date();

  constructor(
    public matDialogRef: MatDialogRef<RefundInitiateComponent>,
    private builder: FormBuilder,
    private alertService: ToasterService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.document = this.data?.document;
  }
  ngOnInit() {
    this.formGroup = this.builder.group({
      value1: [''],
      date: ['']
    })
  }

  uploadDocument(event: any): void {
    const file = (event.target as HTMLInputElement).files[0];

    const extantion: string[] = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'pdf'];
    var validator: DocValidationDTO = CommonUtils.isDocValid(file, extantion, 3036, null);
    if (!validator.valid) {
      this.alertService.showToast('error', validator.alertMessage);
      (event.target as HTMLInputElement).value = '';
      return;
    }

    CommonUtils.getJsonFile(file, (reader, jFile) => {
      jFile["result"] = reader.result;
      this.document = jFile;

      this.alertService.showToast('success', "Document Uploaded", "top-right", true);
      (event.target as HTMLInputElement).value = '';
    });
  }

  download(data: any): void {
    if (data?.base64) {

      const newTab = window.open('', '_blank');
      if (newTab) {
        newTab.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Document Viewer</title>
                </head>
                <style>
                    html, body, iframe {
                        margin: 0;
                        padding: 0;
                        width: 100%;
                        height: 100%;
                        border: none;
                    }
                </style>
                <body>
                    <iframe src="${data?.result}"></iframe>
                </body>
            </html>
        `);
        newTab.document.close();
      } else {
        alert('Please allow popups for this website');
      }
    } else
      window.open(data, '_blank');
  }

  Confirm() {
    if (!this.document && this.data.document_title && this.data.required_document) {
      this.alertService.showToast('error', this.data.document_title + " is required")
      return;
    }

    if (this.data?.value1?.required && !this.formGroup.get('value1').value) {
      this.alertService.showToast('error', this.data.value1.label + " is required");
      return;
    }

    if (this.data.isDateRequired && !this.formGroup.get('date').value) {
      this.alertService.showToast('error', "Date is required");
      return;
    }

    if (this.data?.balance && ((this.data.balance.wallet_Balance + this.data.balance.wallet_Balance) < this.data.balance.purchase_Price)) {
      this.alertService.showToast('error', "Insufficient wallet balance");
      return;
    }

    this.matDialogRef.close({ status: true, document: this.document, date: this.formGroup.get('date').value, value1: this.formGroup.get('value1').value })
  }

}
