import { Routes } from 'app/common/const';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { filter, startWith, debounceTime, distinctUntilChanged, switchMap, ReplaySubject, Observable } from 'rxjs';
import { KycDocumentService } from 'app/services/kyc-document.service';
import { EmployeeService } from 'app/services/employee.service';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';
import { DesignationService } from 'app/services/designation.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MessageTemplatesService } from 'app/services/message-templates.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { NgxSummernoteModule } from 'ngx-summernote';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ToasterService } from 'app/services/toaster.service';

@Component({
  selector: 'app-message-templates-entry',
  templateUrl: './message-templates-entry.component.html',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
    MatIconModule,
    RouterModule,
    ReactiveFormsModule,
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
    NgxSummernoteModule,
  ]
})
export class MessageTemplatesEntryComponent implements OnInit {

  config = {
    placeholder: '',
    tabsize: 2,
    height: '200px',
    uploadImagePath: '/api/upload',
    toolbar: [
      ['misc', ['codeview', 'undo', 'redo']],
      ['style', ['bold', 'italic', 'underline', 'clear']],
      ['font', ['bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', 'clear']],
      ['fontsize', ['fontname', 'fontsize', 'color']],
      ['para', ['style', 'ul', 'ol', 'paragraph', 'height']],
      ['insert', ['table', 'picture', 'link', 'video', 'hr']]
    ],
    fontNames: ['Helvetica', 'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Roboto', 'Times']
  }

  readonly: boolean = false;
  record: any = {};
  btnTitle: string = 'Create';
  fieldList: {};
  TemplateList: any[] = ['Company', 'Agent']
  MessageList: any[] = ['Email', 'WhatsApp', 'SMS']
  SendToList: any[] = ['Employee', 'Agent', 'Supplier', 'B2C', 'Individual','Master Agent','Sales Person','Operation Team','Group']
  isFirstemployee: boolean = false;
  isFirstAgent: boolean = false;
  isFirstemployeeadd: boolean = true;
  isFirstAgentadd: boolean = true;
  checked: boolean

  MessageTemplatesRoute = Routes.settings.messagetemplates_route;
  disableBtn: boolean = false
  employeeList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
  AgentList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
  eventList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
  SendFromList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
  // SupplierList: ReplaySubject<any[]> = new ReplaySubject<any[]>();

  constructor(
    public formBuilder: FormBuilder,
    public messageTemplatesService: MessageTemplatesService,
    public router: Router,
    public route: ActivatedRoute,
    public designationService: DesignationService,
    private employeeService: EmployeeService,
    private kycDocumentService: KycDocumentService,
    public toasterService: ToasterService,


  ) { }

  formGroup: FormGroup;
  protected alertService: ToastrService;

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      id: [""],
      // template_for: ["Company"],
      // template_for_id: [""],
      event_id: [''],
      message_type: ['Email'],
      message_title: [''],
      send_to: ['Employee'],
      send_from_id: [''],
      individual_address: [''],
      message_template: [''],
      email_subject: [''],
      event_name: [''],
      template_for_name: [''],
      send_from_name: [''],

      empfilter: [''],
      agentfilter: [''],
      eventfilter: [''],
      empfilter2: [''],
      agentfilter2: [''],
      supplierfilter: [''],
      sendfromfilter: [''],

    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      const readonly = params.get('readonly');

      if (id) {
        this.readonly = readonly ? true : false;
        this.btnTitle = readonly ? 'Close' : 'Save';
        this.messageTemplatesService.getMessageRecord(id).subscribe({
          next: (data) => {
            this.record = data;
            this.formGroup.patchValue(data);
            this.formGroup.get('eventfilter').patchValue(data.event_name)
            this.formGroup.get('agentfilter').patchValue(data.template_for_name)
            this.formGroup.get('empfilter').patchValue(data.template_for_name)
            this.formGroup.get('sendfromfilter').patchValue(data.send_from_name)
          },
          error: (err) => {
            this.toasterService.showToast('error', err)

          },
        })
      }
    })

    this.formGroup.get('empfilter').valueChanges.pipe(
      filter(search => !!search),
      startWith(''),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((value: any) => {
        return this.employeeService.getemployeeCombo(value);
      })
    ).subscribe(data => {
      this.employeeList.next(data);
      // if (this.isFirstemployeeadd) {
      //   this.employeeList2.next(data);
      //   this.isFirstemployeeadd = false;
      // }
    });

    this.formGroup.get('agentfilter').valueChanges.pipe(
      filter(search => !!search),
      startWith(''),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((value: any) => {
        return this.kycDocumentService.getAgentCombo(value);
      })
    ).subscribe(data => {
      this.AgentList.next(data);
      // if (this.isFirstAgentadd) {
      //   this.AgentList2.next(data);
      //   this.isFirstAgentadd = false;
      // }
    })

    this.formGroup.get('eventfilter').valueChanges.pipe(
      filter(search => !!search),
      startWith(''),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((value: any) => {
        return this.messageTemplatesService.getMessageEventCombo(value);
      })
    ).subscribe(data => this.eventList.next(data))

    // this.formGroup.get('supplierfilter').valueChanges.pipe(
    //   filter(search => !!search),
    //   startWith(''),
    //   debounceTime(400),
    //   distinctUntilChanged(),
    //   switchMap((value: any) => {
    //     return this.employeeService.getSupplierCombo(value);
    //   })
    // ).subscribe(data => this.SupplierList.next(data))

    this.formGroup.get('sendfromfilter').valueChanges.pipe(
      filter(search => !!search),
      startWith(''),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((value: any) => {
        return this.messageTemplatesService.getEmailSetupCombo(value);
      })
    ).subscribe(data => this.SendFromList.next(data))

  }
  submit(): void {
    if (!this.formGroup.valid) {
      this.toasterService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.formGroup.markAllAsTouched();
      return;
    }

    if (this.readonly) {
      this.router.navigate([this.MessageTemplatesRoute])
      return
    }
    const json: any = {
      id: this.formGroup.get('id').value,
      // template_for: this.formGroup.get('template_for').value,
      // template_for_id: this.formGroup.get('template_for_id').value,
      event_id: this.formGroup.get('event_id').value,
      message_type: this.formGroup.get('message_type').value,
      message_title: this.formGroup.get('message_title').value,
      send_to: this.formGroup.get('send_to').value,
      send_from_id: this.formGroup.get('send_from_id').value,
      individual_address: this.formGroup.get('individual_address').value,
      email_subject: this.formGroup.get('email_subject').value,
      message_template: this.formGroup.get('message_template').value,
    }
    this.disableBtn = true
    this.messageTemplatesService.create(json).subscribe({
      next: () => {
        if (!json.id) {
          this.toasterService.showToast(
            'success',
            'New record added'
          );
        }
        if (json.id) {
          this.toasterService.showToast(
            'success',
            'Record modified'
          );
        }
        // this.alertService.success('Employee Created');
        this.router.navigate([this.MessageTemplatesRoute])
        this.disableBtn = false;
      }, error: err => {
        this.toasterService.showToast(
          'error',
          err
        );
        this.disableBtn = false;
      }
    })

  }

  // ngAfterViewInit() {
  //   this.formGroup.get('empfilter2').valueChanges.pipe(
  //     filter(search => !!search),
  //     startWith(''),
  //     debounceTime(400),
  //     distinctUntilChanged(),
  //     switchMap((value: any) => {
  //       if (this.isFirstemployee) {
  //         return this.employeeService.getemployeeCombo(value || '');
  //       } else {
  //         this.isFirstemployee = true;
  //         return new Observable<any[]>();
  //       }
  //     })
  //   ).subscribe(data => {
  //     if (this.isFirstemployee) {
  //       this.employeeList2.next(data);
  //     }
  //   });

  //   this.formGroup.get('agentfilter2').valueChanges.pipe(
  //     filter(search => !!search),
  //     startWith(''),
  //     debounceTime(400),
  //     distinctUntilChanged(),
  //     switchMap((value: any) => {
  //       if (this.isFirstAgent) {
  //         return this.employeeService.getAgentCombo(value || '');
  //       } else {
  //         this.isFirstAgent = true
  //         return new Observable<any[]>();
  //       }
  //     })
  //   ).subscribe(data => {
  //     if (this.isFirstAgent)
  //       this.AgentList2.next(data);
  //   });
  // }

  // TemplateForchange() {
  //   this.formGroup.get('template_for_id').patchValue('');
  // }

  SendTochange() {
    // this.formGroup.get('send_from_id').patchValue('');
    this.formGroup.get('individual_address').patchValue('');
  }

  public compareWith(v1: any, v2: any) {
    return v1 && v2 && v1.id === v2.id;
  }
}
