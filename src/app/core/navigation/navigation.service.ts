import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Navigation } from 'app/core/navigation/navigation.types';
import { Observable, ReplaySubject, map, tap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { defaultNavigation, compactNavigation, futuristicNavigation, horizontalNavigation } from 'app/mock-api/common/navigation/data';

@Injectable({providedIn: 'root'})
export class NavigationService
{
    private _navigation: ReplaySubject<Navigation> = new ReplaySubject<Navigation>(1);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,private _authService : AuthService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for navigation
     */
    get navigation$(): Observable<Navigation>
    {

        return this._navigation.pipe(map((x) => {

            const defNav = this._authService.verifyNavigationUsingPermissions(defaultNavigation);
            const comNav = this._authService.verifyNavigationUsingPermissions(compactNavigation);
            const futNav = this._authService.verifyNavigationUsingPermissions(futuristicNavigation);
            const horNav = this._authService.verifyNavigationUsingPermissions(horizontalNavigation);
            const filteredNav = { compact: comNav, default: defNav, futuristic: futNav, horizontal: horNav }

            return filteredNav;
        }));
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get all navigation data
     */
    get(): Observable<Navigation>
    {
        return this._httpClient.get<Navigation>('api/common/navigation').pipe(
            tap((navigation) =>
            {
                this._navigation.next(navigation);
            }),
        );
    }
}
