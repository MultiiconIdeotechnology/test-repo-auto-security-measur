import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe, UpperCasePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonUtils } from 'app/utils/commonutils';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
  selector: 'app-point-list',
  templateUrl: './point-list.component.html',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    DatePipe,
    AsyncPipe,
    FormsModule,
    UpperCasePipe,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatDatepickerModule,
    NgxMatSelectSearchModule,
  ]
})
export class PointListComponent {

  search:string='';
  pointList: any[]=[];
  droppingList: any;
  AllpointList:any[]=[];

  constructor(
    public matDialogRef: MatDialogRef<PointListComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    if(data.name === 'Boarding') {
      this.pointList = data.boardingPoints;
      this.AllpointList = data.boardingPoints;
      this.sortby();
    }else if (data.name === 'Dropping') {
      this.pointList = data.droppingPoints;
      this.AllpointList = data.droppingPoints;
      this.sortby();
    }else if (data.name === 'Operator') {
      this.pointList = data.operatorList;
      this.AllpointList = data.operatorList;
      this.sortby();
    }else if (data.name === 'layover') {
      this.pointList = data.layoverPoints;
      this.AllpointList = data.layoverPoints;
      this.sortby();
    }
  }

  ngOnInit(): void {

  }

  sortby():void {
    this.pointList.sort((a, b) => {
      if (a.isSelected && !b.isSelected) {
        return -1; 
      } else if (!a.isSelected && b.isSelected) {
        return 1; 
      } else {
        return 0; 
      }
    });
  }

  filterfrom(value):void {
    const searchedData = this.AllpointList.filter(x => 
      x.key.toLowerCase().includes(value.toLowerCase())
    );
    this.pointList = searchedData;
  }

  clear():void {
    this.pointList.forEach(x => x.isSelected = false);
  }

  apply():void {
    const selectedPoint = this.pointList.filter(x => x.isSelected).map(x => x.key)
    this.matDialogRef.close(selectedPoint)
  }
}
