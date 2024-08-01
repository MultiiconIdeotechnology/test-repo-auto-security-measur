import { JsonPipe, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { FuseFullscreenComponent } from '@fuse/components/fullscreen';
import { FuseLoadingBarComponent } from '@fuse/components/loading-bar';
import { FuseNavigationItem, FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { FuseConfigService, Scheme } from '@fuse/services/config';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { Navigation } from 'app/core/navigation/navigation.types';
import { UserService } from 'app/core/user/user.service';
import { LanguagesComponent } from 'app/layout/common/languages/languages.component';
import { MessagesComponent } from 'app/layout/common/messages/messages.component';
import { NotificationsComponent } from 'app/layout/common/notifications/notifications.component';
import { QuickChatComponent } from 'app/layout/common/quick-chat/quick-chat.component';
import { SearchComponent } from 'app/layout/common/search/search.component';
import { ShortcutsComponent } from 'app/layout/common/shortcuts/shortcuts.component';
import { UserComponent } from 'app/layout/common/user/user.component';
import { EntityService } from 'app/services/entity.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'classy-layout',
    templateUrl: './classy.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [FuseLoadingBarComponent, JsonPipe, FuseVerticalNavigationComponent, NotificationsComponent, UserComponent, NgIf, MatIconModule, MatButtonModule, SearchComponent, LanguagesComponent, FuseFullscreenComponent, SearchComponent, ShortcutsComponent, MessagesComponent, RouterOutlet, QuickChatComponent],
})
export class ClassyLayoutComponent implements OnInit, OnDestroy {
    isScreenSmall: boolean;
    navigation: Navigation;
    user: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    baseNavigations: FuseNavigationItem[];

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _navigationService: NavigationService,
        private _userService: UserService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService,
        private entityService: EntityService,
    ) {

    };

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for current year
     */
    get currentYear(): number {
        return new Date().getFullYear();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Subscribe to navigation data
        this._navigationService.navigation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((navigation: Navigation) => {
                this.navigation = navigation;
                this.baseNavigations = navigation.default.filter((x: FuseNavigationItem) => x.link);

                let layer1 = []
                for (var nav1 of navigation.default) {
                    layer1 = nav1.children.map(x => { x.detail = nav1.title; return x })
                    this.baseNavigations.push(...layer1.filter((x: FuseNavigationItem) => x.link))
                    let layer2 = [];
                    for (var nav2 of layer1) {
                        if (nav2.children) {
                            layer2 = nav2.children.map(x => { x.detail = nav2.detail + ' > ' + nav2.title; return x })
                            this.baseNavigations.push(...layer2.filter((x: FuseNavigationItem) => x.link))
                        }
                        let layer3 = [];
                        for (var nav3 of layer2) {
                            if (nav3.children) {
                                layer3 = nav3.children.map(x => { x.detail = nav3.detail + ' > ' + nav3.title; return x })
                                this.baseNavigations.push(...layer3.filter((x: FuseNavigationItem) => x.link))
                            }
                            let layer4 = [];
                            for (var nav4 of layer3) {
                                if (nav4.children) {
                                    layer4 = nav4.children.map(x => { x.detail = nav4.detail + ' > ' + nav4.title; return x })
                                    this.baseNavigations.push(...layer4.filter((x: FuseNavigationItem) => x.link))
                                }
                                let layer5 = [];
                                for (var nav5 of layer4) {
                                    if (nav5.children) {
                                        layer5 = nav5.children.map(x => { x.detail = nav5.detail + ' > ' + nav5.title; return x })
                                        this.baseNavigations.push(...layer5.filter((x: FuseNavigationItem) => x.link))
                                    }
                                }
                            }
                        }
                    }
                }
            });

        // Subscribe to the user service
        this._userService.user$
            .pipe((takeUntil(this._unsubscribeAll)))
            .subscribe((user: any) => {
                this.user = user;
            });

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                // Check if the screen is small
                this.isScreenSmall = !matchingAliases.includes('md');
            });
    }

    display: boolean;
    callComponent() {
        if (!this.display) {

            this.display = true;
        }
        else {
            this.display = false;
        }
        this.entityService.raiseSearchChange(this.display);
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
     * Toggle navigation
     *
     * @param name
     */
    toggleNavigation(name: string): void {
        // Get the navigation
        const navigation = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(name);

        if (navigation) {
            // Toggle the opened status
            navigation.toggle();
        }
    }
}
