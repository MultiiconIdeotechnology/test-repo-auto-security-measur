import { AbstractControl, ValidatorFn } from "@angular/forms";

export function urlValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        if (!control.value) {
            return null;
        }

        const urlPattern = /^(?:(ftp|http|https):\/\/)?(?:www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+(\/[^\s]*)?$/;

        if (urlPattern.test(control.value)) {
            return null;
        } else {
            return { 'invalidUrl': { value: control.value } };
        }
    };
}
