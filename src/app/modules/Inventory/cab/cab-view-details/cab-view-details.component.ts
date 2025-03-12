import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CabService } from 'app/services/cab.service';
import { ActivatedRoute } from '@angular/router';
import { ToasterService } from 'app/services/toaster.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-cab-view-details',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './cab-view-details.component.html',
  styleUrls: ['./cab-view-details.component.scss']
})
export class CabViewDetailsComponent implements OnInit {
  payload:any = {};
  cabDisplayData:any = {};
  loading: boolean = false;

  constructor(
    private cabService: CabService,
    private activatedRoute: ActivatedRoute,
    private toasterService: ToasterService,
    // private commanService: CommanService,
  ){

  }

  ngOnInit():void {
    this.activatedRoute.queryParams.subscribe((param:any) => {
       this.payload = param;

      if(this.payload){
        this.getCabDetails();
      }
    })

  }

  // Cab Details api call
  getCabDetails(){
    this.loading = true;
    this.cabService.getCabDetails(this.payload).subscribe({
      next:(res) => {
        if(res){
          this.cabDisplayData = res;
          this.cabDisplayData.departure_date = this.payload.departure_date,
          this.cabDisplayData.return_date = this.payload?.return_date
          this.loading = false;
        }
      },
      error:(err) => {
        this.toasterService.showToast('error', err);
        this.loading = false;
      }
    })
  }

}
