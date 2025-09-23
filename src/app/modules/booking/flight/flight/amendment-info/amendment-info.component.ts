import { CommonModule, NgIf, NgFor, NgClass, DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlightTabService } from 'app/services/flight-tab.service';
import { ToasterService } from 'app/services/toaster.service';
import { CommonUtils } from 'app/utils/commonutils';

@Component({
  selector: 'app-amendment-info',
  templateUrl: './amendment-info.component.html',
  styleUrls: ['./amendment-info.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    NgFor,
    NgClass,
    DatePipe,
    MatIconModule,
    MatTooltipModule,
    MatTableModule
  ],
})
export class AmendmentInfoComponent {

  fieldList: any[] = [];
  payment: any;
  loading: boolean = false;
  allData: any;
  record: any = {}
  typeTitle: any

  // pcolumn: string[] = ['passenger_name', 'traveller_detail', 'baggage', 'old_booking_date', 'new_booking_date'];
  ccolumn: string[] = ['charge', 'per_person_charge'];
  bccolumn: string[] = ['charge', 'per_person_charge'];

  constructor(
    public matDialogRef: MatDialogRef<AmendmentInfoComponent>,
    private alertService: ToasterService,
    private flighttabService: FlightTabService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data?.data ?? {};
  }

  ngOnInit() {
    this.refreshItems();
  }

  refreshItems(): void {
    this.loading = true;

    this.flighttabService.getAirAmendmentRecord(this.record.id).subscribe({
      next: (res) => {
        if (res) {
          this.allData = res;
          this.typeTitle = this.allData.amendment_info.type
        }
        this.loading = false;
      }, error: err => {
        this.alertService.showToast('error', err);
        this.loading = false;
      },
    });
  }

  //Your Invoice
  invoice(id : string,name: string): void {
    this.flighttabService.printInvoice(id).subscribe({
      next: (res) => {
        CommonUtils.downloadPdf(res?.data, name + '.pdf');
      }, error: (err) => {
        this.alertService.showToast('error', err);
      }
    })
  }

   //Agent Invoice
  agentInvoice(id : string,name: string): void {
    this.flighttabService.printInvoice(id).subscribe({
      next: (res) => {
        CommonUtils.downloadPdf(res?.data, name + '.pdf');
      }, error: (err) => {
        this.alertService.showToast('error', err);
      }
    })
  }
}
