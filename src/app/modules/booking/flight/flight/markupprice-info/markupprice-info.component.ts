import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-markupprice-info',
  templateUrl: './markupprice-info.component.html',
  styleUrls: ['./markupprice-info.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    MatIconModule,
    NgIf,
    NgClass
  ]

})
export class MarkuppriceInfoComponent {

  fieldList: any[] = [];
  title: string 

  constructor(
    public matDialogRef: MatDialogRef<MarkuppriceInfoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.fieldList = this.data.data;
    this.title = this.data.title
  }

}
