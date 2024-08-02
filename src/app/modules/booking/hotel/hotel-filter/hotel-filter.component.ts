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
import { dateRange } from 'app/common/const';
import { AgentService } from 'app/services/agent.service';
import { CityService } from 'app/services/city.service';
import { FlightTabService } from 'app/services/flight-tab.service';
import { HotelBookingService } from 'app/services/hotel-booking.service';
import { ToasterService } from 'app/services/toaster.service';
import { CommonUtils } from 'app/utils/commonutils';
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

  allValStatus = 'All';
  allVal = {
    "id": "all",
    "company_name": "All"
  };
  supplierListAll: any[] = [];
  SupplierList: any[] = [];

  DR = dateRange;
  public FromDate: any;
  public ToDate: any;
  public dateRanges = [];

  record: any = {};
  disableBtn: boolean = false
  statusList = ['Confirmation Pending', 'Pending', 'Failed', 'Confirmed', 'Cancellation Pending', 'Payment Failed', 'Rejected', 'Cancelled'];

  constructor(
    public matDialogRef: MatDialogRef<HotelFilterComponent>,
    private builder: FormBuilder,
    private conformationService: FuseConfirmationService,
    private matDialog: MatDialog,
    private agentService: AgentService,
    private hotelService: HotelBookingService,
    private cityService: CityService,
    private flighttabService: FlightTabService,
    private alertService: ToasterService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    if (data)
      this.record = data;
    this.dateRanges = CommonUtils.valuesArray(dateRange);

  }

  IsFirst: boolean = true;
  title = "Filter Criteria"
  btnLabel = "Apply"
  fromList: any[] = [];
  agentList: any[] = [];
  cityList: any[] = [];
  formGroup: FormGroup;

  vaalStatuschange() {
    var alldt = this.formGroup.get('Status').value.filter(x => x.Status != "all");
    this.formGroup.get('Status').patchValue(alldt);
  }

  vaalchange() {
    var alldt = this.formGroup.get('supplierId').value.filter(x => x.id != "all");
    this.formGroup.get('supplierId').patchValue(alldt);
  }

  changeStatus() {
    this.formGroup.get('Status').patchValue(this.formGroup.get('Status').value.filter(x => x != 'All'))
  }

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      agent_id: [''],
      agentfilter: [''],
      Status: [],
      supplierId: [''],
      supplierfilter: [''],
      From: [''],
      cityFilter: [''],
      FromDate: [''],
      ToDate: [''],
      date: [''],

    });

    this.formGroup.get('date').patchValue(dateRange.last3Month);
    this.updateDate(dateRange.last3Month)

    this.flighttabService.getSupplierBoCombo('Hotel').subscribe({
      next: (res) => {
        this.supplierListAll = res;
        this.SupplierList.push(...res);
      },
    });

    this.formGroup.get('supplierfilter').valueChanges.subscribe(data => {
      this.SupplierList = this.supplierListAll
      this.SupplierList = this.supplierListAll.filter(x => x.company_name.toLowerCase().includes(data.toLowerCase()));
    })

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
          return this.agentService.getAgentComboMaster(value, true);
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
      this.formGroup.get('Status').patchValue(this.record.Status ?? []);
      this.formGroup.get('supplierId').patchValue(this.record.supplierId);
    }

  }

  public compareWith(v1: any, v2: any) {
    return v1 && v2 && v1.id === v2.id;
  }



  apply(){

    const json = this.formGroup.getRawValue();
    json.supplierId = json.supplierId
    json.Status = json.Status

    // json['FromDate']= DateTime.fromISO(this.formGroup.get('FromDate').value).toFormat('yyyy-MM-dd');
    // json['ToDate']= DateTime.fromISO(this.formGroup.get('ToDate').value).toFormat('yyyy-MM-dd');
    json.FromDate = new Date(this.formGroup.get('FromDate').value)
    json.ToDate = new Date(this.formGroup.get('ToDate').value)
    this.matDialogRef.close(json);

  }



  resetForm() {
    // var date = new Date()
    // date.setDate(1)
    // date.setMonth(date.getMonth());

    this.formGroup.reset();
    this.formGroup.get('date').patchValue(dateRange.last3Month);
    this.formGroup.get("agent_id").patchValue(this.agentList[0]);
    this.formGroup.get('FromDate').patchValue(this.FromDate);
    this.formGroup.get('ToDate').patchValue(this.ToDate);
    this.formGroup.get("supplierId").patchValue([this.allVal]);
    this.formGroup.get('Status').patchValue([this.allValStatus]);
  }

  public updateDate(event: any): void {

    if (event === dateRange.today) {
      this.FromDate = new Date();
      this.ToDate = new Date();
      this.FromDate.setDate(this.FromDate.getDate());
      this.formGroup.get('FromDate').patchValue(this.FromDate);
      this.formGroup.get('ToDate').patchValue(this.ToDate);
    }
    else if (event === dateRange.last3Days) {
      this.FromDate = new Date();
      this.ToDate = new Date();
      this.FromDate.setDate(this.FromDate.getDate() - 3);
      this.formGroup.get('FromDate').patchValue(this.FromDate);
      this.formGroup.get('ToDate').patchValue(this.ToDate);
    }
    else if (event === dateRange.lastWeek) {
      this.FromDate = new Date();
      this.ToDate = new Date();
      const dt = new Date(); // current date of week
      const currentWeekDay = dt.getDay();
      const lessDays = currentWeekDay === 0 ? 6 : currentWeekDay - 1;
      const wkStart = new Date(new Date(dt).setDate(dt.getDate() - lessDays));
      const wkEnd = new Date(new Date(wkStart).setDate(wkStart.getDate() + 6));

      this.FromDate = wkStart;
      this.ToDate = new Date();
      this.formGroup.get('FromDate').patchValue(this.FromDate);
      this.formGroup.get('ToDate').patchValue(this.ToDate);
    }
    else if (event === dateRange.lastMonth) {
      this.FromDate = new Date();
      this.ToDate = new Date();
      this.FromDate.setDate(1);
      this.FromDate.setMonth(this.FromDate.getMonth());
      this.formGroup.get('FromDate').patchValue(this.FromDate);
      this.formGroup.get('ToDate').patchValue(this.ToDate);
    }
    else if (event === dateRange.last3Month) {
      this.FromDate = new Date();
      this.ToDate = new Date();
      this.FromDate.setDate(1);
      this.FromDate.setMonth(this.FromDate.getMonth() - 3);
      this.formGroup.get('FromDate').patchValue(this.FromDate);
      this.formGroup.get('ToDate').patchValue(this.ToDate);
    }
    else if (event === dateRange.last6Month) {
      this.FromDate = new Date();
      this.ToDate = new Date();
      this.FromDate.setDate(1);
      this.FromDate.setMonth(this.FromDate.getMonth() - 6);
      this.formGroup.get('FromDate').patchValue(this.FromDate);
      this.formGroup.get('ToDate').patchValue(this.ToDate);
    }
    else if (event === dateRange.setCustomDate) {
      this.FromDate = new Date();
      this.ToDate = new Date();
      this.formGroup.get('FromDate').patchValue(this.FromDate);
      this.formGroup.get('ToDate').patchValue(this.ToDate);
    }
  }

}
