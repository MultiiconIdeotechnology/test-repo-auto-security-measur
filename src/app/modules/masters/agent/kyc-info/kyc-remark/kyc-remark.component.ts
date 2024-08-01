import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ToasterService } from 'app/services/toaster.service';

@Component({
    selector: 'app-kyc-remark',
    templateUrl: './kyc-remark.component.html',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        DatePipe,
        AsyncPipe,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        MatIconModule,
    ]
})
export class KycRemarkComponent {
    btnTitle: string = 'Create';

    disableBtn: boolean = false;
    formGroup: FormGroup;
    title = ""
    btnLabel = "Create"

    constructor(
        public matDialogRef: MatDialogRef<KycRemarkComponent>,
        public formBuilder: FormBuilder,
        public alertService: ToasterService,
        @Inject(MAT_DIALOG_DATA) public data: any = {}
    ) {
        this.title = data.title;
    }

    ngOnInit(): void {
        this.formGroup = this.formBuilder.group({
            remark: [this.data.remark],
        });
    }

    submit(): void {
        if (!this.formGroup.get('remark').value || this.formGroup.get('remark').value.trim() == '') {
            this.alertService.showToast('error', 'Please ' + this.data.title.toLowerCase() + '.', 'top-right', true);
            this.formGroup.markAllAsTouched();
            return;
        }
        if(this.data.document_name.toLowerCase().includes('pan card') && !this.isValidPanNum(this.formGroup.get('remark').value)){
            this.alertService.showToast('error', 'Please enter valid pan number.', 'top-right', true);
            this.formGroup.markAllAsTouched();
            return; 
        }
          if(this.data.document_name.toLowerCase().includes('gst') && !this.isValidGstNum(this.formGroup.get('remark').value)){
            this.alertService.showToast('error', 'Please enter valid gst number.', 'top-right', true);
            this.formGroup.markAllAsTouched();
            return; 
        }
        this.matDialogRef.close(this.formGroup.get('remark').value.trim());
    }

    isValidPanNum(num: string): boolean {
        return (new RegExp('^[A-Za-z]{5}[0-9]{4}[A-Za-z]$')).test(num);
    }

    isValidGstNum(num: string): boolean {
        return (new RegExp('^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$')).test(num);
    }

    getPattern(){
        return this.data.document_name.toLowerCase().includes('pan card') ? '^[A-Za-z]{5}[0-9]{4}[A-Za-z]$' : this.data.document_name.toLowerCase().includes('gst') ? '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$' : ''
    }
}