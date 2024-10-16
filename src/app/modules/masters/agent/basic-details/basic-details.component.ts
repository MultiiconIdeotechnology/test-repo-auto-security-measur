import { Component, Input } from '@angular/core';
import { AsyncPipe, CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AgentService } from 'app/services/agent.service';
import { CityService } from 'app/services/city.service';
import { DesignationService } from 'app/services/designation.service';
import { EmployeeService } from 'app/services/employee.service';
import { ToasterService } from 'app/services/toaster.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { DateTime } from 'luxon';
import { KycInfoComponent } from '../kyc-info/kyc-info.component';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { BankInfoComponent } from './bank-info/bank-info.component';


@Component({
  selector: 'app-basic-details',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    NgIf,
    NgFor,
    AsyncPipe,
    NgxMatSelectSearchModule,
    MatDatepickerModule,
    RouterModule,
    NgxMatTimepickerModule,
    MatTooltipModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatTabsModule,
    DatePipe,
    MatPaginatorModule,
    MatDividerModule,
    NgClass,
    MatProgressSpinnerModule,
    MatSortModule,
    MatTableModule,
    SlickCarouselModule,
    MatOptionModule,
  ],
  templateUrl: './basic-details.component.html',
  styleUrls: ['./basic-details.component.scss']
})
export class BasicDetailsComponent {

  @Input() basicDetails: any;
  @Input() bankDetails: any;

  idUrl: any;
  records: any = {};
  profile_picture: any;
  AgentList: any = [];
  rmList: any = [];
  accountList: any = [];

  columns = [
    'action',
    'document_proof',
    'bank_name',
    'account_number',
    'account_holder_name',
    'ifsc_code',
    'account_currency_code',
    'account_type',
];
  dataSource = new MatTableDataSource();

  constructor(
    public formBuilder: FormBuilder,
    public cityService: CityService,
    public agentService: AgentService,
    public router: Router,
    public route: ActivatedRoute,
    public alertService: ToasterService,
    public designationService: DesignationService,
    public employeeService: EmployeeService,
    private conformationService: FuseConfirmationService,
    private matDialog: MatDialog,
    private clipboard: Clipboard
  ) {
  }

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {
      this.idUrl = params.get('id');
    })

    // const request = {}
    // request['MasterId'] = this.idUrl;
    // request['Skip'] = 0;
    // request['Take'] = 100
    // request['OrderBy'] = "bank_name";
    // request['Filter'] = "";
    // request['OrderDirection'] = 1;


    // this.agentService.getBankList(request).subscribe({
    //   next: (res) => {
    //     this.dataSource.data = res?.data;

    //   }, error: err => {
    //     this.alertService.showToast('error', err);
    //   },
    // });
    if(this.bankDetails){
      this.dataSource.data = this.bankDetails
    }

    if(this.basicDetails){
      this.records = this.basicDetails;
      this.profile_picture = this.basicDetails.big_logo;
      this.AgentList = [
        { name: 'Agent Code', value: this.basicDetails.agent_code },
        { name: 'Agency Name', value: this.basicDetails.agency_name },
        { name: 'Email', value: this.basicDetails.email_address },
        { name: 'Mobile', value: this.basicDetails.mobile_number },
        { name: 'Contact Person', value: this.basicDetails.contact_person },
        { name: 'Contact Person Email', value: this.basicDetails.contact_person_email },
        { name: 'Contact Person Mobile', value: this.basicDetails.contact_person_number },
        { name: 'City', value: this.basicDetails.city_name },
        { name: 'Address', value: this.basicDetails.address_line1 },
        { name: 'KYC', value: '', isKyc: true },
        { name: 'Signup Date', value: this.basicDetails.sign_up_date ? DateTime.fromISO(this.basicDetails.sign_up_date).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
        { name: 'Last Login Web', value: this.basicDetails.web_last_login_time ? DateTime.fromISO(this.basicDetails.web_last_login_time).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
        { name: 'Last Login Android', value: this.basicDetails.android_last_login_time ? DateTime.fromISO(this.basicDetails.android_last_login_time).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
        { name: 'Last Login IOS', value: this.basicDetails.ios_last_login_time ? DateTime.fromISO(this.basicDetails.ios_last_login_time).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
        { name: 'Last Login IP', value: this.basicDetails.last_login_ip },
        { name: 'Register From', value: this.basicDetails.register_from },

        // { name: 'Is Blocked', value: this.basicDetails.is_blocked ? 'Yes' : 'No' },
        { name: 'Block By', value: this.basicDetails.block_by_name, isHide: !this.basicDetails.is_blocked },
        { name: 'Block Reason', value: this.basicDetails.block_reason, isHide: !this.basicDetails.is_blocked },
        { name: 'Block Date Time', value: this.basicDetails.block_date_time ? DateTime.fromISO(this.basicDetails.block_date_time).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '', isHide: !this.basicDetails.is_blocked },
      ]

      this.rmList = [
        { name: 'RM Name', value: this.basicDetails.relation_manager_name },
        { name: 'RM Email', value: this.basicDetails.relation_manager_email },
        { name: 'RM Mobile', value: this.basicDetails.relation_manager_mobile },
        { name: 'RM Assign Date', value: this.basicDetails.relation_manager_assign_date ? DateTime.fromISO(this.basicDetails.relation_manager_assign_date).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
        { name: 'Previous RM', value: this.basicDetails.previous_relation_manager },
      ]

      this.accountList = [
        { name: 'Base Currency', value: this.basicDetails.base_currency },
        { name: 'Wallet Balance', value: this.basicDetails.wallet_balance },
        { name: 'Credit', value: this.basicDetails.credit },
        { name: 'Credit Policy', value: this.basicDetails.credit_policy },
        { name: 'Credit Given By', value: this.basicDetails.credit_givenby },
        { name: 'Credit Expiry', value: this.basicDetails.credit_expiry ? DateTime.fromISO(this.basicDetails.credit_expiry).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
        { name: 'First Transaction Date', value: this.basicDetails.first_transaction_date_time ? DateTime.fromISO(this.basicDetails.first_transaction_date_time).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
        { name: 'Last Transaction Date', value: this.basicDetails.last_transaction_date ? DateTime.fromISO(this.basicDetails.last_transaction_date).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
        { name: 'Markup Profile', value: this.basicDetails.markup_profile_name },
        { name: 'KYC profile', value: this.basicDetails.kyc_profile_name
        },
      ]

      if(this.basicDetails?.preferred_language) {
        this.AgentList.push({ name: 'Preferred Language', value: this.basicDetails?.preferred_language },)
      }

      if(this.basicDetails?.service_offered_by_ta) {
        this.AgentList.push({ name: 'Service Offered By TA', value: this.basicDetails?.service_offered_by_ta },)
      }
    }
  }

  viewKYC(): void {

    this.matDialog.open(KycInfoComponent, {
      data: { record: this.records, agent: true },
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {

      }
    })
  }

  downloadInfo(data): void {
    window.open(data, '_blank');
  }

  infoBank(data){
    this.matDialog.open(BankInfoComponent, {
      data: data,
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {

      }
    })
  }

}
