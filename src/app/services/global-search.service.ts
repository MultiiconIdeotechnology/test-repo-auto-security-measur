import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, of } from 'rxjs';
import { ItemService } from './item.service';
import { ProductService } from './product.service';

@Injectable({
    providedIn: 'root'
})
export class GlobalSearchService {
    itemList:any = [];
    productList:any = []
    constructor(
        private http: HttpClient,
        private itemService: ItemService,
        private productService: ProductService
    ) { }
    private baseUrl = environment.apiUrl;

    getInputDetails(query: any): Observable<any> {
        return this.http.post<any[]>(`${this.baseUrl}GlobalSearch/getValuesGlobleSearch`, query);
    }

    getItemList(){
        let obj = {skip:0, take:0, orderDirection: 1}
        this.itemService.getItemMasterList(obj).subscribe({
            next: data => {
              this.itemList = data.data;

              for(let i in this.itemList){
                 this.itemList[i]['itemInfo'] = `${this.itemList[i].item_code} (${this.itemList[i].item_name})`;
                 this.itemList[i].id_by_value = this.itemList[i].item_name;
              }
            }, error: err => {
                console.log("err", err)
            }
        })
    }

    getProductList(){
        let obj = {skip:0, take:0, orderDirection: 1}
        this.productService.getTecProductMasterList(obj).subscribe({
            next: data => {
              this.productList = data.data;

              for(let i in this.productList){
                this.productList[i]['productInfo'] = `${this.productList[i].product_name} (${this.productList[i].product_expiry})`;
                this.productList[i].id_by_value = this.productList[i].product_name;
             }
            }, error: err => {
                console.log("err", err)
            }
        })
    }

}
