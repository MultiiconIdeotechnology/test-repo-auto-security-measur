import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlightTabService } from 'app/services/flight-tab.service';
import { ToasterService } from 'app/services/toaster.service';
import { Linq } from 'app/utils/linq';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-amendment-request',
  templateUrl: './amendment-request.component.html',
  styleUrls: ['./amendment-request.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    DatePipe,
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatDatepickerModule,
    NgxMatSelectSearchModule,
    MatSlideToggleModule,
    NgxMatTimepickerModule,
    MatTooltipModule,
  ]
})
export class AmendmentRequestComponent {

  TypesList: any[] = [];
  allTypes: any[] = [];
  amendmentType: any;
  amendmentfilter: string = '';
  title: string = 'Mr';
  is_manual_entry: boolean = false;
  is_flight_cancelled:boolean = false;
  note: string = '';
  amendmentData: any;
  formDataList: any[] = [];
  segmentsData: any[] = [];
  reissueQuotationList: any[] = [];

  showInfo: boolean = false;
  isInternationalreturn: boolean = false;
  isRequestSent: boolean = false;
  duplicatedTravellers: any = [];
  old_date: any;
  new_date: any;
  new_date_time: any;

  titles: any[] = [
    { value: 'Mr', viewValue: 'Mr' },
    { value: 'Ms', viewValue: 'Ms' },
    { value: 'Mrs', viewValue: 'Mrs' },
  ];

  Baggages: any[] = [
    { value: 'No Baggage', viewValue: 'No Baggage' },
    { value: '5 KG', viewValue: '5 KG' },
    { value: '10 KG', viewValue: '10 KG' },
    { value: '15 KG', viewValue: '15 KG' },
    { value: '20 KG', viewValue: '20 KG' },
    { value: '25 KG', viewValue: '25 KG' },
    { value: '30 KG', viewValue: '30 KG' },
  ];
  paxdis: boolean = false;
  Loading: boolean = false;
  data: any;
  departuteDate: any;
  todayDate: Date = new Date();

  constructor(
    public matDialogRef: MatDialogRef<AmendmentRequestComponent>,
    private bookingService: FlightTabService,
    private alertService: ToasterService,
    @Inject(MAT_DIALOG_DATA) public datas: any = {}
  ) {
    this.data = datas.booking_id;
    this.departuteDate = datas.departuteDate;
    this.isInternationalreturn = datas.isInternationalreturn;
  }

  ngOnInit(): void {
    this.bookingService.getAmendmentTypes(this.data).subscribe((res) => {
      this.allTypes = res;
      if (this.datas && this.datas.isInstantCancalation) {
        this.amendmentType = 'Instant Cancellation';
        this.TypesList = res;
      } else {
        this.TypesList = res.filter((type: any) => type !== 'Instant Cancellation');
        this.amendmentType = this.TypesList[0];
      }
      const departureDateObj = new Date(this.departuteDate);
      if (departureDateObj > this.todayDate) {
        this.TypesList = this.TypesList.filter(type => type !== 'No Show');
      }
    });

    this.Loading = true;
    const id = this.data;
    this.bookingService.amendmentInitiate(id).subscribe((res) => {
      this.amendmentData = res.data;
      if (this.amendmentData.booking_date) {
        const bookingDateTime = new Date(this.amendmentData.booking_date);
        const bookingHour = bookingDateTime.getHours();
        if (bookingHour > 23) {
          this.TypesList = this.TypesList.filter(type => type !== 'Void');
        }
      }

      this.segmentsData = res.data.segments;
      this.Loading = false;
      this.segmentsData[0].is_selected = true;

      let travellerForm: travellerDTO[] = []

      for (let i = 0; i < res.data.traveller.length; i++) {
        const traveller = new travellerDTO();
        travellerForm.push(traveller);
      }

      this.formDataList = [...travellerForm];

      for (let i = 0; i < res.data.traveller.length; i++) {
        const re = res.data.traveller[i];
        this.formDataList[i].id = re.id;
        this.formDataList[i].prefix = re.prefix;
        this.formDataList[i].isPaxDisabled = false;
        this.formDataList[i].first_name = re.first_name;
        this.formDataList[i].last_name = re.last_name;
        this.formDataList[i].old_name = re.prefix + ' ' + re.first_name + ' ' + re.last_name;
      }
      this.old_date = res.data.booking_date;
      this.new_date = res.data.booking_date;
      this.new_date_time = DateTime.fromISO(res.data.booking_date).toFormat('HH:mm').toString();

      // if (this.formDataList.length < 2) {
      //     this.paxdis = true;
      // }

      // IS Segment wise data dublict
      for (let i = 0; i < this.segmentsData.length; i++) {
        var tempSegment = this.segmentsData[i];

        this.formDataList.forEach(traveller => {
          const duplicatedTraveller = {
            ...traveller,
            destination: tempSegment.destination,
            origin: tempSegment.origin,
            isReturn: tempSegment.isReturn,
            is_selected: tempSegment.is_selected,
            segments_id: tempSegment.id,
            isPaxDisabled: false,
          };
          if (!traveller?.cancelledData?.some(x => x.segment_id == tempSegment.id))
            this.duplicatedTravellers.push(duplicatedTraveller);
        });
      }
      this.formDataList = JSON.parse(JSON.stringify(this.duplicatedTravellers));
      var tempFromList = Linq.groupBy(this.formDataList, x => x.segments_id)
      this.reissueQuotationList = [];
      tempFromList.forEach(element => {

        var object = Object.assign({}, element.value[0], !element.value[0].isReturn ?
          { new_date: res.data.booking_date, new_date_time: DateTime.fromISO(res.data.booking_date).toFormat('HH:mm').toString(), old_date: res.data.booking_date } :
          { new_date: res.data.return_booking_date, new_date_time: DateTime.fromISO(res.data.return_booking_date).toFormat('HH:mm').toString(), old_date: res.data.return_booking_date }
        )
        this.reissueQuotationList.push(object)
      });
      this.selectedType(this.TypesList[0]);

    }, error => {
      this.Loading = false;
    });
  }

  filterTypes(value: string) {
    const Types = this.allTypes.filter(x =>
      x.toLowerCase().includes(value.toLowerCase())
    );
    this.TypesList = Types;
  }

  selectedType(v: any): void {
    if (v === 'Correction Quotation') {
      var data = Linq.groupBy(this.formDataList, x => x.id)
      this.formDataList = [];
      data.forEach(element => {
        this.formDataList.push(element.value[0])
      });
    } else {
      if (this.duplicatedTravellers && this.duplicatedTravellers.length) {
        this.formDataList = this.duplicatedTravellers;
      }
    }

    this.showInfo = false;
    if (v === 'Instant Cancellation' || v === 'Reissue Quotation' || v === 'Correction Quotation' || v === 'Baggage Quotation(SSR)') {
      this.showInfo = true;
    }

    if (v === 'Void') {
      this.segmentsData.forEach(x => x.is_selected = true);
      this.formDataList.forEach(x => x.pax = true);
      this.paxdis = true;
    } else {
      this.segmentsData.forEach(x => x.is_selected = false);
      this.formDataList.forEach(x => x.pax = false);
      this.paxdis = false;
      if (this.segmentsData && this.segmentsData.length > 0)
        this.segmentsData[0].is_selected = true;

      // if (this.formDataList && this.formDataList.length > 0)
      //     // this.formDataList[0].pax = true;
      // if (this.formDataList.length < 2) {
      //     this.paxdis = true;
      // } else {
      //     this.paxdis = false;
      // }
    }
  }

  onFileSelected(event: any, i: any) {
    const file: File = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        let base64 = reader.result?.toString() || '';

        if (!base64.startsWith('data:')) {
          base64 = `data:${file.type};base64,${base64}`;
        }

        const document = {
          fileName: file.name,
          fileType: file.type,
          base64: base64
        };

        this.formDataList[i].document = document;
        this.alertService.showToast('success', 'document uploaded.')
      };

      reader.readAsDataURL(file);
    }
  }

  // Send Request
  request(): void {
    this.isRequestSent = true
    const json = {
      id: '',
      booking_id: this.data,
      amendment_type: this.amendmentType,
      agent_remark: this.note,
      is_partial_seg: false,
      is_manual_entry: this.is_manual_entry,
    
      // old_date: this.old_date,
      // new_date: this.concatenateTime(this.new_date, this.new_date_time),
      trip_segments: [],
    }

    if(this.amendmentType == "Miscellaneous Quotation - Refund"){
      json['is_flight_cancelled'] = this.is_flight_cancelled;
    }


    for (let fd of this.formDataList) {
      if (fd.pax === true) {
        if (json.amendment_type === 'Correction Quotation') {
          if (!fd.file) {
            this.alertService.showToast('error', 'Please Upload Your Id Proof!');
            this.isRequestSent = false;
            return;
          }
        }
        var dateSegment = this.reissueQuotationList.find(x => x.segments_id == fd.segments_id);
        var oldDate = !this.isInternationalreturn ? this.old_date : dateSegment.old_date;
        var newDate = !this.isInternationalreturn ? this.concatenateTime(this.new_date, this.new_date_time) : this.concatenateTime(dateSegment.new_date, dateSegment.new_date_time)
      
        json.trip_segments.push({
          segment: fd.segments_id,
          old_date: oldDate,
          new_date: newDate,
          pax: {
            id: fd.id,
            old_name: fd.old_name,
            title: fd.prefix,
            first_name: fd.first_name,
            last_name: fd.last_name,
            document: fd.document || {},
            is_wheel_chair: json.amendment_type === 'Wheel Chair Request' ? true : false,
            is_meal: json.amendment_type === 'Meal Quotation(SSR)' ? true : false,
            extra_baggage: fd.baggage,

          }
        });
      }
    }

    if (json.trip_segments && !json.trip_segments.length) {
      this.alertService.showToast('error', 'Please select Pax!');
      this.isRequestSent = false;
      return;
    } else {
      if (this.segmentsData.length != json.trip_segments.length) {
        json.is_partial_seg = true;
      }
    }

    // return
    this.bookingService.CreateAmendment(json).subscribe({
      next: (res) => {
        Swal.fire('Request sent!', res.msg, 'success')
        // this.alertService.showToast('success', 'Your amendment request has been sent');
        this.isRequestSent = false;
        this.matDialogRef.close(true);
      }, error: (err) => {
        this.isRequestSent = false;
        this.alertService.showToast('error', err);
      }
    });
  }

  // Is Pax changes
  isPaxChange(event: any) {
    if (this.amendmentType === 'Reissue Quotation' && !this.isInternationalreturn) {
      this.formDataList.forEach((element) => {
        if (element.segments_id === event.segments_id) {
          element.isPaxDisabled = false;
        } else {
          element.pax = false;
          element.isPaxDisabled = true;
        }
      });

      const found = this.formDataList.find((element) => element.pax == true);
      if (!found) {
        this.formDataList.forEach(x => x.isPaxDisabled = false);
      }
    }
  }

  // Function to concatenate new_time in 24h format with booking_date
  concatenateTime(bookingDate: string, newTime: string): string {
    // Parse the booking date
    const date = DateTime.fromISO(bookingDate);

    // Parse the new time assuming it's in 24-hour format (e.g., "22:30" for 10:30 PM)
    const [newHour, newMinute] = newTime.split(':').map(Number);

    // Set the new time on the same date
    const updatedDate = date.set({ hour: newHour, minute: newMinute });

    // Handle the case where the new time causes the date to roll over
    const finalDate = updatedDate.toFormat('yyyy-MM-dd\'T\'HH:mm:ss');

    return finalDate;
  }
}

class travellerDTO {
  pax: boolean;
  first_name: string = '';
  last_name: string = '';
  prefix: string = '';
  id: string = '';
  baggage: string = 'No Baggage';
  document: any;
  old_name: any = '';
  file: any;
}