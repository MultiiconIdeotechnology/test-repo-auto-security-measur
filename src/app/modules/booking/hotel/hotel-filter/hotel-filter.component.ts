import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AgentService } from 'app/services/agent.service';
import { CityService } from 'app/services/city.service';
import { HotelBookingService } from 'app/services/hotel-booking.service';
import { ToasterService } from 'app/services/toaster.service';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { filter, startWith, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-hotel-filter',
  templateUrl: './hotel-filter.component.html',
  styleUrls: ['./hotel-filter.component.scss'],
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
    NgxMatSelectSearchModule,
    MatDatepickerModule,
    MatTooltipModule
  ]
})
export class HotelFilterComponent {

  record: any = {};
  disableBtn: boolean = false
  statusList = ['All', 'Confirmation Pending', 'Pending', 'Failed', 'Confirmed', 'Cancellation Pending', 'Payment Failed', 'Rejected', 'Cancelled'];

  constructor(
    public matDialogRef: MatDialogRef<HotelFilterComponent>,
    private builder: FormBuilder,
    private conformationService: FuseConfirmationService,
    private matDialog: MatDialog,
    private agentService: AgentService,
    private hotelService: HotelBookingService,
    private cityService: CityService,
    private alertService: ToasterService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    if (data)
      this.record = data;
  }

  IsFirst: boolean = true;
  title = "Filter Criteria"
  btnLabel = "Apply"
  fromList: any[] = [];
  agentList: any[] = [];
  cityList: any[] = [];
  formGroup: FormGroup;

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      agent_id: [''],
      agentfilter: [''],
      Status: [this.statusList[0]],
      From: [''],
      cityFilter: [''],
      FromDate: [''],
      ToDate: [''],
    });

    this.formGroup.get('cityFilter').valueChanges.pipe(
      filter(search => !!search),
      startWith(''),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((value: any) => {
        return this.hotelService.getHotelCityCombo(value);
      })
    ).subscribe({
      next: data => {
        this.cityList = data
        if (!this.record.From) {
          this.formGroup.get("From").patchValue(this.cityList[0]);
        }
      }
    })

    this.formGroup
      .get('agentfilter')
      .valueChanges.pipe(
        filter((search) => !!search),
        startWith(''),
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((value: any) => {
          return this.agentService.getAgentCombo(value);
        })
      )
      .subscribe({
        next: data => {
          this.agentList = data
          this.agentList = [];

          this.agentList.push({
            "id": "",
            "agency_name": "All"
          })
          this.agentList.push(...data);

          if (!this.record.agent_id) {
            this.formGroup.get("agent_id").patchValue(this.agentList[0]);
          }
        }
      });

    if (this.record.agent_id) {
      this.formGroup.patchValue(this.record)
      this.formGroup.get("agentfilter").patchValue(this.record.agent_id.agency_name);
      this.formGroup.get("agent_id").patchValue(this.record.agent_id);
      this.formGroup.get("cityFilter").patchValue(this.record.From.city_name);
      this.formGroup.get("From").patchValue(this.record.From);
    }

    if (this.record) {
      this.formGroup.patchValue(this.record)
    }

  }

  public compareWith(v1: any, v2: any) {
    return v1 && v2 && v1.id === v2.id;
  }



  apply(){

    const json = this.formGroup.getRawValue();
    // json['FromDate']= DateTime.fromISO(this.formGroup.get('FromDate').value).toFormat('yyyy-MM-dd');
    // json['ToDate']= DateTime.fromISO(this.formGroup.get('ToDate').value).toFormat('yyyy-MM-dd');
    json.FromDate = new Date(this.formGroup.get('FromDate').value)
    json.ToDate = new Date(this.formGroup.get('ToDate').value)
    this.matDialogRef.close(json);

  }



  resetForm() {
    var date = new Date()
    date.setDate(1)
    date.setMonth(date.getMonth());

    this.formGroup.reset();
    this.formGroup.get("agent_id").patchValue(this.agentList[0]);
    this.formGroup.get('Status').patchValue(this.statusList[0]);
    this.formGroup.get('FromDate').patchValue(date);
    this.formGroup.get('ToDate').patchValue(new Date());
  }

}
