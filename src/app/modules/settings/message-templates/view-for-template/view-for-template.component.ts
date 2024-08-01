import { Inject } from '@angular/core';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { NgIf, NgFor, NgClass, AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
  selector: 'app-view-for-template',
  templateUrl: './view-for-template.component.html',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    AsyncPipe,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    NgxMatSelectSearchModule,
  ]

})
export class ViewForTemplateComponent {
  dataForm: FormGroup;

  constructor(
    public matDialogRef: MatDialogRef<ViewForTemplateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any = {},
    private fb: FormBuilder,

  ) {
  }

  ngOnInit(){
    this.dataForm = this.fb.group({
      message_title:[''],
      message_template:[''],
    });
    this.dataForm.patchValue(this.data);
  }
}
