import { FormControl } from '@angular/forms';
import { Component, Inject } from '@angular/core';
import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
  selector: 'app-block-reason',
  templateUrl: './block-reason.component.html',
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
    NgxMatSelectSearchModule,
  ]
})
export class BlockReasonComponent {
  record: any = {};

  constructor(
    public matDialogRef: MatDialogRef<BlockReasonComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data ?? {}
  }

  note = new FormControl();

  ngOnInit(): void {
  }

  submit(): void {
    this.matDialogRef.close(this.note.value);
  }
}
