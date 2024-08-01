import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
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
import { AmendmentRequestsListComponent } from 'app/modules/booking/amendment-requests-list/amendment-requests-list.component';
import { FlightTabService } from 'app/services/flight-tab.service';
import { ToasterService } from 'app/services/toaster.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
  selector: 'app-amendment-request',
  templateUrl: './amendment-request.component.html',
  styleUrls: ['./amendment-request.component.scss'],
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
  ]
})
export class AmendmentRequestComponent {

  TypesList: any[] = [];
  allTypes:any[] = [];
  amendmentType:any;
  amendmentfilter:string= '';
  seg:boolean=false;
  seg1:boolean=false;
  title: string= 'Mr';
  firstName: string= '';
  lastName:string= '';
  note:string='';
  is_manual_entry:boolean=false;
  amendmentData:any;
  formDataList:any[] = [];
  segmentsData:any[]=[];
  old_date:any;
  new_date:any;
  cancellationQuotation:boolean = false;
  instantCancellation:boolean = false;
  fullRefund:boolean = false;
  reissueQuotation:boolean = false;
  Miscellaneous:boolean = false;
  noShow:boolean = false;
  Void:boolean = false;
  Correction:boolean = false;
  wheelChair:boolean = false;
  Meal:boolean = false;
  Baggage:boolean = false;
  readonly:boolean = false;

  showpax:boolean=false;
  shownamefields:boolean=false;
  showdate:boolean=false;
  showbaggage:boolean=false;
  showInfo:boolean=false;
  showName:boolean=false;
  showcorrection:boolean=false;
  selectedSegments:any[]=[];
  is_partial_pax:Boolean=false;
  is_partial_seg:Boolean=false;

  titles: any[] = [
    {value: 'Mr', viewValue: 'Mr'},
    {value: 'Ms', viewValue: 'Ms'},
    {value: 'Mrs', viewValue: 'Mrs'},
  ];

  Baggages: any[] = [
    {value: 'No Baggage', viewValue: 'No Baggage'},
    {value: '5 KG', viewValue: '5 KG'},
    {value: '10 KG', viewValue: '10 KG'},
    {value: '15 KG', viewValue: '15 KG'},
    {value: '20 KG', viewValue: '20 KG'},
    {value: '25 KG', viewValue: '25 KG'},
    {value: '30 KG', viewValue: '30 KG'},
  ];
  segmentdis: boolean=false;
  paxdis: boolean=false;
  selectedSegmentIds: any[]=[];
  Loading:boolean=false;
  data: any;
  departuteDate: any;
  todayDate:Date=new Date();

  constructor(
    public matDialogRef: MatDialogRef<AmendmentRequestComponent>,
    private builder: FormBuilder,
    private flighttabService: FlightTabService,
    private alertService:ToasterService,
    @Inject(MAT_DIALOG_DATA) public datas: any = {}
  ) {
    this.data = datas.booking_id;
    this.departuteDate = datas.departuteDate;
  }

  ngOnInit(): void {
    this.flighttabService.getAmendmentTypes(this.data).subscribe((res) => {
      this.TypesList = res;
      this.allTypes = res;
      this.amendmentType = this.TypesList[0];
      const departureDateObj = new Date(this.departuteDate);
      if (departureDateObj > this.todayDate) {
          this.TypesList = this.TypesList.filter(type => type !== 'No Show');
      }
    });

    this.Loading = true;
    const id = this.data;
    this.flighttabService.amendmentInitiate(id).subscribe((res) => {
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
        if(this.segmentsData.length < 2) {
          this.segmentdis = true;
        } 
      this.segment();
      this.old_date = res.data.booking_date;
      this.new_date = res.data.booking_date;

      let travellerForm: travellerDTO[] = []

      for (let i = 0; i < res.data.traveller.length; i++){
        const traveller = new travellerDTO();
        travellerForm.push(traveller);
      }

      this.formDataList = [...travellerForm];

      for (let i = 0; i < res.data.traveller.length; i++) {
        const re = res.data.traveller[i];
        this.formDataList[i].id = re.id;
        this.formDataList[i].prefix = re.prefix;
        this.formDataList[i].first_name = re.first_name;
        this.formDataList[i].last_name = re.last_name;
        this.formDataList[i].old_name = re.prefix + ' ' + re.first_name + ' ' + re.last_name;
      }

      this.formDataList[0].pax = true;
      if(this.formDataList.length < 2) {
        this.paxdis = true;
      } 
      this.selectedType(this.TypesList[0]);
    });
  }

  filterTypes(value: string) {
    const Types = this.allTypes.filter(x => 
      x.toLowerCase().includes(value.toLowerCase())
    );
    this.TypesList = Types;
  }

  selectedType(v):void {
    if(v === 'Cancellation Quotation') {
      this.cancellationQuotation = true;
      this.showpax=true; this.shownamefields=true; this.showdate=false; this.readonly=true;
      this.showbaggage=false; this.showInfo=false; this.showName=false; this.showcorrection=false;
    } else if(v === 'Instant Cancellation') {
      this.instantCancellation = true;
      this.showpax=true; this.shownamefields=true; this.showdate=false; this.readonly=true;
      this.showbaggage=false; this.showInfo=true; this.showName=false; this.showcorrection=false;
    }else if(v === 'Full Refund') {
      this.fullRefund = true;
      this.showpax=true; this.shownamefields=true; this.showdate=false; this.readonly=true;
      this.showbaggage=false; this.showInfo=false; this.showName=false; this.showcorrection=false;
    }else if(v === 'Reissue Quotation') {
      this.reissueQuotation = true;
      this.showpax=true; this.shownamefields=true; this.showdate=true; this.readonly=true;
      this.showbaggage=false; this.showInfo=true; this.showName=false; this.showcorrection=false;
    }else if(v === 'Miscellaneous Quotation') {
      this.Miscellaneous = true;
      this.showpax=true; this.shownamefields=true; this.showdate=false; this.readonly=true;
      this.showbaggage=false; this.showInfo=false; this.showName=false; this.showcorrection=false;
    }else if(v === 'No Show') {
      this.noShow = true;
      this.showpax=true; this.shownamefields=true; this.showdate=false; this.readonly=true;
      this.showbaggage=false; this.showInfo=false; this.showName=false; this.showcorrection=false;
    }else if(v === 'Void') {
      this.Void = true;
      this.showpax=true; this.shownamefields=true; this.showdate=false; this.readonly=true;
      this.showbaggage=false; this.showInfo=false; this.showName=false; this.showcorrection=false;
    }else if(v === 'Correction Quotation') {
      this.Correction = true;
      this.showpax=true; this.shownamefields=true; this.showdate=false; this.readonly=false;
      this.showbaggage=false; this.showInfo=true; this.showName=true; this.showcorrection=true;
    }else if(v === 'Wheel Chair Request') {
      this.wheelChair = true;
      this.showpax=true; this.shownamefields=true; this.showdate=false; this.readonly=true;
      this.showbaggage=false; this.showInfo=false; this.showName=false; this.showcorrection=false;
    }else if(v === 'Meal Quotation(SSR)') {
      this.Meal = true;
      this.showpax=true; this.shownamefields=true; this.showdate=false; this.readonly=true;
      this.showbaggage=false; this.showInfo=false; this.showName=false; this.showcorrection=false;
    }else if(v === 'Baggage Quotation(SSR)') {
      this.Baggage = true;
      this.showpax=true; this.shownamefields=false; this.showdate=false; this.readonly=true;
      this.showbaggage=true; this.showInfo=true; this.showName=true; this.showcorrection=false;
    }

    if(v === 'Void'){
      this.segmentsData.forEach(x => x.is_selected = true);
      this.formDataList.forEach(x => x.pax = true);
      this.segmentdis = true;
      this.paxdis = true;
    }else {
      this.segmentsData.forEach(x => x.is_selected = false);
      this.formDataList.forEach(x => x.pax = false);
      if (this.segmentsData && this.segmentsData.length > 0)
      this.segmentsData[0].is_selected = true;
      if (this.formDataList && this.formDataList.length > 0)
      this.formDataList[0].pax = true;
      if(this.segmentsData.length < 2) {
        this.segmentdis = true;
      } 
      if(this.formDataList.length < 2) {
        this.paxdis = true;
      } 
    }
  }

  onFileSelected(event: any,i) {
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
        this.alertService.showToast('success','document uploaded.')
      };
  
      reader.readAsDataURL(file);
    }
  }

  segment():void {
    const segment = this.segmentsData.filter(x => x.is_selected).map(x => x.id)
    this.selectedSegments = segment;
    const segmentIds = this.segmentsData.filter(x => x.is_selected).map(x => x.ids.split(','));
    this.selectedSegmentIds = [].concat(...segmentIds);
  }

  request():void {
    let selectedPax:any[]=[];
    for (let fd of this.formDataList) {
      if(fd.pax === true) {
        selectedPax.push(fd)
      }
    }

    if(this.segmentsData.length != this.selectedSegments.length) {
      this.is_partial_seg = true;
    }
    if (this.formDataList.length != selectedPax.length) {
        this.is_partial_pax = true;
    }
    
    const json = {
      id:'',
      booking_id:this.data,
      amendment_type:this.amendmentType,
      agent_remark:this.note,
      is_manual_entry:this.is_manual_entry,
      segments:this.selectedSegments,
      old_date:this.old_date || '',
      new_date:this.new_date || '',
      is_partial_seg:this.is_partial_seg,
      is_partial_pax:this.is_partial_pax,
      segmentIds:this.selectedSegmentIds,
      pax:[],
    }

    for (let fd of this.formDataList) {
      if(fd.pax === true) {
        if(json.amendment_type === 'Correction Quotation') {
          if(!fd.file) {
            this.alertService.showToast('error', 'Please Upload the file!');
            return;
          }
        }
        json.pax.push({ 
          id:fd.id,
          old_name:fd.old_name,
          title:fd.prefix,
          first_name:fd.first_name,
          last_name:fd.last_name,
          document:fd.document,
          is_wheel_chair: json.amendment_type === 'Wheel Chair Request'? true:false,
          is_meal: json.amendment_type === 'Meal Quotation(SSR)'? true:false,
          extra_baggage:fd.Baggage
         });
      }
    }

    if(json.segments.length < 1) {
      this.alertService.showToast('error','Please select minimum one segment!');
      return;
    }

    this.flighttabService.CreateAmendment(json).subscribe({
      next: (res) => {
        // Swal.fire('Request sent!', res.msg, 'success')
        this.alertService.showToast('success', 'Request sent!');
        this.matDialogRef.close(true);
      },error:(err) => {
        this.alertService.showToast('error', err);
      }
    });
  }

}

class travellerDTO {
  pax:boolean;
  first_name: string = '';
  last_name:string = '';
  prefix:string = '';
  id:string ='';
  Baggage:string='No Baggage';
  document:any;
  old_name:any='';
  file:any;
}
