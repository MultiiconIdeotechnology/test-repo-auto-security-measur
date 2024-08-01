import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe, CommonModule, UpperCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { AgentService } from 'app/services/agent.service';
import { FlightTabService } from 'app/services/flight-tab.service';
import { ProductFixDepartureService } from 'app/services/product-fix-departure.service';
import { SupplierService } from 'app/services/supplier.service';
import { ToasterService } from 'app/services/toaster.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ReplaySubject, filter, startWith, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-import-pnr',
  templateUrl: './import-pnr.component.html',
  styleUrls: ['./import-pnr.component.scss'],
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
    MatSlideToggleModule,
    MatChipsModule,
    NgxMatSelectSearchModule,
    UpperCasePipe,
    RouterLink,
    FormsModule,
    CommonModule,
    MatRadioModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatDialogModule,
    MatTableModule,
    MatSliderModule,
    MatDatepickerModule,
    MatDatepickerModule,
  ],
})
export class ImportPnrComponent {

  SupplierList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
  agentList: any[] = [];
  selectedValue: string = '1';
  disableBtn: boolean = false;




  UserType: any[] = [
    { value: 'B2B', viewValue: 'B2B' },
    { value: 'B2C', viewValue: 'B2C' },
  ];

  constructor(
    public matDialogRef: MatDialogRef<ImportPnrComponent>,
    private builder: FormBuilder,
    private agentService: AgentService,
    private flighttabService: FlightTabService,
    protected alertService: ToasterService,
    private supplierService: SupplierService,
    private router: Router,
    private fixDepartureService: ProductFixDepartureService,
    private matDialog: MatDialog
  ) { }

  formGroup: FormGroup;
  btnLabel = 'Save';
  form = { additional: 0, discount: 0 }


  ngOnInit(): void {
    Object.assign(this.form);

    this.formGroup = this.builder.group({
      booking_id: [''],
      agent_id: [''],
      agentfilter: [''],
      provider_id: [''],
      supplierFilter: [''],
      user_type: [''],
      
    });

    this.formGroup.get('user_type').patchValue('B2B')

    /*************supplier combo**************/
    this.formGroup
      .get('supplierFilter')
      .valueChanges.pipe(
        filter((search) => !!search),
        startWith(''),
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((value: any) => {
          return this.supplierService.getSupplierComboOfflinePNR(value, 'Airline');
        })
      )
      .subscribe({
        next: (data) => {
          this.SupplierList = data;
          this.formGroup
            .get('provider_id')
            .patchValue(this.SupplierList[0].id);
        },
      });

    /*************Agent combo**************/
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
          this.formGroup.get("agent_id").patchValue(this.agentList[0].id);
        }
      });
  }

  increment(value): void {
    if (value == 'additional') {
      this.form.additional++;
    } else
      this.form.discount++;
  }

  decrement(value): void {
    if (value == 'additional') {
      this.form.additional > 0 ? this.form.additional-- : null;
    }
    else {
      this.form.discount > 0 ? this.form.discount-- : null;
    }
  }

  selectedvalue(): void {
    if (this.selectedValue === '1') {
    } else if (this.selectedValue === '2') {
    }
  }

  public compareWith(v1: any, v2: any) {
    return v1 && v2 && v1.id === v2.id;
  }

  submit() {
    if (!this.formGroup.valid) {
      this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.formGroup.markAllAsTouched();
      return;
    }

    const Fdata = this.formGroup.value
    Fdata['agent_id'] = this.formGroup.get('agent_id').value
    if (this.selectedValue === '1'){
      Fdata['additional_markup'] = Number(this.form.additional)
      Fdata['discount'] = 0
    }
    else{
      Fdata['discount'] = Number(this.form.discount)
      Fdata['additional_markup'] = 0
    }

      this.flighttabService.flightImportPNR(Fdata).subscribe({
        next: ( data:any) => {
            this.matDialogRef.close(true);
            this.disableBtn = false;
        },
        error: (err) => {
            this.disableBtn = false;
            this.alertService.showToast('error', err);
        },
    });
  }
}
