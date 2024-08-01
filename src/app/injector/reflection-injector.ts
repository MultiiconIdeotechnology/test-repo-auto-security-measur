import { Injector } from '@angular/core';

/**
 * Allows for retrieving singletons using `ReflectionInjector.get(MyService)` (whereas
 * `ReflectiveInjector.resolveAndCreate(MyService)` would create a new instance
 * of the service).
 */
export let ReflectionInjector: Injector;

/**
 * Helper to set the exported {@link ReflectionInjector}, needed as ES6 modules export
 * immutable bindings (see http://2ality.com/2015/07/es6-module-exports.html) for 
 * which trying to make changes after using `import {ReflectionInjector}` would throw:
 * "TS2539: Cannot assign to 'ReflectionInjector' because it is not a variable".
 */
export function setReflectionActivator(injector: Injector): void {
    if (ReflectionInjector) {
        console.error('Reflection Injector was already set');
    }

    ReflectionInjector = injector;
}
