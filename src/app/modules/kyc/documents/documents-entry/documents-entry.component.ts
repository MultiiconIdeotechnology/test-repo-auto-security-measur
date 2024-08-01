import { ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgClass, DatePipe, AsyncPipe, NgFor } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { KycDocumentService } from 'app/services/kyc-document.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { DateTime } from 'luxon';
import { ToasterService } from 'app/services/toaster.service';

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
        DatePipe,
        MatTooltipModule,
        NgxMatSelectSearchModule,
    ],
})
export class DocumentsEntryComponent {
    disableBtn: boolean = false;
    record: any = {};
    File: any = {};
    fieldList: {};

    constructor(
        public matDialogRef: MatDialogRef<DocumentsEntryComponent>,
        private kycDocumentService: KycDocumentService,
        private toasterService: ToasterService,
        @Inject(MAT_DIALOG_DATA) public data: any = {}
    ) {
        this.record = data?.data ?? {};
    }

    title = 'Document';
    btnLabel = 'Close';

    ngOnInit(): void {
        if (this.record.id) {
            this.kycDocumentService
                .getdocumentDetail(this.record.id)
                .subscribe({
                    next: (data) => {
                        this.record = data;
                    },
                    error: (err) => {
                        this.toasterService.showToast('error', err, 'top-right', true);
                        this.disableBtn = false;
                    },
                });
        }

    }

    downloadfile(str: string) {
        window.open(str, '_blank');
    }
}
