import { AfterViewInit, Component, Inject, Injector } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { setReflectionActivator } from './injector/reflection-injector';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ToasterService } from './services/toaster.service';
import { CommonModule, DOCUMENT } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatIconModule } from '@angular/material/icon';
import { FuseConfigService, Scheme } from '@fuse/services/config';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from './core/user/user.service';
import { SetPasswordComponent } from './layout/common/user/set-password/set-password.component';
import { SidebarModule } from 'primeng/sidebar';
import { CommonFilterComponent } from './modules/settings/common-filter/common-filter.component';
import { CommonFilterService } from './core/common-filter/common-filter.service';
import { AuthService } from './core/auth/auth.service';
import { TwoFaAuthenticationService } from './services/twofa-authentication.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [RouterOutlet, MatSnackBarModule, CommonModule, MatIconModule, SidebarModule, CommonFilterComponent],
    animations: [
        trigger('slideRight', [
            transition(':enter', [
                style({ transform: 'translateY(-15px)' }),
                animate('400ms ease-out', style({ transform: 'translateY(0%)' }))
            ]),
            transition(':leave', [
                animate('400ms ease-out', style({ transform: 'translateY(15px)' }))
            ])
        ])
    ]
})
export class AppComponent implements AfterViewInit {
    showToast = false;
    toastrMsg = "";
    toastrType = "";
    toastrPosition = "";
    /**
     * Constructor
     */

    user: any;
    is_first: boolean;
    _unsubscribeAll: Subject<any> = new Subject<any>()

    constructor(
        private injector: Injector,
        private toastr: ToasterService,
        private _fuseConfigService: FuseConfigService,
        private matDialog: MatDialog,
        public _userService: UserService,
        public _filterService: CommonFilterService,
        private twoFaAuthenticationService: TwoFaAuthenticationService,

        @Inject(DOCUMENT) private document: Document
    ) {
        setReflectionActivator(this.injector);

        var theme = localStorage.getItem('theam')
        if (theme == null || theme == 'dark') {
            this.setScheme('dark')
        } else {
            this.setScheme('light')
        }
    }

    ngOnInit(): void {
        this.toastr.status.subscribe((msg: string) => {
            this.toastrType = localStorage.getItem("toastrType") || "";
            this.toastrPosition = localStorage.getItem("toastrPosition") || "";
            if (msg === null) {
                this.showToast = false;
            } else {
                this.showToast = true;
                this.toastrMsg = msg;
            }
        })
    }

    ngAfterViewInit(): void {
        this._userService.user$
            .pipe((takeUntil(this._unsubscribeAll)))
            .subscribe((user: any) => {
                this.user = user
                this.is_first = user?.is_first;

                if(user){
                    // calling agentcombo api 
                    if(!this._filterService.originalAgentList?.length){
                        this._filterService.getAgent("");
                    }
    
                    if(!this._filterService.originalRmList?.length){
                        // calling the employee/rm list api
                        this._filterService.getEmployeeList("");
                    }

                    // calling getTfaConfigList api
                    this.twoFaAuthenticationService.getTfaConfigList()
                }

                if (this.is_first) {

                    setTimeout(() => {

                        this.matDialog.open(SetPasswordComponent, {
                            data: user,
                            disableClose: true
                        }).afterClosed().subscribe(res => {
                        })
                    }, 1000);
                }
            });

    }

    setScheme(scheme: Scheme): void {
        this._fuseConfigService.config = { scheme };
        // Update PrimeNg Themes
        let themeLink = this.document.getElementById('primeng-theme-css') as HTMLLinkElement;
        if (themeLink) {
            let themeName = scheme == 'light' ? "lara-light-blue" : "md-dark-indigo";
            themeLink.href = `assets/primeng-themes/${themeName}/theme.css`;
        }
    }

    closeToast() {
        this.showToast = false;
    }
}
