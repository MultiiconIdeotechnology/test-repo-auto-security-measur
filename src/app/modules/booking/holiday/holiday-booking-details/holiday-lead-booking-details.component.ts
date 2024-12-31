import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-holiday-lead-booking-details',
  templateUrl: './holiday-lead-booking-details.component.html',
  styleUrls: ['./holiday-lead-booking-details.component.css'],
  standalone:true,
    imports:[
      CommonModule
    ]
})
export class HolidayLeadBookingDetailsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
