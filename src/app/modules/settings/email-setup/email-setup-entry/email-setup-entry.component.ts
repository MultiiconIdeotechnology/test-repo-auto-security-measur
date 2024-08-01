import { DateTime } from 'luxon';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { debounceTime, distinctUntilChanged, filter, ReplaySubject, startWith, switchMap } from 'rxjs';
import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CityService } from 'app/services/city.service';
import { EmailSetupService } from 'app/services/email-setup.service';
import { ToasterService } from 'app/services/toaster.service';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { Linq } from 'app/utils/linq';
import { EmployeeService } from 'app/services/employee.service';
import { AgentService } from 'app/services/agent.service';

@Component({
  selector: 'app-email-setup-entry',
  templateUrl: './email-setup-entry.component.html',
  // styleUrls: ['./email-setup-entry.component.scss']
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
  ],
})
export class EmailSetupEntryComponent {

  disableBtn: boolean = false
  readonly: boolean = false;
  record: any = {};
  shortList: any[] = [];
  cityList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
  employeeList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
  agentList: ReplaySubject<any[]> = new ReplaySubject<any[]>();

  fieldList: {};

  protocol: any[] = [
    {value: 'IMAP', viewValue: 'IMAP'},
    {value: 'POP3', viewValue: 'POP3'},
  ];

  email_for: any[] = [
    {value: 'System', viewValue: 'System'},
    {value: 'Employee', viewValue: 'Employee'},
    {value: 'Agent', viewValue: 'Agent'},

  ];

  constructor(
    public matDialogRef: MatDialogRef<EmailSetupEntryComponent>,
    private builder: FormBuilder,
    private emailSetupService:EmailSetupService,
    private agentService: AgentService,
    public cityService: CityService,
    public alertService: ToasterService,
    private employeeService: EmployeeService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) { 
    this.record = data?.data ?? {}
  }

  formGroup: FormGroup;
  title = "Create Email Setup"
  btnLabel = "Create"

  keywords = [];

  announcer = inject(LiveAnnouncer);

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      email_for: ['System'],
      username:[''],
      email_address: ['',Validators.email],
      display_name:[''],
      email_password: [''],
      incoming_mail_server:[''],
      outgoing_mail_server: [''],
      incoming_server_port:[''],
      outgoing_server_port:[''],
      protocol:[''],
      enable_ssl: [false],

      email_for_id: [''],
      empfilter: [''],
      agentfilter:['']

    });

  //   this.formGroup.get('display_name').valueChanges.subscribe(text => {
  //     this.formGroup.get('display_name').patchValue(Linq.convertToTitleCase(text), { emitEvent: false });
  //  }) 

   this.formGroup.get('email_address').valueChanges.subscribe(text => {
    this.formGroup.get('email_address').patchValue(text.toLowerCase(), { emitEvent: false });
  })

      if (this.record.id) {
        this.emailSetupService.getEmailSetupRecord(this.record.id).subscribe({
          next:(data)=> {
            this.readonly = this.data.readonly;
            if(this.readonly) {
              this.fieldList = [
                { name: 'Email For', value: data.email_for},
                { name: 'Email Address', value: data.email_address },
                { name: 'User Name', value: data.username },
                { name: 'Display Name', value: data.display_name},
                { name: 'incoming Mail Server', value: data.incoming_mail_server},
                { name: 'Outgoing Mail Server', value: data.outgoing_mail_server },
                { name: 'Incoming Server Port', value: data.incoming_server_port },
                { name: 'Outgoing Server Port', value: data.outgoing_server_port },
                { name: 'Enable SSL', value: data.enable_ssl? 'True' : 'false' },
                { name: 'Protocol', value: data.protocol},
                { name: 'Test Mail Success', value: data.test_mail_success? 'True' : 'false' },
                { name: 'Test Mail Date Time', value: data.test_mail_date_time},
                { name: 'Modify Date Time', value: data.modify_date_time? DateTime.fromISO(data.modify_date_time).toFormat('dd-MM-yyyy HH:mm:ss').toString():''},
                
              ]
            }
            this.formGroup.patchValue(this.record);
            // this.formGroup.get('cityfilter').patchValue(this.record.city_name);
            this.title = this.readonly ? 'Info Email Setup' : 'Modify Email Setup';
            this.btnLabel = this.readonly ? 'Close' : 'Save';
          }
          
      });
      }
   
      this.formGroup.get('empfilter').valueChanges.pipe(
        filter(search => !!search),
        startWith(''),
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((value: any) => {
          return this.employeeService.getemployeeCombo(value);
        })
      ).subscribe(data => this.employeeList.next(data));

      this.formGroup.get('agentfilter').valueChanges.pipe(
        filter(search => !!search),
        startWith(''),
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((value: any) => {
          return this.agentService.getAgentCombo(value);
        })
      ).subscribe(data => this.agentList.next(data));

  }


  submit(): void {
    if(!this.formGroup.valid){
      this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.formGroup.markAllAsTouched();
      return;
}

    this.disableBtn = true;
    const json = this.formGroup.getRawValue();
    this.emailSetupService.create(json).subscribe({
      next: () => {
       this.matDialogRef.close(true);
       this.disableBtn = false;
      }, error: (err) => {
        this.disableBtn = false;
        this.alertService.showToast('error', err, "top-right", true);
      }
    })
  }

}
