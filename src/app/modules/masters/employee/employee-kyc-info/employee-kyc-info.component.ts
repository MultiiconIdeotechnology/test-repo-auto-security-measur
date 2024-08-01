import { Subject } from 'rxjs';
import { Linq } from 'app/utils/linq';
import { CommonUtils, DocValidationDTO } from 'app/utils/commonutils';
import { AsyncPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RejectReasonComponent } from '../../agent/reject-reason/reject-reason.component';
import { KycDocumentService } from 'app/services/kyc-document.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ToasterService } from 'app/services/toaster.service';
import {
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogRef,
} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { imgExtantions } from 'app/common/const';

@Component({
    selector: 'app-employee-kyc-info',
    templateUrl: './employee-kyc-info.component.html',
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
        MatDividerModule,
        MatMenuModule,
        MatTooltipModule,
        NgxMatSelectSearchModule,
    ],
})
export class EmployeeKycInfoComponent {
    public formGroup: FormGroup;
    user: any = {};
    _unSubscribeAll: Subject<any> = new Subject();
    public statusType: string;
    public docs: any = {};

    isLoading = false;
    dataList = [];
    searchInputControl: any;
    datadocs = [];
    docsDetail = [];

    constructor(
        public matDialogRef: MatDialogRef<EmployeeKycInfoComponent>,
        private matDialog: MatDialog,
        private alertService: ToasterService,
        private kycdocService: KycDocumentService,
        private conformationService: FuseConfirmationService,
        @Inject(MAT_DIALOG_DATA) public data: any = {}
    ) { }

    ngOnInit(): void {
        this.refreshItems();
    }

    hasRequiredField(group: any[]): boolean {
        return group.some((dataRecord) => dataRecord.is_required_group);
    }

    refreshItems(): void {
        this.kycdocService
            .getKYCDisplay(this.data.kyc_profile_id)
            .subscribe((data) => {
                this.dataList = data;
                this.kycdocService
                    .getemployeedocumentRecord(this.data.id)
                    .subscribe((res) => {
                        if (res) {
                            this.docs = res.doc_details;
                            for (let datadocs of this.dataList) {
                                const docRec = this.docs.find(
                                    (x) => x.kyc_profile_doc_id === datadocs.id
                                );
                                if (docRec) {
                                    datadocs.document_of_id = docRec.id;
                                    datadocs.kyc_profile_name =
                                        docRec.kyc_profile_name;
                                    datadocs.file_url = docRec.file_url;
                                    datadocs.kyc_profile_doc_name =
                                        docRec.kyc_profile_doc_name;
                                    datadocs.remarks = docRec.remarks;
                                    datadocs.is_rejected = docRec.is_rejected;
                                    datadocs.is_audited = docRec.is_audited;
                                    datadocs.rejection_note =
                                        docRec.rejection_note;
                                    datadocs.reject_date_time =
                                        docRec.reject_date_time;
                                    datadocs.entry_date_time =
                                        docRec.entry_date_time;
                                }
                            }
                        }
                        this.dataList = Linq.groupBy(
                            this.dataList,
                            (x: any) => x.document_group
                        );
                    });
            });
    }

    getColor(dataRecord): string {
        if (dataRecord.is_audited) return 'border-l-green-500';
        else if (
            !dataRecord.is_rejected &&
            !dataRecord.is_audited &&
            dataRecord.file_url
        )
            return 'border-l-blue-500';
        else if (dataRecord.is_rejected) return 'border-l-red-500';
        else return 'border-l-gray-500';
    }

    uploadDocument(document, event: any): void {
        const file = (event.target as HTMLInputElement).files[0];

        const extantion: string[] = document.file_extentions.replaceAll('.', '').split(',').map(x => x.trim());


        var validator: DocValidationDTO = CommonUtils.isDocValid(file, extantion, document.maximum_size, null);
        if (!validator.valid) {
            this.alertService.showToast('error', validator.alertMessage);
            (event.target as HTMLInputElement).value = '';
            return;
        }

        // if (file) {
        //     if (document.maximum_size * 1000 >= file.size ) {
        //         const allowedExtensions = document.file_extentions;
        //         const fileExtension =
        //             file.name.split('.').pop()?.toLowerCase() || '';

        //         if (!allowedExtensions.includes(fileExtension)) {
        //             this.alertService.showToast(
        //                 'error',
        //                 'Please be advised that only files in the formats of JPG, JPEG, PNG, SVG, and GIF are compatible',
        //                 'top-right',
        //                 true
        //             );
        //             (event.target as HTMLInputElement).value = '';
        //             return;
        //         } 
        //     } else {
        //         this.alertService.showToast(
        //             'error',
        //             'The system currently restricts the upload of photos exceeding '+ document.maximum_size + ' KB in size. Please ensure that your file adheres to this limit for successful submission',
        //             'top-right',
        //             true
        //         );
        //         (event.target as HTMLInputElement).value = '';
        //         return;

        //     }
        // }

        CommonUtils.getJsonFile(file, (reader, jFile) => {
            const doc = Object.assign({});
            doc.kyc_profile_id = document.kyc_profile_id;
            doc.document_of_id = this.data.id;
            doc.document_of = 'Employee';
            doc.doc_details = [
                {
                    id: document.document_of_id,
                    kyc_profile_doc_id: document.id,
                    file: jFile,
                },
            ];
            this.kycdocService.create(doc).subscribe({
                next: (data) => {
                    this.alertService.showToast(
                        'success',
                        'Document Uploaded',
                        'top-right',
                        true
                    );
                    this.refreshItems();
                },
                error: (err) => {
                    this.alertService.showToast(
                        'error',
                        err,
                        'top-right',
                        true
                    );
                    this.isLoading = false
                },
            });
        }
        );
    }

    Audit(data: any): void {
        const label: string = 'Audit Kyc Document';
        this.conformationService
            .open({
                title: label,
                message:
                    'Are you sure to ' +
                    label.toLowerCase() +
                    ' ' +
                    data.document_name +
                    ' ?',
            })
            .afterClosed()
            .subscribe({
                next: (res) => {
                    if (res === 'confirmed') {
                        this.kycdocService
                            .verify(data.document_of_id)
                            .subscribe({
                                next: () => {
                                    this.alertService.showToast(
                                        'success',
                                        'Document Audited',
                                        'top-right',
                                        true
                                    );
                                    this.refreshItems();
                                },
                                error: (err) =>
                                    this.alertService.showToast(
                                        'error',
                                        err,
                                        'top-right',
                                        true
                                    ),
                            });
                    }
                },
            });
    }

    Reject(record: any): void {
        this.matDialog
            .open(RejectReasonComponent, {
                disableClose: true,
                data: record,
                panelClass: 'full-dialog',
            })
            .afterClosed()
            .subscribe({
                next: (res) => {
                    if (res) {
                        this.kycdocService
                            .reject(record.document_of_id, res)
                            .subscribe({
                                next: () => {
                                    this.alertService.showToast(
                                        'success',
                                        'Document Rejected',
                                        'top-right',
                                        true
                                    );
                                    this.refreshItems();
                                },
                                error: (err) =>
                                    this.alertService.showToast(
                                        'error',
                                        err,
                                        'top-right',
                                        true
                                    ),
                            });
                    }
                },
            });
    }

    getNodataText(): string {
        if (this.isLoading) return 'Loading...';
        else return 'No data to display';
    }
}
