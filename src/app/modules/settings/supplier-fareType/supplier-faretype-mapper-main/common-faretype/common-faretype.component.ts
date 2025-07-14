import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-common-faretype',
  standalone: true,
  imports: [
    PrimeNgImportsModule
  ],
  templateUrl: './common-faretype.component.html',
  styleUrls: ['./common-faretype.component.scss']
})
export class CommonFaretypeComponent extends BaseListingComponent {
   @Input() isFilterShowCommonFarType: boolean;
   searchInputControlCommonFareType = new FormControl('');

   isLoading = false;

  constructor() {
    super('');
  }

  ngOnInit() {
  }

  refreshItems(event?: any): void {

  }

}
