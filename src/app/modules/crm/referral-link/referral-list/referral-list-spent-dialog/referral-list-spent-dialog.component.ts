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
import { OnlyFloatDirective } from '@fuse/directives/floatvalue.directive';

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
    MatDatepickerModule,
    OnlyFloatDirective
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
  entry_date_time: any = new Date();
  customScrollHeight: any;

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
      campaignId: [''],
      spentOn: ['', Validators.required],
      spentAmount: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      remark: ['', Validators.required],
    });
  }

  ngOnInit(): void {

    this.refreshItems()
  }

  refreshItems(event?: any): void {
    this.isLoading = true;
    let payload = this.getNewFilterReq(event);
    payload.id = this.data.id;
    this.referralService.getSpentList(payload).subscribe({
      next: (resp: any) => {
        this.dataList = resp;
        this.dataList.forEach((item: any) => {
          item.start_date = new Date(item.start_date);
          item.end_date = new Date(item.end_date);
          item.entry_date_time = new Date(item.entry_date_time);
        })
        this.originalDataList = resp;
        // for(let i = 0; i < 15; i++){
        //   this.originalDataList.push(resp[resp.length - 1])
        // }
        this.totalRecords = this.originalDataList?.length;
        if(this.dataList && this.dataList?.length){
          this.customScrollHeight = (window.innerHeight - 247 - 100) + 'px';
        }
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

    this.entry_date_time = data?.entry_date_time;
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
                this.totalRecords--;
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
    payloadData.campaignId = this.data?.id;
    this.referralService.createSpent(payloadData).subscribe({
      next: (res) => {
        if (payloadData.id) {
          this.dataList.forEach((item: any, index: number) => {
            if (item.id == res.record_id) {
              let tableData = this.convertPayload(payloadData);
              tableData['entry_date_time'] = this.entry_date_time;
              this.dataList[index] = tableData;
              formDirective.resetForm()
            }
          })

        } else {
          payloadData.id = res.record_id;
          this.formGroup.get('id').patchValue(res.record_id);
          let tableData = this.convertPayload(payloadData);
          tableData['entry_date_time'] = new Date();
          this.dataList.unshift(tableData);
          this.totalRecords++;
          this.alertService.showToast('success', 'Data Saved successfully.');
          formDirective.resetForm();
        }
        this.isLoading = false;

      }, error: (err: any) => {
        this.alertService.showToast('error', err);
        this.isLoading = false;
      }
    });

  }

  convertPayload(data: any) {
    return {
      id: data?.id,
      campaign_id: data?.campaignId,
      spent_on: data?.spentOn,
      spent_amount: data?.spentAmount,
      start_date: data?.startDate,
      end_date: data?.endDate,
      remark: data?.remark,
    };
  }


  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }
}
