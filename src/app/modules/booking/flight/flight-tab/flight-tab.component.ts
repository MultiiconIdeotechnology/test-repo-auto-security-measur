import { NgIf, NgFor, DatePipe, NgClass } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ToasterService } from 'app/services/toaster.service';
// import { AmendmentRequestsListComponent } from '../amendment-requests-list/amendment-requests-list.component';
import { FlightComponent } from '../flight/flight.component';

@Component({
  selector: 'app-flight-tab',
  templateUrl: './flight-tab.component.html',
  styleUrls: ['./flight-tab.component.scss'],
  standalone: true,
  imports: [
      NgIf,
      NgFor,
      DatePipe,
      ReactiveFormsModule,
      MatFormFieldModule,
      MatIconModule,
      MatInputModule,
      MatButtonModule,
      MatProgressBarModule,
      MatTableModule,
      MatPaginatorModule,
      MatSortModule,
      MatMenuModule,
      MatTooltipModule,
      MatDividerModule,
      NgClass,
      MatTabsModule,
      FlightComponent,
      // AmendmentRequestsListComponent


  ],
})
export class FlightTabComponent {

  public show:boolean = false;
  public buttonName:any = 'Show';

  currentFilter: any;


  @ViewChild('flight') flight: FlightComponent;
  // @ViewChild('amendment request') amendment: AmendmentRequestsListComponent;

  constructor(
    private conformationService: FuseConfirmationService,
    private matDialog: MatDialog,
    private toasterService: ToasterService
  ){

  }

  apiCalls: any = {};
  
  refreshList(){

  }
  tabChanged(event: any): void {
    const label = event?.tab?.ariaLabel;
    switch (label) {
      case 'Flight':
        this.ifNotThenCall('flight', () => this.flight.refreshItems());
        break;
        case 'Amendment Request':
          // this.amendment.refreshItems();
          break;
    }
  
  }

  private ifNotThenCall(call: string, callback: () => void): void {
    if (!this.apiCalls[call]) {
      this.apiCalls[call] = true;
      callback();
    }
  }


}
