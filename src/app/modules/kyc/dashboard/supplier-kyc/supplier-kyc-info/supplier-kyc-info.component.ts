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
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { MatSidenav } from '@angular/material/sidenav';
import { FuseConfig } from '@fuse/services/config';
import { EntityService } from 'app/services/entity.service';
import { ToasterService } from 'app/services/toaster.service';

@Component({
  selector: 'app-supplier-kyc-info',
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
  ],
  templateUrl: './supplier-kyc-info.component.html',
  styleUrls: ['./supplier-kyc-info.component.scss']
})
export class SupplierKycInfoComponent {

  @ViewChild('settingsDrawer') public settingsDrawer: MatSidenav;
  config: FuseConfig;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  record: any = {};
  private settingsUpdatedSubscription: Subscription;

  constructor(
    public alertService: ToasterService,
    private entityService: EntityService,
  ) {
    this.settingsUpdatedSubscription = this.entityService.onsupplierKycInfo()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (item) => {
          this.settingsDrawer?.toggle();
          this.record = item.data;
          console.log(this.record);
        },
        error: (err) => {
          this.alertService.showToast('error', err, 'top-right', true);
        }
      });
  }

}
