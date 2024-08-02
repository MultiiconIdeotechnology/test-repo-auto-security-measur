import { ClipboardModule, Clipboard, } from '@angular/cdk/clipboard';
import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AgentService } from 'app/services/agent.service';
import { ToasterService } from 'app/services/toaster.service';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';

@Component({
  selector: 'app-sub-agent-info',
  templateUrl: './sub-agent-info.component.html',
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
    MatDatepickerModule,
    MatSlideToggleModule,
    MatTooltipModule,
    NgxMatTimepickerModule,
    NgxMatSelectSearchModule,
    ClipboardModule
  ],
})
export class SubAgentInfoComponent {

  record: any = {};
  records:any = {};
  fieldList: {};

  constructor(
    public matDialogRef: MatDialogRef<SubAgentInfoComponent>,
    public alertService: ToasterService,
    public agentService:AgentService,
    private clipboard: Clipboard,


    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) { 
    this.record = data?? {}
  }

  ngOnInit(): void {
    if (this.record.id) {

      this.agentService.getAgentRecord(this.record.id).subscribe({
        next: data => {
          this.record = data;
          this.records = data;
            this.fieldList = [
              { name: 'Agent Code', value: data.agent_code },
              { name: 'Agency Name', value: data.agency_name },
              { name: 'Email', value: data.email_address },
              { name: 'Is Lead', value: data.is_lead? 'Yes':'No' },
              { name: 'Mobile Number', value: data.mobile_number },
              { name: 'Relation Manager Name', value: data.relation_manager_name },
              { name: 'Convert Date Time', value:data.convert_date_time? DateTime.fromISO(data.convert_date_time).toFormat('dd-MM-yyyy HH:mm:ss').toString():'' },
              { name: 'City Name', value: data.city_name },
              { name: 'Referral Link', value: data.referral_link_url },
              { name: 'Lead Convert By Name', value: data.lead_convert_by_name },
              { name: 'Is Distibutor', value: data.is_distibutor? 'Yes':'No' },
              { name: 'Contact Person', value: data.contact_person },
              { name: 'Contact Person Number', value: data.contact_person_number },
              { name: 'Contact Person Email', value: data.contact_person_email },
              { name: 'Is KYC Completed', value: data.is_kyc_completed? 'Yes':'No' },
              { name: 'KYC Complete Date', value:data.kyc_complete_date? DateTime.fromISO(data.kyc_complete_date).toFormat('dd-MM-yyyy HH:mm:ss').toString():'' },
              { name: 'Is Blocked', value: data.is_blocked? 'Yes':'No' },
              { name: 'KYC Profile Name', value: data.kyc_profile_name },
              { name: 'Block By Name', value: data.block_by_name },
              { name: 'Unblock By Name', value: data.unblock_by_name },
              { name: 'Unblock Date Time', value:data.unblock_date_time? DateTime.fromISO(data.unblock_date_time).toFormat('dd-MM-yyyy HH:mm:ss').toString():'' },
              { name: 'Register From', value: data.register_from },
              { name: 'Web Last Login Time', value:data.web_last_login_time? DateTime.fromISO(data.web_last_login_time).toFormat('dd-MM-yyyy HH:mm:ss').toString():'' },
              { name: 'Android Last Login Time', value:data.android_last_login_time? DateTime.fromISO(data.android_last_login_time).toFormat('dd-MM-yyyy HH:mm:ss').toString():'' },
              { name: 'IOS Last Login Time', value:data.ios_last_login_time? DateTime.fromISO(data.ios_last_login_time).toFormat('dd-MM-yyyy HH:mm:ss').toString():'' },
              { name: 'Web Registration Date', value:data.web_registration_date? DateTime.fromISO(data.web_registration_date).toFormat('dd-MM-yyyy HH:mm:ss').toString():'' },
              { name: 'Android Registration Date', value:data.android_registration_date? DateTime.fromISO(data.android_registration_date).toFormat('dd-MM-yyyy HH:mm:ss').toString():'' },
              { name: 'IOS Registration Date', value:data.ios_registration_date? DateTime.fromISO(data.ios_registration_date).toFormat('dd-MM-yyyy HH:mm:ss').toString():'' },
              { name: 'Modify By Name', value: data.modify_by_name },
              { name: 'Modify Date Time', value: data.modify_date_time? DateTime.fromISO(data.modify_date_time).toFormat('dd-MM-yyyy HH:mm:ss').toString():''},
              { name: 'Entry By Name', value: data.entry_by_name },
              { name: 'Entry Date Time', value: data.entry_date_time? DateTime.fromISO(data.entry_date_time).toFormat('dd-MM-yyyy HH:mm:ss').toString():''},
            ]
        },error: (err) => this.alertService.showToast('error', err, "top-right", true)
      });
    }
  }

  autologinAgent() {
    this.agentService.autoLogin(this.records.id).subscribe({
      next: data => {
        window.open(data.url + 'sign-in/' + data.code);
      }, error: err => {
        this.alertService.showToast('error', err)
      }
    })
  }

  copyLink(link : string): void {
    this.clipboard.copy(link);
    this.alertService.showToast('success','Link Copied');
  }

}
