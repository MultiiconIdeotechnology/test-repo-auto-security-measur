import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RejectReasonComponent } from 'app/modules/masters/agent/reject-reason/reject-reason.component';
import { ToasterService } from 'app/services/toaster.service';
import { VisaService } from 'app/services/visa.service';
import { DocValidationDTO, CommonUtils } from 'app/utils/commonutils';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { RejectVisaPaxDialogComponent } from '../reject-visapax-dialog/reject-visapax-dialog.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';

@Component({
  selector: 'app-document-kyc',
  templateUrl: './document-kyc.component.html',
  styleUrls: ['./document-kyc.component.scss'],
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
    MatSnackBarModule,
    MatDividerModule,
    MatMenuModule,
    MatTooltipModule
  ]
})
export class DocumentKycComponent {

  docs: any = {};
  isLoading = false;
  isApiCall = false;
  documentId: any;
  rejectReason: any;
  dataLocal: any;


  constructor(
    public matDialogRef: MatDialogRef<DocumentKycComponent>,
    private alertService: ToasterService,
    private visaService: VisaService,
    private matDialog: MatDialog,
    private conformationService: FuseConfirmationService,
    @Inject(MAT_DIALOG_DATA) public datas: any = {},
  ) {
    this.docs = datas?.docs;
  }

  getColor(doc): string {
    if (doc.is_document_audited)
      return 'border-l-green-500';
    else if (!doc.is_document_rejected && !doc.is_document_audited && doc.file_url)
      return 'border-l-blue-500';
    else if (doc.is_document_rejected)
      return 'border-l-red-500';
    else
      return 'border-l-gray-500'
  }

  uploadDocument(document, event: any): void {
    const file = (event.target as HTMLInputElement).files[0];
    const extantion: string[] = ['pdf', 'jpg', 'jpeg', 'png'];
    var validator: DocValidationDTO = CommonUtils.isDocValid(file, extantion, null, 5);
    if (!validator.valid) {
      this.alertService.showToast('error', validator.alertMessage, 'top-right', true);
      (event.target as HTMLInputElement).value = '';
      return;
    }

    CommonUtils.getJsonFile(file, (reader, jFile) => {
      const doc = {
        id: document.id,
        file: jFile,
      }
      this.visaService.uploadDoc(doc).subscribe({
        next: (data: any) => {
          this.alertService.showToast('success', "Document Uploaded", "top-right", true);
          if (data) {
            document.file_url = data?.file_url
          }
        },
        error: (err) => this.isLoading = false
      });
    });
  }

  Audit(data: any): void {
    if (this.datas.status == 'Payment Confirmed') {
      return this.alertService.showToast('error', "Please ensure to start process before taking any action.");;
    }

    const label: string = 'Audit Kyc Document'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ' + data.document_type + ' ?'
    }).afterClosed().subscribe({
      next: (res) => {
        if (res === 'confirmed') {
          this.visaService.audit(data.id).subscribe({
            next: (res: any) => {
              if (res.status) {
                data.is_document_audited = true
                data.is_document_rejected = false
                this.alertService.showToast('success', "Document Audited", "top-right", true);
              }
            }, error: (err) => this.alertService.showToast('error', err, "top-right", true)
          });
        }
      }, error: (err) => this.alertService.showToast('error', err, "top-right", true)
    })
  }

  Reject(doc) {
    if (this.datas.status == 'Payment Confirmed') {
      return this.alertService.showToast('error', "Please ensure to start process before taking any action.");;
    }

    this.matDialog.open(RejectVisaPaxDialogComponent, {
      data: { data: this.datas },
      disableClose: true,
    })
      .afterClosed().subscribe({
        next: (res) => {
          if (res) {
            this.rejectReason = res?.reject_reason;
            const json = {
              id: doc.id,
              reject_reason: res?.reject_reason
            }

            this.visaService.rejectVisaPaxDocument(json).subscribe({
              next: (res: any) => {
                if (res) {
                  if (res.status) {
                    if(!this.isApiCall)
                    this.isApiCall = !this.docs.some(x => x.is_document_rejected);
                    doc.is_document_rejected = true
                    doc.is_document_audited = false
                    doc.reject_reason = this.rejectReason
                    this.alertService.showToast('success', 'Document Reject Successfully!');
                  }
                }
              }, error: err => {
                this.alertService.showToast('error', err);
              }
            })
          }
        }
      });
  }

  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else return 'No data to display';
  }

}
