import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LeadsService } from 'app/services/leads.service';
import { ToasterService } from 'app/services/toaster.service';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
  selector: 'app-lead-entry',
  templateUrl: './lead-entry.component.html',
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
    MatSlideToggleModule,
    NgxMatSelectSearchModule,
    MatTooltipModule
  ]
})
export class LeadEntryComponent {

  record: any = {};
  title = this.data.title
  fieldList: {};
  records: any = {};

  constructor(
    public matDialogRef: MatDialogRef<LeadEntryComponent>,
    public alertService: ToasterService,
    private leadsService: LeadsService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data?.data ?? {}
  }

  ngOnInit() {
    if (this.record.id) {
      this.leadsService.getAgentLeadRecord(this.record.id).subscribe({
        next: (data) => {

          this.records = data;

          this.fieldList = [
            { name: 'Agency Name', value: data.agency_name, },
            { name: 'Lead Status', value: data.lead_status, },
            { name: 'Email', value: data.email_address, },
            { name: 'Mobile Number', value: data.mobile_number, },
            { name: 'Relation Manager', value: data.relation_manager, },
            { name: 'City', value: data.city_name, },
            { name: 'Address Line 1', value: data.address_line1, },
            { name: 'Address Line 2', value: data.address_live2, },
            { name: 'Pincode', value: data.pincode, },
            { name: 'Agent', value: data.agent_name, },
            { name: 'Master Agent', value: data.master_agent_name, },
            { name: 'Is KYC Completed', value: data.is_kyc_completed ? 'Yes' : 'No' },
            { name: 'KYC Completed Date', value: data.kyc_complete_date ? DateTime.fromISO(data.kyc_complete_date).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '', },
            { name: 'Register', value: data.register_from, },
          ];
        },
        error: (err) => {
          this.alertService.showToast('error', err, 'top-right', true);
        },

      },
      )

    }
  }
}


