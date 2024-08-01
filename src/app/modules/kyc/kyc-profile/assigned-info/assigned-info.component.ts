import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';

@Component({
  selector: 'app-assigned-info',
  templateUrl: './assigned-info.component.html',
  styleUrls: ['./assigned-info.component.scss'],
  styles: [`
  .tbl-grid {
    grid-template-columns: 100px 260px 120px;
  }
  `],
   standalone: true,
   imports: [
     NgIf,
     NgFor,
     AsyncPipe,
     RouterModule,
     ReactiveFormsModule,
     MatIconModule,
     MatInputModule,
     MatFormFieldModule,
     MatButtonModule,
     MatSelectModule,
     MatDatepickerModule,
     MatTooltipModule,
     MatMenuModule,
     MatSlideToggleModule,
     NgxMatTimepickerModule,
     NgxMatSelectSearchModule,
   ],
})
export class AssignedInfoComponent {

  dataList = [];

  isLoading = false;
  user: any = {};

  constructor(
    public matDialogRef: MatDialogRef<AssignedInfoComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any = {},
  ) {
  }

  ngOnInit(): void {
      this.dataList = this.data;
  }

  close() {
    this.matDialogRef.close();
  }

}
