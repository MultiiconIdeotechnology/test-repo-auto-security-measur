import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { DatePipe, NgClass } from '@angular/common';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { RefferralService } from 'app/services/referral.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FuseConfirmationService } from '@fuse/services/confirmation';

@Component({
  selector: 'app-referral-list-spent-dialog',
  standalone: true,
  imports: [
    CommonModule,
    PrimeNgImportsModule,
    MatIconModule,
    DatePipe,
    NgClass,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule
  ],
  templateUrl: './referral-list-spent-dialog.component.html',
  styleUrls: ['./referral-list-spent-dialog.component.scss']
})
export class ReferralListSpentDialogComponent extends BaseListingComponent {
  formGroup !: FormGroup;
  dataList: any[] = [];
  sortColumn: string = "";
  record: any;
  reqData: any = {};
  originalDataList: any[] = [];
  isFilterShow: boolean = false;
  isLoading: boolean = false;

  constructor(
    public matDialogRef: MatDialogRef<ReferralListSpentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any = {},
    private referralService: RefferralService,
    public _filterService: CommonFilterService,
    private builder: FormBuilder,
    private confirmationService: FuseConfirmationService
  ) {
    super("");

    this.formGroup = this.builder.group({
      id: [''],
      campaignId: ['', Validators.required],
      spentOn: ['', Validators.required],
      spentAmount: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      remark: ['', Validators.required],
    });
  }

  ngOnInit(): void {
  }

  refreshItems(event?: any): void {
    this.isLoading = true;
    let payload = this.getNewFilterReq(event);
    // payload.id = this.data.id;
    this.referralService.getSpentList(payload).subscribe({
      next: (resp: any) => {
        this.dataList = resp;
        // this.dataList.forEach((item: any) => item.signup = new Date(item.signup))
        this.originalDataList = resp.data;
        this.totalRecords = resp?.total || resp?.data?.length;
        this.isLoading = false;
      },
      error: (err) => {
        this.alertService.showToast('error', err);
        this.isLoading = false;
      }
    });
  }

  onGlobalFilterSearch(val: any) {
    this.dataList = this.originalDataList.filter((item: any) =>
      JSON.stringify(item).toLowerCase().includes(val.toLowerCase())
    );
  }

  editRow(data: any): void {
    this.formGroup.patchValue({
      id: data?.id,
      campaignId: data?.campaign_id,
      spentOn: data?.spent_on,
      spentAmount: data?.spent_amount,
      startDate: new Date(data?.start_date),
      endDate: new Date(data?.end_date),
      remark: data?.remark
    });
  }

  deleteRow(data: any, index: any, formDirective: FormGroupDirective): void {
    this.confirmationService.open({
      title: 'Delete Row.',
      message: `Are you sure to delete Row?`,
    })
      .afterClosed().subscribe((res) => {
        if (res === 'confirmed') {
          if (data.id) {
            this.referralService.deleteSpentRowById(data.id).subscribe({
              next: () => {
                this.dataList.splice(index, 1);
                this.alertService.showToast('success', 'Row deleted successfully', 'top-right');
                formDirective.resetForm();
              },
              error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
              },

            })
          }
        }
      });
  }

  submit(formDirective: FormGroupDirective) {
    this.isLoading = true;
    const payloadData = this.formGroup.value;
    this.referralService.createSpent(payloadData).subscribe({
      next: (res) => {
        if (payloadData.id) {
          this.dataList.forEach((item: any, index: number) => {
            if (item.id == res.id) {
              this.dataList[index] = payloadData;
            }
          })

        } else {
          payloadData.id = res.id;
          this.formGroup.get('id').patchValue(res.id);
          this.dataList.push(payloadData);
          this.alertService.showToast('success', 'Pricing Saved successfully.');
          formDirective.resetForm();
        }
        this.isLoading = false;

      }, error: (err: any) => {
        this.alertService.showToast('error', err);
        this.isLoading = false;
      }
    });

  }


  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }
}
