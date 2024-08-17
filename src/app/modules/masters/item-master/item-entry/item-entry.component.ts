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
    { value: '011', viewValue: '011' },
    { value: '012', viewValue: '012' },
    { value: '013', viewValue: '013' },
    { value: '014', viewValue: '014' },
    { value: '015', viewValue: '015' },
    { value: '016', viewValue: '016' },
    { value: '017', viewValue: '017' },
    { value: '018', viewValue: '018' },
    { value: '019', viewValue: '019' },
    { value: '020', viewValue: '020' },
    { value: '021', viewValue: '021' },
    { value: '022', viewValue: '022' },
    { value: '023', viewValue: '023' },
    { value: '024', viewValue: '024' },
    { value: '025', viewValue: '025' },
    { value: '026', viewValue: '026' },
    { value: '027', viewValue: '027' },
    { value: '028', viewValue: '028' },
    { value: '029', viewValue: '029' },
    { value: '030', viewValue: '030' },
    { value: '031', viewValue: '031' },
    { value: '032', viewValue: '032' },
    { value: '033', viewValue: '033' },
    { value: '034', viewValue: '034' },
    { value: '035', viewValue: '035' },
    { value: '036', viewValue: '036' },
    { value: '037', viewValue: '037' },
    { value: '038', viewValue: '038' },
    { value: '039', viewValue: '039' },
    { value: '040', viewValue: '040' },
    { value: '041', viewValue: '041' },
    { value: '042', viewValue: '042' },
    { value: '043', viewValue: '043' },
    { value: '044', viewValue: '044' },
    { value: '045', viewValue: '045' },
    { value: '046', viewValue: '046' },
    { value: '047', viewValue: '047' },
    { value: '048', viewValue: '048' },
    { value: '049', viewValue: '049' },
    { value: '050', viewValue: '050' },
    { value: '051', viewValue: '051' },
    { value: '052', viewValue: '052' },
    { value: '053', viewValue: '053' },
    { value: '054', viewValue: '054' },
    { value: '055', viewValue: '055' },
    { value: '056', viewValue: '056' },
    { value: '057', viewValue: '057' },
    { value: '058', viewValue: '058' },
    { value: '059', viewValue: '059' },
    { value: '060', viewValue: '060' },
    { value: '061', viewValue: '061' },
    { value: '062', viewValue: '062' },
    { value: '063', viewValue: '063' },
    { value: '064', viewValue: '064' },
    { value: '065', viewValue: '065' },
    { value: '066', viewValue: '066' },
    { value: '067', viewValue: '067' },
    { value: '068', viewValue: '068' },
    { value: '069', viewValue: '069' },
    { value: '070', viewValue: '070' },
    { value: '071', viewValue: '071' },
    { value: '072', viewValue: '072' },
    { value: '073', viewValue: '073' },
    { value: '074', viewValue: '074' },
    { value: '075', viewValue: '075' },
    { value: '076', viewValue: '076' },
    { value: '077', viewValue: '077' },
    { value: '078', viewValue: '078' },
    { value: '079', viewValue: '079' },
    { value: '080', viewValue: '080' },
    { value: '081', viewValue: '081' },
    { value: '082', viewValue: '082' },
    { value: '083', viewValue: '083' },
    { value: '084', viewValue: '084' },
    { value: '085', viewValue: '085' },
    { value: '086', viewValue: '086' },
    { value: '087', viewValue: '087' },
    { value: '088', viewValue: '088' },
    { value: '089', viewValue: '089' },
    { value: '090', viewValue: '090' },
    { value: '091', viewValue: '091' },
    { value: '092', viewValue: '092' },
    { value: '093', viewValue: '093' },
    { value: '094', viewValue: '094' },
    { value: '095', viewValue: '095' },
    { value: '096', viewValue: '096' },
    { value: '097', viewValue: '097' },
    { value: '098', viewValue: '098' },
    { value: '099', viewValue: '099' },
    { value: '100', viewValue: '100' }
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
