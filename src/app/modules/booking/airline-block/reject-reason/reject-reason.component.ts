import { FormControl } from '@angular/forms';
import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-reject-reason',
  templateUrl: './reject-reason.component.html',
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
    MatSnackBarModule
  ]
})
export class RejectReasonComponent {
  record: any = {};

  constructor(
    public matDialogRef: MatDialogRef<RejectReasonComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data ?? {}
  }

  note = new FormControl();

  ngOnInit(): void {
  }

  submit(): void {
    if (this.note.value) {
      this.matDialogRef.close(this.note.value);
    }
  }
}
