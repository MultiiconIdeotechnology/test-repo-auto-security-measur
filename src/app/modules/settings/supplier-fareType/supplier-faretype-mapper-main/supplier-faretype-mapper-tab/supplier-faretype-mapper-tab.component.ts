import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-supplier-faretype-mapper-tab',
  standalone:true,
  imports:[
    PrimeNgImportsModule
  ],
  templateUrl: './supplier-faretype-mapper-tab.component.html',
  styleUrls: ['./supplier-faretype-mapper-tab.component.scss']
})
export class SupplierFaretypeMapperTabComponent extends BaseListingComponent {
  @Input() isFilterShowSupplierFareType: boolean;
  searchInputControlSupplierFareTypeMapper = new FormControl('');

  isLoading = false;

  constructor() { 
    super('');
  }

  ngOnInit() {
  }


   refreshItems(event?: any): void {
       
    }

}
