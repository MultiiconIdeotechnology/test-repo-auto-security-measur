import { AsyncPipe, CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToasterService } from 'app/services/toaster.service';
import { VisaService } from 'app/services/visa.service';
import { CommonUtils, DocValidationDTO } from 'app/utils/commonutils';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Subject } from 'rxjs';
import { RejectVisaPaxDialogComponent } from '../reject-visapax-dialog/reject-visapax-dialog.component';

@Component({
    selector: 'app-document-details',
    styleUrls: ['./document-details.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
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
    ],
    templateUrl: './document-details.component.html'
})
export class DocumentDetailsComponent {

    public formGroup: FormGroup;
    user: any = {};
    _unSubscribeAll: Subject<any> = new Subject();
    public statusType: string;
    // docs: any[] = [];
    docs: any = {};

    isLoading = false;
    dataList = [];
    datadocs = [];
    docsDetail = [];
    data: any;
    documentId: any;
    rejectReason: any;

    constructor(
        public matDialogRef: MatDialogRef<DocumentDetailsComponent>,
        private alertService: ToasterService,
        private visaService: VisaService,
        private matDialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public datas: any = {},
    ) {
        this.docs = datas?.docs;
    }

    ngOnInit(): void {
    }

    getColor(dataRecord): string {
        if (dataRecord.is_audited)
            return 'border-l-green-500';
        else if (!dataRecord.is_rejected && !dataRecord.is_audited && dataRecord.file_url)
            return 'border-l-blue-500';
        else if (dataRecord.is_rejected)
            return 'border-l-red-500';
        else
            return 'border-l-gray-500'
    }

    uploadDocument(document, event: any): void {
        const file = (event.target as HTMLInputElement).files[0];
        const extantion: string[] = ['pdf', 'jpg', 'jpeg', 'png'];
        var validator: DocValidationDTO = CommonUtils.isDocValid(file, extantion, null, 2);
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
            document.file_url = reader.result
            this.visaService.uploadDoc(doc).subscribe({
                next: (data) => {
                    this.alertService.showToast('success', "Document Uploaded", "top-right", true);
                },
                error: (err) => this.isLoading = false
            });
        });
    }

    getNodataText(): string {
        if (this.isLoading)
            return 'Loading...';
        else return 'No data to display';
    }

    rejectAction(id: any) {
        this.documentId = id;
        this.matDialog.open(RejectVisaPaxDialogComponent, {
            data: { data: this.datas },
            disableClose: true,
        })
        .afterClosed().subscribe({
            next: (res) => {
                if (res) {
                    this.rejectReason = res?.reject_reason;
                    const json = {
                        id: this.documentId.id,
                        reject_reason: res?.reject_reason
                    }
                    
                    this.visaService.rejectVisaPaxDocument(json).subscribe({
                        next: res => {
                            if (res) {
                                this.setDocs();
                                this.alertService.showToast('success', 'Document Reject Successfully!');
                            }
                        }, error: err => {
                            this.alertService.showToast('error', err);
                        }
                    })
                }
            }
        });
    }

    setDocs(): void {
        const filteredDocument = this.docs.filter(item => item.id === this.documentId);
        if (filteredDocument && filteredDocument.length > 0) {
            const filteredObject = filteredDocument[0];
            filteredObject.is_document_rejected = true;
            filteredObject.reject_reason = this.rejectReason;
        }
    }
}
