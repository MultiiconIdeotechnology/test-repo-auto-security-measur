import { AsyncPipe, CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToasterService } from 'app/services/toaster.service';
import { CommonUtils, DocValidationDTO} from 'app/utils/commonutils';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
    selector: 'app-success-dialog',
    styleUrls: ['./success-document-dialog.component.scss'],
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
    templateUrl: './success-document-dialog.component.html'
})
export class SuccessDocumentDialogComponent {
    successDialogForm: FormGroup;
    docs: any[] = [];

    constructor(
        public matDialogRef: MatDialogRef<SuccessDocumentDialogComponent>,
        private fb: FormBuilder,
        private alertService: ToasterService,
        @Inject(MAT_DIALOG_DATA) public datas: any = {}
    ) {
        this.docs = datas.docs;
    }

    ngOnInit(): void {
        this.successDialogForm = this.fb.group({
            file: []
        });
    }

    uploadDocument(document): void {
        const file = (event.target as HTMLInputElement).files[0];
        const extantion: string[] = ['pdf', 'jpg', 'jpeg', 'png'];
        var validator: DocValidationDTO = CommonUtils.isDocValid(file, extantion, 2024, null);
        if (!validator.valid) {
            this.alertService.showToast('error', validator.alertMessage, 'top-right', true);
            (event.target as HTMLInputElement).value = '';
            return;
        }
        CommonUtils.getJsonFile((event.target as HTMLInputElement).files[0], (reader, jFile) => {
            const doc = Object.assign({});
            doc.file =
            {
                fileName: jFile.fileName,
                fileType: jFile.fileType,
                base64: jFile.base64
            }
            this.matDialogRef.close(doc.file);
        });
    }
}
