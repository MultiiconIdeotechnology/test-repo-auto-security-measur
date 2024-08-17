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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProductService } from 'app/services/product.service';
import { ToasterService } from 'app/services/toaster.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';

@Component({
  selector: 'app-product-entry',
  templateUrl: './product-entry.component.html',
  styleUrls: ['./product-entry.component.scss'],
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
    MatDatepickerModule,
    MatSlideToggleModule,
    MatTooltipModule,
    NgxMatTimepickerModule,
    NgxMatSelectSearchModule,
    MatSnackBarModule,
  ]
})
export class ProductEntryComponent {

  disableBtn: boolean = false
  readonly: boolean = false;
  record: any = {};
  fieldList: {};

  itemListAll: any[] = [];
  itemList: any[] = [];



  expiryList: any[] = [
    { value: 'Monthly', viewValue: 'Monthly' },
    { value: 'Quarterly', viewValue: 'Quarterly' },
    { value: 'Six Months', viewValue: 'Six Months' },
    { value: 'Yearly', viewValue: 'Yearly' },
    { value: 'One Time', viewValue: 'One Time' },
  ];

  constructor(
    public matDialogRef: MatDialogRef<ProductEntryComponent>,
    private builder: FormBuilder,
    private matSnackBar: MatSnackBar,
    private productService: ProductService,
    private alertService: ToasterService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data?.data ?? {}
  }

  formGroup: FormGroup;
  title = "Create Product"
  btnLabel = "Create"

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      product_name: [''],
      itemfilter: [''],
      ItemId: [''],
      one_time_cost: [''],
      product_expiry: [''],
      // amc_amount: [''],
      max_installment: [''],
      product_remark: [''],
      // is_amc_required: [false]
    });

    this.formGroup.get('product_expiry').patchValue('Monthly')

    // this.productService.getItemMasterCombo(filter).subscribe({
    //   next: () => {
    //     this.matDialogRef.close(true);
    //     this.disableBtn = false;
    //   }, error: (err) => {
    //     this.disableBtn = false;
    //     this.alertService.showToast('error', err, "top-right", true);
    //   }
    // })

    this.productService.getItemMasterCombo().subscribe({
      next: (res) => {
        this.itemListAll = res;
        this.itemList.push(...res);
        // this.formGroup.get('supplier_id').patchValue(this.SupplierList.find(x => x.company_name.includes("All")).id)

      },
    });

    this.formGroup.get('itemfilter').valueChanges.subscribe(data => {
      this.itemList = this.itemListAll
      this.itemList = this.itemListAll.filter(x => x.item_name.toLowerCase().includes(data.toLowerCase()));
    })

    if(this.record){
      this.formGroup.get('ItemId').patchValue(this.record.count.map(x => ({

          "id": x.itemId,
          "item_code": x.item_code,
          "item_name": x.item_name

      })));

    }
    if(this.record.id){
      this.formGroup.patchValue(this.record);
      this.btnLabel = 'Save'
      this.title = "Modify Product"
    }
  }

  // vaalchange() {
  //   var alldt = this.formGroup.get('ItemId').value.filter(x => x.id != "all");
  //   this.formGroup.get('ItemId').patchValue(alldt);
  // }

  submit(): void {
    if (!this.formGroup.valid) {
      this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.formGroup.markAllAsTouched();
      return;
    }

    this.disableBtn = true;
    const json = this.formGroup.getRawValue();
    // json.ItemId = this.formGroup.get('ItemId').value.map(x => x.item_name)
    json.ItemId = Array.prototype.map.call(json.ItemId, (item: any) => { return item.id; }).join(",");

    // json.amc_amount = json.is_amc_required ? json.amc_amount : 0

    this.productService.create(json).subscribe({
      next: () => {
        this.matDialogRef.close(true);
        this.disableBtn = false;
      }, error: (err) => {
        this.disableBtn = false;
        this.alertService.showToast('error', err, "top-right", true);
      }
    })

  }

  public compareWith(v1: any, v2: any) {
    return v1 && v2 && v1.id === v2.id;
  }

}
