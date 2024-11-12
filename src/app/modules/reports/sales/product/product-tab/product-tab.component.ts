import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';

@Component({
    selector: 'app-product-tab',
    standalone: true,
    imports: [MatTabsModule, CommonModule],
    templateUrl: './product-tab.component.html'
})
export class ProductTabComponent {

    @Input() activeTab: any;

    constructor(private router: Router) { }

    public tabChanged(event: any): void {
        if (event?.index == 1) {
            this.router.navigateByUrl('/reports/products/collection');
        } else if (event?.index == 2) {
            this.router.navigateByUrl('/reports/products/receipts');
        } else {
            this.router.navigateByUrl('/reports/products');
        }
    }

}