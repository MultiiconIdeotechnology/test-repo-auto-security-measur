import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { FuseConfig, Themes } from '@fuse/services/config';
import { UserService } from 'app/core/user/user.service';
import { EntityService } from 'app/services/entity.service';
import { LeadsService } from 'app/services/leads.service';
import { ToasterService } from 'app/services/toaster.service';
import { WithdrawService } from 'app/services/withdraw.service';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-info-withdraw',
  templateUrl: './info-withdraw.component.html',
  // styleUrls: ['./info-withdraw.component.scss'],
  styles: [
    `
        app-bank-entry-right {
            position: static;
            display: block;
            flex: none;
            width: auto;
        }
    `,
  ],
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
    MatTooltipModule,
    FuseDrawerComponent,
    MatDividerModule,
    MatDatepickerModule,
    MatMenuModule,
    NgxMatTimepickerModule,
  ]

})
export class InfoWithdrawComponent {

  @ViewChild('settingsDrawer') public settingsDrawer: MatSidenav;
  config: FuseConfig;
  layout: string;
  scheme: 'dark' | 'light';
  theme: string;
  themes: Themes;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  record: any = {};
  fieldList: {};
  records: any = {};
  title: string;
  allrecord: any;

  constructor(
    public alertService: ToasterService,
    public withdrawService: WithdrawService,
    private leadsService: LeadsService,
    private entityService: EntityService,
    private _userService: UserService,
  ) {

    this.entityService.onInfoWithdraw().pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (item) => {
        this.settingsDrawer.toggle()
        this.record = item.data
        if (this.record) {
          this.recordList()
        }
      }
    })
  }

  ngOnInit() {
    if (this.record.id) {

    }
  }

  downloadInfo(data): void {
    window.open(data, '_blank');
  }

  recordList() {
    this.withdrawService.getWalletWithdrawRecord(this.record).subscribe({
      next: (data) => {
        this.record = data
      },
      error: (err) => {
        this.alertService.showToast('error', err, 'top-right', true);
      },
    },
    )
  }

}
