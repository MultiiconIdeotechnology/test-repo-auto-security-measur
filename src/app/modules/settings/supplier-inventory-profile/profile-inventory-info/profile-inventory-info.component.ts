import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AsyncPipe, CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfig, Themes, FuseConfigService } from '@fuse/services/config';
import { EntityService } from 'app/services/entity.service';
import { ToasterService } from 'app/services/toaster.service';
import { Subject, takeUntil } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { UserService } from 'app/core/user/user.service';
import { MatDialog } from '@angular/material/dialog';
import { SidebarCustomModalService } from 'app/services/sidebar-custom-modal.service';
@Component({
  selector: 'app-profile-inventory-info',
  templateUrl: './profile-inventory-info.component.html',
  styleUrls: ['./profile-inventory-info.component.scss'],
  standalone: true,
  imports: [
    FuseDrawerComponent,
    MatDividerModule,
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
    MatMenuModule,
    NgxMatSelectSearchModule,
    NgxMatTimepickerModule,
    CommonModule
  ],
})
export class ProfileInventoryInfoComponent implements OnInit, OnDestroy {

  @ViewChild('settingsDrawer') public settingsDrawer: MatSidenav;
  config: FuseConfig;
  layout: string;
  scheme: 'dark' | 'light';
  theme: string;
  themes: Themes;

  user: any = {};
  disableBtn: boolean = false;
  readonly: boolean = false;
  bankForm: FormGroup;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  currencyList: any[] = [];
  agentId: any;
  bank: string = '';
  fieldList: {};
  tempInfoList: any;
  record: {}
  title = ""
  proof: any;
  private destroy$: Subject<any> = new Subject<any>();


  data: any;
  isFlag: any;
  infoFields = [
    // { label: 'Event Name', key: 'event_name' },
    { label: 'Template Status', key: 'template_status', isCustomColor: true },
    { label: 'Send To', key: 'send_to' },
    { label: 'Template', key: 'message_template', types: 'link' },
    { label: 'Approved Date', key: 'approve_date_time', format: 'dd-MM-yyyy', isDate: true },
    { label: 'Is Enabled', key: 'is_enable' },
    { label: 'Rejection Remark', key: 'rejection_remark' },
    { label: 'Rejected Date', key: 'reject_date_time', format: 'dd-MM-yyyy', isDate: true },
    { label: 'WhatsApp Template ID', key: 'whatsapp_template_id' },
    { label: 'Entry Date', key: 'entry_date_time', format: 'dd-MM-yyyy', isDate: true },
    { label: 'Template Example', key: 'template_example', types: 'link' },
  ];

  constructor(

    private _router: Router,
    private entityService: EntityService,
    private builder: FormBuilder,
    private _fuseConfigService: FuseConfigService,
    private fb: FormBuilder,
    public route: ActivatedRoute,
    private alertService: ToasterService,
    private _userService: UserService,
    private matDialog: MatDialog,
    private sidebarDialogService: SidebarCustomModalService,
  ) {
  }

  public onViewMessage(fieldKey: string, fieldValue: string): void {
    this.matDialog.open(ProfileInventoryInfoComponent, {
      data: {
        type: fieldKey,
        value: fieldValue
      },
      width: '600px',
      maxHeight: '90vh',
      disableClose: true,
      panelClass: 'full-dialog'
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  ngOnInit(): void {

    this.sidebarDialogService.onModalChange().pipe(takeUntil(this.destroy$)).subscribe((item: any) => {
      if (item && (item?.['type'] == 'info')) {
      const dateFields = this.infoFields
        .filter(f => f.isDate)
        .map(f => f.key);

      item.data = this.convertDateFields(item.data, dateFields); // 👈 Convert date strings to Date objects

      this.data = item.data;
      
      this.tempInfoList = item.data;
      this.title = this.data.profile_name;
      this.settingsDrawer.toggle();

      }
    })

    this._fuseConfigService.config$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((config: FuseConfig) => {
        this.config = config;
      });

  }

  getStatusStyles(status: string) {
    switch ((status || '').toLowerCase()) {
      case 'approved':
        return { backgroundColor: '#28a745', color: '#FFF' }; // green
      case 'pending':
        return { backgroundColor: '#f3c323ff', color: '#FFF' }; // yellow 
      case 'rejected':
        return { backgroundColor: '#ee0e0eff', color: '#FFF' };
      case 'inreview':
        return { backgroundColor: '#28a3f5ff', color: '#FFF' };
      default:
        return { backgroundColor: '#6c757d', color: '#FFF' }; // gray
    }
  }

  convertDateFields(data: any, fields: string[]): any {
    fields.forEach(field => {
      const trimmedField = field.trim();
      const value = data[trimmedField];
      if (value && typeof value === 'string') {
        const parsedDate = new Date(value);
        if (!isNaN(parsedDate.getTime())) {
          data[trimmedField] = parsedDate;
        }
      }
    });
    return data;
  }



  getDateFormat(field: any): string {
    return field?.format || 'dd-MM-yyyy';
  }


}
