import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { SidebarCustomModalService } from 'app/services/sidebar-custom-modal.service';

@Component({
  selector: 'app-psp-setup-zoom-in',
  standalone: true,
  imports: [
    CommonModule,
    FuseDrawerComponent,
  ],
  templateUrl: './psp-setup-zoom-in.component.html',
  styleUrls: ['./psp-setup-zoom-in.component.scss']
})
export class PspSetupZoomInComponent implements OnInit {


constructor(
      private sidenavService: SidebarCustomModalService,
){}

 ngOnInit():void {

   this.sidenavService.onModalChange().subscribe((res:any) => {

   })
 }

 ngOnDestroy(){

 }



}
