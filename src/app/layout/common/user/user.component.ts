import { BooleanInput } from '@angular/cdk/coercion';
import { DOCUMENT, NgClass, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterLink } from '@angular/router';
import { UserService } from 'app/core/user/user.service';
import { Subject, takeUntil } from 'rxjs';
import { FuseConfig, FuseConfigService, Scheme, Theme, Themes } from '@fuse/services/config';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { GlobalSearchComponent } from '../global_search/global-search.component';

@Component({
    selector: 'user',
    templateUrl: './user.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'user',
    standalone: true,
    imports: [MatButtonModule, MatMenuModule, NgIf, MatIconModule, NgClass, MatDividerModule, RouterLink, MatSlideToggleModule, ReactiveFormsModule],
})
export class UserComponent implements OnInit, OnDestroy {
    /* eslint-disable @typescript-eslint/naming-convention */
    static ngAcceptInputType_showAvatar: BooleanInput;
    /* eslint-enable @typescript-eslint/naming-convention */
    public theam_change = new FormControl(false);

    @Input() showAvatar: boolean = true;
    user: any;
    isDarkTheme = new FormControl(true);
    config: FuseConfig;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _fuseConfigService: FuseConfigService,
        private _matdialog: MatDialog,
        private _userService: UserService,
        @Inject(DOCUMENT) private document: Document
    ) {
        localStorage.getItem('theam')
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Subscribe to user changes
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: any) => {
                this.user = user;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to config changes
        this._fuseConfigService.config$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config: FuseConfig) => {
                // Store the config
                this.config = config;
            });

        //theam

        // this.isDarkTheme.valueChanges.subscribe(x => {
        //     if (this.isDarkTheme.value) {
        //         this.setScheme('dark');
        //     }
        //     else if (!this.isDarkTheme.value) {
        //         this.setScheme('light');
        //     }
        // })
    }

    openGlobalSearchDialog(): void {
        this._matdialog.open(GlobalSearchComponent, {
            data: {},
            backdropClass: 'ctm-back',
            panelClass: 'ctm-bg',
            width: 'w-full',
            height: 'w-full',
            minWidth: 'w-full',
            maxWidth: 'w-full',
        });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Update the user status
     *
     * @param status
     */
    updateUserStatus(status: string): void {
        // Return if user is not available
        if (!this.user) {
            return;
        }

        // Update the user
        this._userService.update({
            ...this.user,
            status,
        }).subscribe();
    }

    /**
     * Sign out
     */
    signOut(): void {
        this._router.navigate(['/sign-out']);
    }

    /**
 * Set the scheme on the config
 *
 * @param scheme
 */
    setScheme(scheme: Scheme): void {
        localStorage.setItem('theam',scheme)
        // this.applyScheme(scheme);

        this._fuseConfigService.config = { scheme };

        // Update PrimeNg Themes
        let themeLink = this.document.getElementById('primeng-theme-css') as HTMLLinkElement;
        if (themeLink){
            let themeName = scheme == 'light' ? "lara-light-blue" : "md-dark-indigo";
            themeLink.href = `assets/primeng-themes/${themeName}/theme.css`;
        }

    }

    changePassword(){
        this._matdialog.open(ChangePasswordComponent, {
            disableClose: true,
            data: {}
        })
    }
}
