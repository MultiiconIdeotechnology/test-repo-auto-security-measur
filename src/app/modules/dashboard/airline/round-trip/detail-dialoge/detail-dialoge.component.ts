import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgClass, NgFor, NgIf, UpperCasePipe } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { AirlineDashboardService } from 'app/services/airline-dashboard.service';

@Component({
  selector: 'app-detail-dialoge',
  templateUrl: './detail-dialoge.component.html',
  styles: [`
  table, th, td {
      border: 1px solid var(--border-gray);
    }
  `],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    FormsModule,
    CommonModule,
    UpperCasePipe,
    ReactiveFormsModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatSliderModule,
    MatDatepickerModule,
  ]
})
export class DetailDialogeComponent {
  tab = 0;
  isFareRuleLoading: boolean;
  flight: any;
  searchFileName: any;
  nofares: boolean = false;
  SearchTravellClass: any;
  fareRuleData: SafeHtml;
  newFare: SafeHtml;
  showFare: any;


  constructor(
    public matDialogRef: MatDialogRef<DetailDialogeComponent>,
    private airlineDashboardService: AirlineDashboardService,
    public sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public datas: any,
  ) {

    this.SearchTravellClass = datas.travellClass
    this.flight = datas.data;
    this.searchFileName = datas.searchFileName;
    if (datas.nofares)
      this.nofares = true;
  }

  tabChanged(tab: number, flight): void {
    this.tab = tab;

    if (tab === 3 && !flight.fareRules) {
      this.loadFareRules(flight)
    }
  }

  loadFareRules(flight, isMiniFareRule: boolean = true): void {

    const model = {
      traceId: flight.traceId,
      providerId: flight.provider_id_enc,
      resultIndex: flight.resultIndex,
      origin: flight.origin,
      destination: flight.destination,
      cachingFileName: flight.caching_file_name,
      searchFileName: this.searchFileName,
      is_mini_farerule: isMiniFareRule
    }
    this.isFareRuleLoading = true;

    this.airlineDashboardService.fareRules(model).subscribe({
      next: res => {
        flight.fareRules = res.data;

        if (res && res.data) {
          let data = res?.data.trim();

          if (data.startsWith('{')) {
            let fareData = JSON.parse(data);
            flight.isMoreShowFare = fareData.long_fare_rules_available;

            const sanitizedData = fareData?.data?.trim() ? this.sanitizer.bypassSecurityTrustHtml(fareData.data) : "";

            if (isMiniFareRule) {
              flight.fareRuleData = sanitizedData;
            } else {
              flight.newFare = sanitizedData;
            }

          } else {
            const sanitizedData = data ? this.sanitizer.bypassSecurityTrustHtml(data) : "";

            if (isMiniFareRule) {
              flight.fareRuleData = sanitizedData;
            } else {
              flight.newFare = sanitizedData;
            }
          }
        }
        this.scrollToSection();

        this.isFareRuleLoading = false;
      }, error: err => {
        this.isFareRuleLoading = false;
      }
    })
  }

  scrollToSection() {
    setTimeout(() => {
      const section = document.getElementById('newFareId');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  }

  isSamePlanes(plan1, plan2): boolean {
    return `${plan1.airlineCode}${plan1.fareClass}${plan1.flightNumber}` === `${plan2.airlineCode}${plan2.fareClass}${plan2.flightNumber}`
  }

}
