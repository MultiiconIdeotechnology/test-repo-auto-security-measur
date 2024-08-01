import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { of, switchMap } from 'rxjs';

export const AuthGuard: CanActivateFn | CanActivateChildFn = (route, state) => {
    const router: Router = inject(Router);
    const authService: AuthService = inject(AuthService);

    // Check the authentication status
    return inject(AuthService).check().pipe(
        switchMap((authenticated) => {


            // If the user is not authenticated...
            if (!authenticated) {
                // Redirect to the sign-in page with a redirectUrl param
                const redirectURL = state.url === '/sign-out' ? '' : `redirectURL=${state.url}`;
                const urlTree = router.parseUrl(`sign-in?${redirectURL}`);

                return of(urlTree);
            } else {
                if (route.data && route.data.group && route.data.operation && route.data.category && route.data.module) {
                    var data = authService.hasPermission(route.data.group, route.data.operation, route.data.category, route.data.module);
                    return of(Boolean(data))
                } else
                    return of(true);
            }

            // Allow the acces
            // return of(true);
        }),
    );
};
