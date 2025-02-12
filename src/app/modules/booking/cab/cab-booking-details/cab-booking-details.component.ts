import { Component } from '@angular/core';
import { AsyncPipe, CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Routes } from 'app/common/const';
import { CompactLayoutComponent } from 'app/layout/layouts/vertical/compact/compact.component';
import { CabService } from 'app/services/cab.service';
import { ToasterService } from 'app/services/toaster.service';
import { Linq } from 'app/utils/linq';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';

@Component({
  selector: 'app-cab-booking-details',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    NgFor,
    DatePipe,
    AsyncPipe,
    RouterModule,
    ReactiveFormsModule,
    MatIconModule,
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
    NgClass,
    ClipboardModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './cab-booking-details.component.html',
  styleUrls: ['./cab-booking-details.component.scss']
})
export class CabBookingDetailsComponent {

  jsonParam: any;
  bookingDetail: any;
  priceDetail: any[] = [];


  constructor(
    private router: Router,
    public route: ActivatedRoute,
    private cabService: CabService,
    private alertService: ToasterService,
    private classy: CompactLayoutComponent,
    private matDialog: MatDialog,
    private conformationService: FuseConfirmationService,
  ) { }

  cabRoute = Routes.booking.cab_route;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.cabService.getCabBookingDetail(id).subscribe({
        next: (res: any) => {
          this.bookingDetail = res;
          this.priceDetail = res.priceDetail;
          this.priceDetail = Linq.groupBy(this.priceDetail, x => x.box)
        }, error: (err) => {
          this.alertService.showToast('error', err);
        }
      });
    });
    this.classy.toggleNavigation('mainNavigation');
  }

  close() {
    this.router.navigate([this.cabRoute])
  }

}
