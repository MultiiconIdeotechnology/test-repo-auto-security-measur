import { Component, ViewChild } from '@angular/core';
import { AsyncPipe, CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
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
import { MatSidenav } from '@angular/material/sidenav';
import { FuseConfig, Themes, FuseConfigService } from '@fuse/services/config';
import { Subject, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { EntityService } from 'app/services/entity.service';
import { ToasterService } from 'app/services/toaster.service';
import { WithdrawService } from 'app/services/withdraw.service';
import { UserService } from 'app/core/user/user.service';
import { Security, withdrawPermissions, messages } from 'app/security';
import { RejectResonComponent } from '../reject-reson/reject-reson.component';
import { WPendingComponent } from '../pending/pending.component';

@Component({
  selector: 'app-bank-details-right',
  standalone: true,
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
    WPendingComponent
  ],
  templateUrl: './bank-details-right.component.html',
  // styleUrls: ['./bank-details-right.component.scss']
})
export class BankDetailsRightComponent {

  @ViewChild('pending') pending: WPendingComponent;


  @ViewChild('settingsDrawer') public settingsDrawer: MatSidenav;
  config: FuseConfig;
  layout: string;
  scheme: 'dark' | 'light';
  theme: string;
  themes: Themes;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  data: any;
  isFlag: any;
  user: any = {};
  record: any = {};
  title: any;
  send: any;

  constructor(
    private withdrawService: WithdrawService,
    private conformationService: FuseConfirmationService,
    private _fuseConfigService: FuseConfigService,
    private matDialog: MatDialog,
    private alertService: ToasterService,
    private entityService: EntityService,
    private _userService: UserService,

  ) {
    this._userService.user$
      .pipe((takeUntil(this._unsubscribeAll)))
      .subscribe((user: any) => { this.user = user; });

    this.entityService.onbankDetailsCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (item) => {
        this.settingsDrawer.toggle()
        this.record = item.data
        this.send = item.send
      }
    })
  }

  ngOnInit(): void {

    this._fuseConfigService.config$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((config: FuseConfig) => {
        this.config = config;
      });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  downloadInfo(data): void {
    window.open(data, '_blank');
  }

  Audit(): void {
    if (!Security.hasPermission(withdrawPermissions.auditUnauditPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    const label: string = 'Audit Bank'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ?'
    }).afterClosed().subscribe({
      next: (res) => {
        if (res === 'confirmed') {
          this.withdrawService.setAudit(this.record.bank_id).subscribe({
            next: () => {
              this.alertService.showToast('success', "Bank Audited", "top-right", true);
              this.settingsDrawer.close()
              this.entityService.raiserefreshbankDetailsCall(true);
            }, error: (err) => this.alertService.showToast('error', err, "top-right", true)
          });
        }
      }
    })
  }


  Reject(): void {
    if (!Security.hasPermission(withdrawPermissions.rejectPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    this.matDialog.open(RejectResonComponent, {
      data: null,
      disableClose: true,
    })
      .afterClosed().subscribe({
        next: (res) => {
          if (res) {
            const json = {
              id: this.record.bank_id,
              withdraw_id: this.record.id,
              reject_reason: res?.reject_reason
            }
            this.withdrawService.setrejected(json).subscribe({
              next: (res: any) => {
                if (res) {
                  this.alertService.showToast('success', 'Bank Rejected!');
                  // this.refreshItemsPending()
                  this.settingsDrawer.close()
                  this.entityService.raiserefreshbankDetailsCall(true);
                }
              }, error: err => {
                this.alertService.showToast('error', err);
              }
            })
          }
        }
      });


  }

}
