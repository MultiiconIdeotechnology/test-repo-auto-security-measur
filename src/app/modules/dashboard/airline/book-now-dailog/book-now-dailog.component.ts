import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import { AirlineDashboardService } from 'app/services/airline-dashboard.service';
import { ToasterService } from 'app/services/toaster.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
  selector: 'app-book-now-dailog',
  standalone: true,
  templateUrl: './book-now-dailog.component.html',
  styleUrls: ['./book-now-dailog.component.css'],
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
    MatSnackBarModule,
    MatSlideToggleModule,
    NgxMatSelectSearchModule,
    MatTooltipModule,
    MatAutocompleteModule,
    RouterOutlet,
    MatOptionModule,
    MatDividerModule,
  ]
})
export class BookNowDailogComponent implements OnInit {

  record: any;
  flightData: any;
  supplier: any;
  isLoading: boolean = true;

  constructor(
    public matDialogRef: MatDialogRef<BookNowDailogComponent>,
    public formBuilder: FormBuilder,
    private airlineDashboardService: AirlineDashboardService,
    public alertService: ToasterService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data?.data
    this.supplier = data?.supplier
    console.log("this.record", this.record);

  }

  ngOnInit() {
    const model = {
      adult: this.record.adultCount,
      child: this.record.childCount,
      infant: this.record.infantCount,
      traceId: this.record.traceId,
      providerId: this.record.provider_id_enc,
      resultIndex: this.record.resultIndex,
      is_domestic: this.record.is_domestic,
      returnDate: this.record.returnDate || '',
      returnId: this.record.returnId || '',
      searchFileName: this.record.filename,
      cabin_class: this.record.cabin_class,
      returnProviderId: this.record.returnProviderId || '',
      returnTraceId: this.record.returnTraceId || '',
      ret_searchCachingFileName: this.record.return_caching_file_name,
      searchCachingFileName: this.record.caching_file_name,
      search_date_time: this.record.searchdateTime,
      response_date_time: null
    }
    this.airlineDashboardService.fareQuote(model).subscribe({
      next: res => {
        this.isLoading = false
        if (res.data) {
          this.flightData = res.data
        } else {
          if (res.error) {
            this.alertService.showToast('error', res.error);
          }
          this.matDialogRef.close()
        }
      }, error: (error) => {
        this.isLoading = false
        this.alertService.showToast('error', error);
        this.matDialogRef.close()
      }
    });
  }

}
