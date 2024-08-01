import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { dateRange } from 'app/common/const';
import { AgentService } from 'app/services/agent.service';
import { WalletService } from 'app/services/wallet.service';
import { CommonUtils } from 'app/utils/commonutils';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { filter, startWith, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-wallet-filter',
  templateUrl: './wallet-filter.component.html',
  styleUrls: ['./wallet-filter.component.scss'],
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
export class WalletFilterComponent {

  agentList: any[] = [];
  mopList: any[] = [];
  pspList: any[] = [];
  disableBtn: boolean = false

  DR = dateRange;
  public FromDate: any;
  public ToDate: any;
  public dateRanges = [];

  constructor(
    public matDialogRef: MatDialogRef<WalletFilterComponent>,
    private builder: FormBuilder,
    private walletService: WalletService,
    private agentService: AgentService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.dateRanges = CommonUtils.valuesArray(dateRange);
  }

  title = "Filter Criteria"
  btnLabel = "Apply"
  formGroup: FormGroup;

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      particularfilter: [''],
      particularId: [''],
      mop: [''],
      mopFilter: [''],
      psp: [''],
      pspFilter: [''],
      date: [''],
      FromDate: [''],
      ToDate: [''],
    });

    this.formGroup.get('date').patchValue(dateRange.lastMonth);
    this.updateDate(dateRange.lastMonth)

    this.formGroup.get('particularfilter')
      .valueChanges.pipe(
        filter((search) => !!search),
        startWith(''),
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((value: any) => {
          return this.agentService.getAgentCombo(value);
        })
      ).subscribe({
        next: data => {
          this.agentList = data
        }
      });

    this.formGroup.get('mopFilter').valueChanges.pipe(
      filter((search) => !!search),
      startWith(''),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((value: any) => {
        return this.walletService.getModeOfPaymentCombo(value);
      })
    ).subscribe({
      next: data => {
        this.mopList = data
      }
    });

    this.formGroup.get('pspFilter').valueChanges.pipe(
      filter((search) => !!search),
      startWith(''),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((value: any) => {
        return this.walletService.getPaymentGatewayCombo(value);
      })
    ).subscribe({
      next: data => {
        this.pspList = data
      }
    });

    this.formGroup.patchValue(this.data);
    this.formGroup.get('particularfilter').patchValue(this.data.agency_name)
    this.formGroup.get('particularId').patchValue({ agency_name: this.data.agency_name, id: this.data.particularId })
    this.formGroup.get('mopFilter').patchValue(this.data.mop)
    this.formGroup.get('mop').patchValue(this.data.mop)
    this.formGroup.get('pspFilter').patchValue(this.data.psp)
    this.formGroup.get('psp').patchValue(this.data.psp)
  }

  apply(): void {
    var json = this.formGroup.getRawValue();
    json.agency_name = json.particularId.agency_name;
    json.particularId = json.particularId.id;
    this.matDialogRef.close(json);
  }

  public compareWith(v1: any, v2: any) {
    return v1 && v2 && v1.id === v2.id;
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

  cancle() {
    this.formGroup.get('date').patchValue('Today');
    this.updateDate(this.formGroup.get('date').value);
  }

}
