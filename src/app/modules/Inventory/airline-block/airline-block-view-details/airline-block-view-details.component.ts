import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AirlineBlockService } from 'app/services/airline-block.service';
import { ToasterService } from 'app/services/toaster.service';
import { Linq } from 'app/utils/linq';

@Component({
  selector: 'app-airline-block-view-details',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './airline-block-view-details.component.html',
  styleUrls: ['./airline-block-view-details.component.scss']
})
export class AirlineBlockViewDetailsComponent implements OnInit {
  payload: any = {};
  airlineBlockDeatils: any = {};
  loading: boolean = false;
  segmentList: any[] = [];
  priceDetail: any[] = [];
  redirectURL: string = '/airline-block/airline-block-inventory';

  constructor(
    private airlineBlockService: AirlineBlockService,
    public route: ActivatedRoute,
    private toasterService: ToasterService,
  ) {
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params: any) => {
      const queryParams = {
        id: params.get('id'),
        trip_type: params.get('trip_type'),
        origin: params.get('origin'),
        destination: params.get('destination'),
        departure_date: params.get('departure_date'),
        flight_type: params.get('flight_type'),
        Adult: Number(params.get('Adult')),
        Child: Number(params.get('Child')),
        Infant: Number(params.get('Infant')),
      };
      this.getAirlineBlockDetails(queryParams);
    })
  }

  getAirlineBlockDetails(queryParams: any) {
    this.loading = true;
    this.airlineBlockService.getAirBlockFlightDetail(queryParams).subscribe({
      next: (res) => {
        if (res) {
          this.airlineBlockDeatils = res;
          this.airlineBlockDeatils.departure_date_time = this.parseCustomDateTime(this.airlineBlockDeatils.departure_date_time);
          this.airlineBlockDeatils.arrival_date_time = this.parseCustomDateTime(this.airlineBlockDeatils.arrival_date_time);
          this.segmentList = this.airlineBlockDeatils?.segment?.map((segment: any) => ({
            ...segment,
            departure_date_time: this.parseCustomDateTime(segment.departure_date_time),
            arrival_date_time: this.parseCustomDateTime(segment.arrival_date_time),
          })) ?? [];
        }
        this.loading = false;
      },
      error: (err) => {
        this.toasterService.showToast('error', err);
        this.loading = false;
      }
    })
  }

  private parseCustomDateTime(dateTimeStr: string): Date {
    const [datePart, timePart] = dateTimeStr.split(' ');
    const [day, month, year] = datePart.split('-');
    return new Date(`${year}-${month}-${day}T${timePart}:00`);
  }

  isSamePlanes(plan1, plan2): boolean {
    return `${plan1.airline_name}${plan1.flight_no}` === `${plan2?.airline_name}${plan2?.flight_no}`
  }

}
