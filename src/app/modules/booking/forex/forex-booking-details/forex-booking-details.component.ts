import { Component, ViewChild } from '@angular/core';
import { AsyncPipe, CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
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
import { FuseConfigService } from '@fuse/services/config';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { EntityService } from 'app/services/entity.service';
import { ToasterService } from 'app/services/toaster.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { Subject, takeUntil } from 'rxjs';
import { ForexService } from 'app/services/forex.service';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-forex-booking-details',
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
    MatMenuModule,
    NgxMatSelectSearchModule,
    NgxMatTimepickerModule,
    FuseDrawerComponent,
    MatDividerModule,
  ],
  styles: [
    `
        referral-settings {
            position: static;
            display: block;
            flex: none;
            width: auto;
        }
    `,
  ],
  templateUrl: './forex-booking-details.component.html',
  styleUrls: ['./forex-booking-details.component.scss']
})
export class ForexBookingDetailsComponent {

  infoData: any;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  @ViewChild('settingsDrawer') public settingsDrawer: MatSidenav;

  constructor(
    private builder: FormBuilder,
    private forexService: ForexService,
    private conformationService: FuseConfirmationService,
    private entityService: EntityService,
    private alertService: ToasterService,
    private _fuseConfigService: FuseConfigService,

  ) {
    this.entityService.onForexEntityCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (item) => {
        if (item) {
          this.settingsDrawer.toggle()
          this.infoData = item?.data;
          }
        }
    })
  }

  getStatusColor(status: string): string {
    if (status == 'New') {
      return 'text-orange-600';
    } else if (status == 'Confirmed') {
      return 'text-green-600';
    } else if (status == 'Cancelled' || status == 'Rejected') {
      return 'text-red-600';
    } else {
      return '';
    }
  }


}
