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
import { ItemService } from 'app/services/item.service';
import { ToasterService } from 'app/services/toaster.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';

@Component({
  selector: 'app-item-entry',
  templateUrl: './item-entry.component.html',
  styleUrls: ['./item-entry.component.scss'],
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
export class ItemEntryComponent {

  disableBtn: boolean = false
  readonly: boolean = false;
  record: any = {};
  fieldList: {};

  codeList: any[] = [
    { value: '001', viewValue: '001 (B2C Web Portal)' },
    { value: '002', viewValue: '002 (B2C Mobile Portal)' },
    { value: '003', viewValue: '003 (B2C Android APP)' },
    { value: '004', viewValue: '004 (B2C IOS APP)' },
    { value: '005', viewValue: '005 (Web Portal)' },
    { value: '006', viewValue: '006 (B2B Android APP)' },
    { value: '007', viewValue: '007 (B2B IOS APP)' },
    { value: '008', viewValue: '008 (Whatsapp Service)' },
    { value: '009', viewValue: '009 (SMS Service)' },
    { value: '010', viewValue: '010 (SEO Package)' },
  ];

  itemList: any[] = [
    { value: 'B2C Web Portal', viewValue: 'B2C Web Portal' },
    { value: 'B2C Mobile Portal', viewValue: 'B2C Mobile Portal' },
    { value: 'B2C Android APP', viewValue: 'B2C Android APP' },
    { value: 'B2C IOS APP', viewValue: 'B2C IOS APP' },
    { value: 'B2B Web Portal', viewValue: 'B2B Web Portal' },
    { value: 'B2B Android APP', viewValue: 'B2B Android APP' },
    { value: 'B2B IOS APP', viewValue: 'B2B IOS APP' },
    { value: 'Whatsapp Service', viewValue: 'Whatsapp Service' },
    { value: 'SMS Service', viewValue: 'SMS Service' },
  ];

  constructor(
    public matDialogRef: MatDialogRef<ItemEntryComponent>,
    private builder: FormBuilder,
    private matSnackBar: MatSnackBar,
    private itemService: ItemService,
    private alertService: ToasterService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data?.data ?? {}
  }

  formGroup: FormGroup;
  title = "Create Item"
  btnLabel = "Create"

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id:[''],
      item_code: [''],
      item_name: [''],
      is_auto_enabled: [false]
    });

    this.formGroup.get('item_code').patchValue('001')
    // this.formGroup.get('item_name').patchValue('B2C Web Portal')
    // this.formGroup.get('item_name').patchValue('B2C Web Portal')

    if(this.record.id){
      this.formGroup.patchValue(this.record);
      this.btnLabel = 'Save'
      this.title = "Modify Item"
    }
  }

  submit(): void {
    if (!this.formGroup.valid) {
      this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.formGroup.markAllAsTouched();
      return;
    }

    this.disableBtn = true;
    const json = this.formGroup.getRawValue();
    this.itemService.create(json).subscribe({
      next: () => {
        this.matDialogRef.close(true);
        this.disableBtn = false;
      }, error: (err) => {
        this.disableBtn = false;
        this.alertService.showToast('error', err, "top-right", true);
      }
    })
  }

}
