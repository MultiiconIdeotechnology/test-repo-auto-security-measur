import { CommonModule, NgFor } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-pax-info',
  templateUrl: './pax-info.component.html',
  standalone   : true,
  imports: [
    CommonModule,
    NgFor,
    MatIconModule,
    MatTooltipModule
],

})
export class PaxInfoComponent {
  fieldList: any[] = [];
  constructor(
    public matDialogRef: MatDialogRef<PaxInfoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
  }

  ngOnInit() {
    if(this.data) {
        this.fieldList = [
            { name: 'First Name', value: this.data?.first_name},
            { name: 'Last Name', value: this.data?.last_name},
            { name: 'Marital Status', value: this.data?.marital_status},
            { name: 'Father Name', value: this.data?.father_name},
            { name: 'Mother Name', value: this.data?.mother_name},
            { name: 'Gender Type', value: this.data?.gender_type},
            { name: 'Passport Number', value: this.data?.passport_number},
            { name: 'Date Of Birth', value: this.data?.date_of_birth? DateTime.fromISO(this.data?.date_of_birth).toFormat('dd-MM-yyyy').toString():'' },
            { name: 'Passport Issue Date', value: this.data?.passport_issue_date ? DateTime.fromISO(this.data?.passport_issue_date).toFormat('dd-MM-yyyy').toString():'' },
            { name: 'Passport Valid Till', value: this.data?.passport_valid_till ? DateTime.fromISO(this.data?.passport_valid_till).toFormat('dd-MM-yyyy').toString():'' },
            { name: 'Status', value: this.data?.status, class:
            this.data?.status === 'Pending' ? 'text-yellow-600 font-semibold' :
            this.data?.status === 'Payment Confirmed' ? 'text-green-600 font-semibold' :
            this.data?.status === 'Payment Failed' ? 'text-red-600 font-semibold' :
            this.data?.status === 'Inprocess' ? 'text-blue-600 font-semibold' :
            this.data?.status === 'Documents Rejected' ? 'text-red-600 font-semibold' :
            this.data?.status === 'Documents Revised' ? 'text-blue-600 font-semibold' :
            this.data?.status === 'Applied' ? 'text-blue-600 font-semibold' :
            this.data?.status === 'Success' ? 'text-green-600 font-semibold' :
            this.data?.status === 'Reject' ? 'text-red-600 font-semibold' : ''}
        ]
    }
  }
}
