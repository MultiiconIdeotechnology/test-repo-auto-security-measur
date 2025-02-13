import { CommonModule, NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
  selector: 'app-reject-reson',
  templateUrl: './reject-reson.component.html',
  styleUrls: ['./reject-reson.component.scss'],
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
})
export class RejectResonComponent {

  rejectForm: FormGroup;
  docs: any[] = [];

  constructor(
      public matDialogRef: MatDialogRef<RejectResonComponent>,
      private fb: FormBuilder,
      @Inject(MAT_DIALOG_DATA) public datas: any = {}
  ) {
      // this.docs = datas.docs;
  }

  ngOnInit(): void {
      this.rejectForm = this.fb.group({
        reject_reason: ['', Validators.required]
    });
  }

  saveDetail() {
      const json = this.rejectForm.getRawValue();
      this.matDialogRef.close(json)
  }

}
