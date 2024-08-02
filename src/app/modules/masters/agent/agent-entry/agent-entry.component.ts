import { DateTime } from 'luxon';
import { AsyncPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, FormsModule, FormControl, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CityService } from 'app/services/city.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ReplaySubject, Subject, debounceTime, distinctUntilChanged, filter, startWith, switchMap, takeUntil } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Routes } from 'app/common/const';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DesignationService } from 'app/services/designation.service';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { EmployeeService } from 'app/services/employee.service';
import { ToastrService } from 'ngx-toastr';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonUtils } from 'app/utils/commonutils';
import { MatMenuModule } from '@angular/material/menu';
import { AgentService } from 'app/services/agent.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ToasterService } from 'app/services/toaster.service';
import { MatTabsModule } from '@angular/material/tabs';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { AppConfig } from 'app/config/app-config';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatDialog } from '@angular/material/dialog';
import { BlockReasonComponent } from '../../supplier/block-reason/block-reason.component';
import { EmployeeDialogComponent } from '../employee-dialog/employee-dialog.component';
import { KycInfoComponent } from '../kyc-info/kyc-info.component';
import { MarkupProfileDialogeComponent } from '../markup-profile-dialoge/markup-profile-dialoge.component';
import { MatDividerModule } from '@angular/material/divider';
import { SubAgentInfoComponent } from '../sub-agent-info/sub-agent-info.component';
import { Clipboard } from '@angular/cdk/clipboard';
import { SubKycProfileComponent } from '../sub-kyc-profile/sub-kyc-profile.component';
import { SetCurrencyComponent } from '../set-currency/set-currency.component';
import { WhitelabelEntryComponent } from '../../whitelabel/whitelabel-entry/whitelabel-entry.component';
import { Security, agentsPermissions, messages } from 'app/security';

@Component({
  selector: 'app-agent-entry',
  templateUrl: './agent-entry.component.html',
  standalone: true,
  imports: [
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
    NgClass
  ],
})
export class AgentEntryComponent {
  designations: any[] = [];
  readonly: boolean = false;
  record: any = {};
  records: any = {};
  title: string = 'Create Agent';
  btnTitle: string = 'Create';
  fieldList: {};
  profile_picture: any;
  subAgentsList: any[] = [];
  relationshipList: any[] = [];
  SearchQuery: string = '';
  SearchAgent: string = '';
  filteredrelationshipList: any[] = [];
  dataLength:any

  agentListRoute = Routes.customers.agent_route;
  leadListRoute = Routes.customers.lead_route;

  @ViewChild(MatPaginator) public paginator: MatPaginator;

  disableBtn: boolean = false
  lead: boolean = false;
  id: string;
  searchInputControl = new FormControl('');
  appConfig = AppConfig;

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

  formGroup: FormGroup;
  cityList: ReplaySubject<any[]> = new ReplaySubject<any[]>()
  employeeList: ReplaySubject<any[]> = new ReplaySubject<any[]>()
  public _unsubscribeAll: Subject<any> = new Subject<any>();

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      id: [""],
      agency_name: [""],
      email_address: ['', Validators.email],
      mobile_number: [""],
      city_id: [""],
      relationship_manager_id: [''],
      employee_name: [''],
      // profile_picture: [""],
      contact_person: [''],
      contact_person_email: ['', Validators.email],
      contact_person_number: [''],
      register_from: ['Web'],
      cityfilter: [''],
      empfilter: [''],
      agentfilter: ['']
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.id = params.get('id');
      const readonly = params.get('readonly');
      const lead = params.get('lead');

      if (lead) {
        this.lead = true;
      }

      if (id) {
        this.readonly = readonly ? true : false;
        this.title = readonly ? (this.lead ? 'Lead Detail' : 'Agent Detail') : 'Modify Agent Detail';
        this.btnTitle = readonly ? 'Close' : 'Save';
        this.agentService.getAgentRecord(id).subscribe({
          next: data => {
            this.record = data;
            this.records = data;
            if (this.record.profile_picture)
              this.profile_picture = data.profile_photo;
            this.formGroup.patchValue(data);
            if (data.relation_manager_name) {
              this.formGroup.get('empfilter').patchValue(data.relation_manager_name);
              this.formGroup.get('relationship_manager_id').patchValue(data.relationship_manager_id);
            }
            this.formGroup.get('cityfilter').patchValue(data.city_name);

            if (this.readonly) {
              this.fieldList = [
                { name: 'Agent Code', value: data.agent_code },
                { name: 'Agency Name', value: data.agency_name },
                { name: 'Email', value: data.email_address },
                { name: 'Is Lead', value: data.is_lead ? 'Yes' : 'No' },
                { name: 'Mobile Number', value: data.mobile_number },
                { name: 'Relation Manager Name', value: data.relation_manager_name },
                { name: 'Convert Date Time', value: data.convert_date_time ? DateTime.fromISO(data.convert_date_time).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
                { name: 'City Name', value: data.city_name },
                { name: 'Referral Link', value: data.referral_link_url },
                { name: 'Lead Convert By Name', value: data.lead_convert_by_name },
                { name: 'Is Distibutor', value: data.is_distibutor ? 'Yes' : 'No' },
                { name: 'Contact Person', value: data.contact_person },
                { name: 'Contact Person Number', value: data.contact_person_number },
                { name: 'Contact Person Email', value: data.contact_person_email },
                { name: 'Is KYC Completed', value: data.is_kyc_completed ? 'Yes' : 'No' },
                { name: 'KYC Complete Date', value: data.kyc_complete_date ? DateTime.fromISO(data.kyc_complete_date).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
                { name: 'Is Blocked', value: data.is_blocked ? 'Yes' : 'No' },
                { name: 'KYC Profile Name', value: data.kyc_profile_name },
                { name: 'Block By Name', value: data.block_by_name },
                { name: 'Unblock By Name', value: data.unblock_by_name },
                { name: 'Unblock Date Time', value: data.unblock_date_time ? DateTime.fromISO(data.unblock_date_time).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
                { name: 'Register From', value: data.register_from },
                { name: 'Web Last Login Time', value: data.web_last_login_time ? DateTime.fromISO(data.web_last_login_time).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
                { name: 'Android Last Login Time', value: data.android_last_login_time ? DateTime.fromISO(data.android_last_login_time).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
                { name: 'IOS Last Login Time', value: data.ios_last_login_time ? DateTime.fromISO(data.ios_last_login_time).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
                { name: 'Web Registration Date', value: data.web_registration_date ? DateTime.fromISO(data.web_registration_date).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
                { name: 'Android Registration Date', value: data.android_registration_date ? DateTime.fromISO(data.android_registration_date).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
                { name: 'IOS Registration Date', value: data.ios_registration_date ? DateTime.fromISO(data.ios_registration_date).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
                { name: 'Modify By Name', value: data.modify_by_name },
                { name: 'Modify Date Time', value: data.modify_date_time ? DateTime.fromISO(data.modify_date_time).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
                { name: 'Entry By Name', value: data.entry_by_name },
                { name: 'Entry Date Time', value: data.entry_date_time ? DateTime.fromISO(data.entry_date_time).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
              ]
            }
          },
          error: (err) => {
            this.alertService.showToast('error',err,'top-right',true);
            this.disableBtn = false;
        },
        });

        this.refreshItems();

        this.agentService.getRMChangeList({ AgentId: id }).subscribe({
          next: data => {
            this.relationshipList = data;
            this.filteredrelationshipList = data;
          }, error: err => {
            this.alertService.showToast('error', err, "top-right", true);
          }
        })

        this.searchInputControl.valueChanges
          .pipe(
            takeUntil(this._unsubscribeAll),
            debounceTime(AppConfig.searchDelay)
          )
          .subscribe(() => {
            GridUtils.resetPaginator(this.paginator);
            this.refreshItems();
          });

      }
    })

    this.formGroup.get('cityfilter').valueChanges.pipe(
      filter(search => !!search),
      startWith(''),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((value: any) => {
        return this.cityService.getCityCombo(value);
      })
    ).subscribe(data => this.cityList.next(data));

    this.formGroup.get('empfilter').valueChanges.pipe(
      filter(search => !!search),
      startWith(''),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((value: any) => {
        return this.employeeService.getemployeeCombo(value);
      })
    ).subscribe(data => this.employeeList.next(data));

    this.formGroup.get('agentfilter').valueChanges.pipe(
      filter(search => !!search),
      startWith(''),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((value: any) => {
        return this.employeeService.getemployeeCombo(value);
      })
    ).subscribe(data => this.employeeList.next(data));

  }

  refreshItems() {
    const request = GridUtils.GetFilterReq(this.paginator, null, this.searchInputControl.value);
    request['AgentId'] = this.id;

    this.agentService.getAgentList(request).subscribe({
      next: data => {
        this.subAgentsList = data.data;
        this.paginator.length = data.total;
        // this.dataLength = data.total
      }, error: err => {
        this.alertService.showToast('error', err, "top-right", true);
      }
    })
  }

  applySearchFilters() {
    if (this.SearchQuery === '') {
      this.filteredrelationshipList = this.relationshipList;
    } else {
      this.filteredrelationshipList = this.relationshipList.filter(item => item.login.toLowerCase().includes(this.SearchQuery.toLowerCase())
      );
    }
  }

  view(record): void {
    this.matDialog.open(SubAgentInfoComponent, {
      data: { data: record, readonly: true, id: record.id },
      disableClose: true
    })
  }

  deleteInternal(record): void {
    const label: string = 'Delete Agent'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.agency_name + ' ?'
    }).afterClosed().subscribe(res => {
      if (res === 'confirmed') {
        this.agentService.delete(record.id).subscribe({
          next: () => {
            this.alertService.showToast('success', "Agent has been deleted!", "top-right", true);
            this.refreshItems()
          },
          error: (err) => {
            this.alertService.showToast('error', err, 'top-right', true);
            this.disableBtn = false;
          }
        })
      }
    })
  }

  autologin(record: any) {

    this.agentService.autoLogin(record.id).subscribe({
      next: data => {
        window.open(data.url + 'sign-in/' + data.code);
      }, error: err => {
        this.alertService.showToast('error', err)
      }
    })

  }

  autologinAgent() {
    if (!Security.hasPermission(agentsPermissions.autoLoginPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
  }

    this.agentService.autoLogin(this.records.id).subscribe({
      next: data => {
        window.open(data.url + 'sign-in/' + data.code);
      }, error: err => {
        this.alertService.showToast('error', err)
      }
    })

  }

  setBlockUnblock(record): void {
    // if (!Security.hasNewEntryPermission(this.module)) {
    //     this.alertService.error('Permission Denied.');
    //     return;
    // }
    if (record.is_blocked) {
      const label: string = 'Unblock Agent'
      this.conformationService.open({
        title: label,
        message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.agency_name + ' ?'
      }).afterClosed().subscribe(res => {
        if (res === 'confirmed') {
          this.agentService.setBlockUnblock(record.id).subscribe({
            next: () => {
              record.is_blocked = !record.is_blocked;
              this.alertService.showToast('success', "Agent has been Unblock!", "top-right", true);
            },
            error: (err) => {
              this.alertService.showToast('error', err, 'top-right', true);
              this.disableBtn = false;
            }
          })
        }
      })
    } else {
      this.matDialog.open(BlockReasonComponent, {
        data: record,
        disableClose: true
      }).afterClosed().subscribe(res => {
        if (res) {
          this.agentService.setBlockUnblock(record.id, res).subscribe({
            next: () => {
              record.is_blocked = !record.is_blocked;
              this.alertService.showToast('success', "Agent has been Block!", "top-right", true);
            },
            error: (err) => {
              this.alertService.showToast('error', err, 'top-right', true);
              this.disableBtn = false;
            }
          })
        }
      })
    }
  }

  setBlockUnblockAgent(): void {
    if (!Security.hasPermission(agentsPermissions.blockUnblockPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
  }

    if (this.records.is_blocked) {
      const label: string = 'Unblock Agent'
      this.conformationService.open({
        title: label,
        message: 'Are you sure to ' + label.toLowerCase() + ' ' + this.records.agency_name + ' ?'
      }).afterClosed().subscribe(res => {
        if (res === 'confirmed') {
          this.agentService.setBlockUnblock(this.records.id).subscribe({
            next: () => {
              this.records.is_blocked = !this.records.is_blocked;
              this.alertService.showToast('success', "Agent has been Unblock!", "top-right", true);
            },
            error: (err) => {
              this.alertService.showToast('error', err, 'top-right', true);
              this.disableBtn = false;
            }
          })
        }
      })
    } else {
      this.matDialog.open(BlockReasonComponent, {
        data: this.records,
        disableClose: true
      }).afterClosed().subscribe(res => {
        if (res) {
          this.agentService.setBlockUnblock(this.records.id, res).subscribe({
            next: () => {
              this.records.is_blocked = !this.records.is_blocked;
              this.alertService.showToast('success', "Agent has been Block!", "top-right", true);
            },
            error: (err) => {
              this.alertService.showToast('error', err, 'top-right', true);
              this.disableBtn = false;
            }
          })
        }
      })
    }
  }

  resetPasswordAgent(){
    const label: string = 'Reset Password'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ' + this.records.agency_name + ' ?'
    }).afterClosed().subscribe(res => {
      if (res === 'confirmed') {
        this.agentService.regenerateNewPassword(this.records.id).subscribe({
          next: (res) => {
            this.alertService.showToast('success', res.msg, "top-right", true);
            this.refreshItems()
          },
          error: (err) => {
            this.alertService.showToast('error', err, 'top-right', true);
          },
        })
      }
    })
  }

  resetPassword(record): void {

  }

  relationahipManager(record): void {
    this.matDialog.open(EmployeeDialogComponent, {
      data: record,
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {
        this.agentService.setRelationManager(record.id, res.empId).subscribe({
          next: () => {
            // record.is_blocked = !record.is_blocked;
            this.alertService.showToast('success', "Relationship Manager Changed!");
          },
          error: (err) => {
            this.alertService.showToast('error', err, 'top-right', true);
            this.disableBtn = false;
          }
        })
      }
    })
  }

  relationahipManagerAgent(): void {
    if (!Security.hasPermission(agentsPermissions.relationshipManagerPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
  }


    this.matDialog.open(EmployeeDialogComponent, {
      data: this.records,
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {
        this.agentService.setRelationManager(this.records.id, res.empId).subscribe({
          next: () => {
            // record.is_blocked = !record.is_blocked;
            this.alertService.showToast('success', "Relationship Manager Changed!");
          },
          error: (err) => {
            this.alertService.showToast('error', err, 'top-right', true);
            this.disableBtn = false;
          }
        })
      }
    })
  }


  setKYCVerify(record): void {
   

    this.matDialog.open(KycInfoComponent, {
      data: { record: record, subAgent: true },
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {
        // this.agentService.setMarkupProfile(record.id, res.transactionId).subscribe({
        //   next: () => {
        //     // record.is_blocked = !record.is_blocked;
        //     this.alertService.showToast('success', "The markup profile has been set", "top-right", true);
        //   }
        // })
      }
    })
  }

  setKYCVerifyAgent(): void {
    if (!Security.hasPermission(agentsPermissions.viewKYCPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
  }

    this.matDialog.open(KycInfoComponent, {
      data: { record: this.records, agent: true },
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {
        // this.agentService.setMarkupProfile(record.id, res.transactionId).subscribe({
        //   next: () => {
        //     // record.is_blocked = !record.is_blocked;
        //     this.alertService.showToast('success', "The markup profile has been set", "top-right", true);
        //   }
        // })
      }
    })
  }

  setMarkupProfile(record): void {
    // if (!Security.hasNewEntryPermission(this.module)) {
    //     this.alertService.error('Permission Denied.');
    //     return;
    // }
    this.matDialog.open(MarkupProfileDialogeComponent, {
      data: record,
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {
        this.agentService.setMarkupProfile(record.id, res.transactionId).subscribe({
          next: () => {
            // record.is_blocked = !record.is_blocked;
            this.alertService.showToast('success', "The markup profile has been set", "top-right", true);
          },
          error: (err) => {
            this.alertService.showToast('error', err, 'top-right', true);
            this.disableBtn = false;
          }
        })
      }
    })
  }

  setMarkupProfileAgent(){
    if (!Security.hasPermission(agentsPermissions.setMarkupProfilePermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    this.matDialog.open(MarkupProfileDialogeComponent, {
      data: this.records,
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {
        this.agentService.setMarkupProfile(this.records.id, res.transactionId).subscribe({
          next: () => {
            // record.is_blocked = !record.is_blocked;
            this.alertService.showToast('success', "The markup profile has been set", "top-right", true);
          },
          error: (err) => {
            this.alertService.showToast('error', err, 'top-right', true);
            this.disableBtn = false;
          }
        })
      }
    })
  }

  setEmailVerify(record): void {
    const label: string = record.is_email_verified ? 'Unverify Email' : 'Verify Email'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.email_address + ' ?'
    }).afterClosed().subscribe(res => {
      if (res === 'confirmed') {
        this.agentService.setEmailVerifyAgent(record.id).subscribe({
          next: () => {
            record.is_email_verified = !record.is_email_verified;
            if (record.is_email_verified) {
              this.alertService.showToast('success', "Email has been verified", "top-right", true);
            }
          }
        })
      }
    })
  }

  setEmailVerifyAgent(): void {
    if (!Security.hasPermission(agentsPermissions.verifyEmailPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
  }

    const label: string = this.records.is_email_verified ? 'Unverify Email' : 'Verify Email'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ' + this.records.email_address + ' ?'
    }).afterClosed().subscribe(res => {
      if (res === 'confirmed') {
        this.agentService.setEmailVerifyAgent(this.records.id).subscribe({
          next: () => {
            this.records.is_email_verified = !this.records.is_email_verified;
            if (this.records.is_email_verified) {
              this.alertService.showToast('success', "Email has been verified", "top-right", true);
            }
          }
        })
      }
    })
  }

  setMobileVerify(record): void {

    const label: string = record.is_mobile_verified ? 'Unverify Mobile' : 'Verify Mobile'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.mobile_number + ' ?'
    }).afterClosed().subscribe(res => {
      if (res === 'confirmed') {
        this.agentService.setMobileVerifyAgent(record.id).subscribe({
          next: () => {
            record.is_mobile_verified = !record.is_mobile_verified;
            if (record.is_mobile_verified) {
              this.alertService.showToast('success', "Mobile number has been verified", "top-right", true);
            }
          },
          error: (err) => {
            this.alertService.showToast('error', err, 'top-right', true);
            this.disableBtn = false;
          }
        })
      }
    })
  }

  setMobileVerifyAgent(): void {
    if (!Security.hasPermission(agentsPermissions.verifyMobilePermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
  }

    const label: string = this.records.is_mobile_verified ? 'Unverify Mobile' : 'Verify Mobile'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ' + this.records.mobile_number + ' ?'
    }).afterClosed().subscribe(res => {
      if (res === 'confirmed') {
        this.agentService.setMobileVerifyAgent(this.records.id).subscribe({
          next: () => {
            this.records.is_mobile_verified = !this.records.is_mobile_verified;
            if (this.records.is_mobile_verified) {
              this.alertService.showToast('success', "Mobile number has been verified", "top-right", true);
            }
          },
          error: (err) => {
            this.alertService.showToast('error', err, 'top-right', true);
            this.disableBtn = false;
          }
        })
      }
    })
  }

  setCurrency(record): void {
    this.matDialog.open(SetCurrencyComponent, {
      data: record,
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {
        this.agentService.setBaseCurrency(record.id, res.base_currency_id).subscribe({
          next: () => {
            this.alertService.showToast('success', "The base currency has been set!", "top-right", true);
            this.refreshItems();
          },
          error: (err) => {
            this.alertService.showToast('error', err, 'top-right', true);
          }
        })
      }
    });
  }

  setCurrencyAgent(): void {
    if (!Security.hasPermission(agentsPermissions.setCurrencyPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
  }

    this.matDialog.open(SetCurrencyComponent, {
      data: this.records,
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {
        this.agentService.setBaseCurrency(this.records.id, res.base_currency_id).subscribe({
          next: () => {
            this.alertService.showToast('success', "The base currency has been set!", "top-right", true);
            this.refreshItems();
          },
          error: (err) => {
            this.alertService.showToast('error', err, 'top-right', true);
          }
        })
      }
    });
  }

  convertWlAgent(){
    if (!Security.hasPermission(agentsPermissions.convertToWLPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
  }
    this.matDialog
    .open(WhitelabelEntryComponent, {
      data: { data: this.records, send: 'Agent-WL' },
      disableClose: true,
    })
    .afterClosed()
    .subscribe((res) => {
      if (res) {
        this.alertService.showToast(
          'success',
          'New record added',
          'top-right',
          true
        );
        this.refreshItems();
      }
    });
  }

  kycProfile(record): void {
    this.matDialog.open(SubKycProfileComponent, {
      data: record,
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {
        this.agentService.mapkycProfile(record.id, res.kyc_profile_id).subscribe({
          next: () => {
            // record.is_blocked = !record.is_blocked;
            this.alertService.showToast('success', "KYC Profile has been Added!", "top-right", true);
            record.kyc_profile_id = res.kyc_profile_id;
          },
          error: (err) => {
            this.alertService.showToast('error', err, 'top-right', true);
          }

        })
      }
    })
  }

  convertWl(record): void {

  }


  public onProfileInput(event: any): void {
    const file = (event.target as HTMLInputElement).files[0];

    CommonUtils.getJsonFile(file, (reader, jFile) => {
      this.profile_picture = reader.result;
      this.formGroup.get('profile_picture').patchValue(jFile);
    });

    this.formGroup.get('profile_picture').updateValueAndValidity();
  }

  removePhoto(): void {
    this.formGroup.get('profile_picture').patchValue(null);
    this.profile_picture = null;
  }

  copyLink(link: string): void {
    this.clipboard.copy(link);
    this.alertService.showToast('success', 'Copied');
  }

  submit(): void {
    if (this.lead && this.readonly) {
      this.router.navigate([this.leadListRoute])
      return
    }
    if (!this.lead && this.readonly) {
      this.router.navigate([this.agentListRoute])
      return
    }

    const json = this.formGroup.getRawValue();
    json.is_removed = this.profile_picture === null ? true : false;
    this.disableBtn = true
    this.agentService.create(json).subscribe({
      next: () => {
        if (this.lead) {
          this.alertService.showToast('success', "Lead has been created!", "top-right", true);
          this.router.navigate([this.leadListRoute])
        } else {
          this.alertService.showToast('success', "Agent has been Modified!", "top-right", true);
          this.router.navigate([this.agentListRoute])
        }

        this.disableBtn = false;
      }, error: err => {
          this.alertService.showToast('error', err, 'top-right', true);
        this.disableBtn = false;
      }
    })

  }
}


