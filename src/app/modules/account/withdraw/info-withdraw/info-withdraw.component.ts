import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
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
import { FuseConfig } from '@fuse/services/config';
import { EntityService } from 'app/services/entity.service';
import { ToasterService } from 'app/services/toaster.service';
import { WithdrawService } from 'app/services/withdraw.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { Subject, Subscription, takeUntil } from 'rxjs';

@Component({
    selector: 'app-info-withdraw',
    templateUrl: './info-withdraw.component.html',
    // styleUrls: ['./info-withdraw.component.scss'],
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
        NgxMatTimepickerModule
    ]
})
export class InfoWithdrawComponent {
    @ViewChild('settingsDrawer') public settingsDrawer: MatSidenav;
    config: FuseConfig;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    record: any = {};
    private settingsUpdatedSubscription: Subscription;

    constructor(
        public alertService: ToasterService,
        public withdrawService: WithdrawService,
        private entityService: EntityService,
    ) {
        this.settingsUpdatedSubscription = this.entityService.onInfoWithdraw()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (item) => {
                    console.log("item", item);
                    this.settingsDrawer?.toggle();
                    this.record = item.data;
                    if (!item.global_withdraw && this.record) {
                        this.refreshItem();
                    }
                    if (item.global_withdraw) {
                        this.refreshItem();
                    }
                },
                error: (err) => {
                    this.alertService.showToast('error', err, 'top-right', true);
                }
            });
    }

    downloadInfo(data: string): void {
        window.open(data, '_blank');
    }

    refreshItem() {
        if (this.record) {
            this.withdrawService.getWalletWithdrawRecord(this.record).subscribe({
                next: (data) => {
                    this.record = data;
                },
                error: (err) => {
                    this.alertService.showToast('error', err, 'top-right', true);
                },
            });
        }
    }

    ngOnDestroy() {
        if (this.settingsUpdatedSubscription) {
            this.settingsUpdatedSubscription.unsubscribe();
        }
        // this._unsubscribeAll.next();
        // this._unsubscribeAll.complete();
    }
}
