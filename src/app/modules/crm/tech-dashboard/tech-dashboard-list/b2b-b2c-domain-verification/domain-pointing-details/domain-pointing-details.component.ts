import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';

@Component({
  selector: 'app-domain-pointing-details',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    PrimeNgImportsModule
  ],
  templateUrl: './domain-pointing-details.component.html',
  styleUrls: ['./domain-pointing-details.component.scss']
})
export class DomainPointingDetailsComponent {

    constructor(
      public matDialogRef: MatDialogRef<DomainPointingDetailsComponent>,  
    ){
    }

    firstTableData = [
      { domain: "bontonholidays.com", recordType: "A", name: "@", value: "3.6.64.88", ttl: "1 Hour" },
      { domain: "www.bontonholidays.com", recordType: "Cname", name: "www", value: "@", ttl: "1 Hour" },
      { domain: "partner.bontonholidays.com", recordType: "Cname", name: "partner", value: "@", ttl: "1 Hour" },
      { domain: "www.partner.bontonholidays.com", recordType: "Cname", name: "www.partner", value: "@", ttl: "1 Hour" },
      { domain: "api.bontonholidays.com", recordType: "Cname", name: "api", value: "@", ttl: "1 Hour" }
    ];

    secondTableData = [
      { domain: "bontonholidays.com", recordType: "A", name: "bontonholidays.com", value: "3.6.64.88", ttl: "1 Hour" },
      { domain: "www.bontonholidays.com", recordType: "A", name: "www.bontonholidays.com", value: "3.6.64.88", ttl: "1 Hour" },
      { domain: "partner.bontonholidays.com", recordType: "A", name: "partner.bontonholidays.com", value: "3.6.64.88", ttl: "1 Hour" },
      { domain: "www.partner.bontonholidays.com", recordType: "A", name: "www.partner.bontonholidays.com", value: "3.6.64.88", ttl: "1 Hour" },
      { domain: "api.bontonholidays.com", recordType: "A", name: "api.bontonholidays.com", value: "3.6.64.88", ttl: "1 Hour" }
    ];
    
    

}
