import { CommonModule, NgClass, NgFor, NgIf, UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer } from '@angular/platform-browser';
import { AirlineDashboardService } from 'app/services/airline-dashboard.service';
import { ToasterService } from 'app/services/toaster.service';

@Component({
  selector: 'app-fare-rule',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    UpperCasePipe,
    MatIconModule,
    MatTooltipModule,
    MatIconModule,
  ],
  templateUrl: './fare-rule.component.html',
})
export class FareRuleComponent {
  Data: any;
  destination: any;
  origin: any;
  fareRules: any;
  isFareRuleLoading: boolean = false
  isMoreShowFare: any;
  fareRuleData: any;
  newFare: any;

  constructor(
    public matDialogRef: MatDialogRef<FareRuleComponent>,
    private airlineDashboardService: AirlineDashboardService,
    private alertService: ToasterService,
    public sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public datas: any,
  ) {
    this.Data = datas.data;
    this.destination = datas.destination;
    this.origin = datas.origin;
  }

  ngOnInit(): void {
    this.loadFareRules();
  }

  loadFareRules(isMiniFareRule: boolean = true): void {
    const model = {
      traceId: this.Data.traceId,
      providerId: this.Data.provider_id_enc,
      resultIndex: this.Data.resultIndex,
      origin: this.origin,
      destination: this.destination,
      cachingFileName: this.Data.caching_file_name,
      searchFileName: this.Data.filename,
      is_mini_farerule: isMiniFareRule

    }
    this.isFareRuleLoading = true;
    this.airlineDashboardService.fareRules(model).subscribe({
      next: res => {
        this.fareRules = res.data;

        if (res && res.data) {
          let data = res.data;
          let parsedData = data.startsWith('{') ? JSON.parse(data) : null;

          // Determine whether the fare rule is from parsed data or raw data
          let fareContent = parsedData ? parsedData.data : data;
          this.isMoreShowFare = parsedData?.long_fare_rules_available || false;

          // Assign sanitized data based on the fare rule type
          const sanitizedData = this.sanitizer.bypassSecurityTrustHtml(fareContent);

          if (isMiniFareRule) {
            this.fareRuleData = sanitizedData;
          } else {
            this.newFare = sanitizedData;
          }
        }
        
        this.scrollToSection();


        this.isFareRuleLoading = false;
      }, error: (err) => {
        this.alertService.showToast('error', err);
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

}
