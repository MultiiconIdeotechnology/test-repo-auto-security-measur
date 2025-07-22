import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { KycDocumentService } from 'app/services/kyc-document.service';
import { SupplierService } from 'app/services/supplier.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { debounceTime, distinctUntilChanged, filter, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-profile-airline',
  templateUrl: './profile-airline.component.html',
  styleUrls: ['./profile-airline.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    MatSelectModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatButtonModule,
    CommonModule,
    PrimeNgImportsModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    NgxMatSelectSearchModule

  ]
})
export class ProfileAirlineComponent {
  airlineForm: FormGroup;

  globalFilter: string = '';
  SupplierList: any[] = [];

  dataList = [
    { supplier: 'IndiGo', usertype: 'Agent', isEnable: true, triptype: 'One-Way' },
    { supplier: 'Air India', usertype: 'Admin', isEnable: false, triptype: 'Round-Trip' },
    { supplier: 'SpiceJet', usertype: 'Agent', isEnable: true, triptype: 'Multi-City' }
    // add more mock or API data
  ];

  searchText = '';

  constructor(
    private formBuilder: FormBuilder,
    private supplierService: SupplierService
  ) {

  }

  ngOnInit(): void {
    this.airlineForm = this.formBuilder.group({
      id: [''],
      service:['',Validators.required],
      supplier_id: [''],
      supplierFilter: ['',Validators.required],
      dropdown1: [''],
      dropdown2: [''],
      dropdown3: [''],
      dropdown4: [''],
      dropdown5: [''],
      dropdown6: [''],
      dropdown7: [''],
      dropdown8: [''],
      dropdown9: [''],
      dropdown10: [''],
      dropdown11: [''],
      dropdown12: [''],
      dropdown13: [''],
      dropdown14: [''],
      dropdown15: [''],
      dropdown16: [''],
    });

    this.supplierCombo();
  }

  supplierCombo() {
    //supplier combo
    this.airlineForm
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
          // this.airlineForm
          //   .get('supplier_id')
          //   .patchValue(this.SupplierList[0].id);
        },
      });
  }


  public compareWith(v1: any, v2: any) {
    return v1 && v2 && v1.id === v2.id;
  }

  onRefresh(): void {
    this.globalFilter = '';
    // optionally re-fetch API here
  }

}
