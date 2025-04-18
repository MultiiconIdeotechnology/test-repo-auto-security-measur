import { Component, OnInit,ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { SidebarCustomModalService } from 'app/services/sidebar-custom-modal.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSidenav } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PspSetupZoomInComponent } from './psp-setup-zoom-in/psp-setup-zoom-in.component';
import { PspSetupInfoComponent } from './psp-setup-info/psp-setup-info.component';
@Component({
  selector: 'app-psp-setup-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    FuseDrawerComponent,
    MatIconModule,
    MatButtonModule,
    PspSetupZoomInComponent,
    PspSetupInfoComponent,
  ],
  templateUrl: './psp-setup-sidebar.component.html',
  styleUrls: ['./psp-setup-sidebar.component.scss']
})
export class PspSetupSidebarComponent {
  private destroy$ = new Subject<void>();
  @ViewChild('settingsDrawer') public settingsDrawer: MatSidenav;
  title:string = ""
  agentId:any;

constructor(
      private sidenavService: SidebarCustomModalService,
){}

 ngOnInit():void {

   this.sidenavService.onModalChange().pipe(takeUntil(this.destroy$)).subscribe((res:any) => {
       console.log("res id >>>", res)
       if(res && res.type){
        this.title = res.type;
       }

       if(res && res.data){
         this.agentId = res.data;
       }

       this.settingsDrawer?.toggle();
   })
 }

 ngOnDestroy(){
  this.destroy$.next();
  this.destroy$.complete();
 }
}
