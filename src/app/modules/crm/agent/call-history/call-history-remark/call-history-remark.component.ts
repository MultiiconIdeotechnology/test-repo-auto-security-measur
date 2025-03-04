import { Component, Inject } from '@angular/core';
import { AsyncPipe, CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToasterService } from 'app/services/toaster.service';
import { MatDividerModule } from '@angular/material/divider';

@Component({
    selector: 'app-call-remark',
    standalone: true,
    imports: [NgIf,
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
        MatDividerModule
    ],
    templateUrl: './call-history-remark.component.html',
    styleUrls: ['./call-history-remark.component.scss']
})
export class CallHisoryRemarkComponent {
    record: any;

    constructor(
        public matDialogRef: MatDialogRef<CallHisoryRemarkComponent>,
        public formBuilder: FormBuilder,
        public alertService: ToasterService,
        @Inject(MAT_DIALOG_DATA) public data: any = {}
    ) {
        this.record = data;
        console.log("this.record remark", this.record)
    }
}
