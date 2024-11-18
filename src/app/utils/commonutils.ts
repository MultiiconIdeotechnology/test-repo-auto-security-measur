//import { Vibhs } from 'app/utils/vibhs';
//import { remindBeforeMin } from 'app/common/const';
//import { SelectListItem } from 'app/common/selectListItem';
import { JsonFile } from 'app/common/jsonFile';
import { FormGroup } from '@angular/forms';
import { DateTime } from 'luxon';
import * as FileSaver from 'file-saver';


export class CommonUtils {
    // public static getLogo(): string {
    //     return Vibhs.isF1()
    //         ? 'assets/images/logos/f1.svg'
    //         : 'assets/images/logos/vibhs.svg';
    // }

    public static valuesArray(obj: any): any[] {
        const array = [];

        for (const key of Object.keys(obj)) {
            array.push(obj[key]);
        }

        return array;
    }

    public static downloadPdf(base64Pdf, pdfName) {
        const byteCharacters = atob(base64Pdf);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);

        // Create Blob object
        const blob = new Blob([byteArray], { type: 'application/pdf' });

        // Save the Blob as a PDF file
        FileSaver.saveAs(blob, pdfName);
    }

    public static isDocValid(file, extantions: string[], maxSizeInKB?: number, maxSizeInMB?: number): DocValidationDTO {
        if (file && (maxSizeInKB || maxSizeInMB)) {

            const allowedExtensions = extantions;
            const fileExtension =
                file.name.split('.').pop()?.toLowerCase() || '';

            if (!allowedExtensions.includes(fileExtension)) {
                const extantions = allowedExtensions.join(',');
                return { valid: false, alertMessage: `Only files in the formats of ${extantions} are compatible`, alertType: 'error' };
            }

            const max = maxSizeInKB ? (maxSizeInKB * 1024) : (maxSizeInMB * 1048576)
            if (!(file.size <= max)) {
                let size = maxSizeInKB ? (maxSizeInKB + ' KB') : (maxSizeInMB + ' MB')
                return { valid: false, alertMessage: `Maximum upload file size is ${size}.`, alertType: 'error' };

            } else {
                return { valid: true, alertMessage: '', alertType: 'success' }
            }
        }
        return { valid: false, alertMessage: `Please upload valid file`, alertType: 'error' };
    }

    public static isEmptyObject(obj: any): boolean {
        if (!obj) {
            return true;
        }

        let result = true;

        for (const key of Object.keys(obj)) {
            if (obj[key]) {
                if (typeof obj[key] === 'object') {
                    result = CommonUtils.isEmptyObject(obj[key]);
                    if (result) {
                        break;
                    }
                }
                else {
                    result = false;
                    break;
                }
            }
        }

        return result;
    }

    // public static keyValuesArray(obj: any): SelectListItem[] {
    //     const array: SelectListItem[] = [];

    //     for (const key of Object.keys(obj)) {
    //         array.push({ key: key, value: obj[key] });
    //     }

    //     return array;
    // }

    // public static getReminderBeforeValue(input: string): number {
    //     switch (input) {
    //         case remindBeforeMin.min5:
    //             return 5;

    //         case remindBeforeMin.min10:
    //             return 10;

    //         case remindBeforeMin.min15:
    //             return 15;

    //         case remindBeforeMin.min30:
    //             return 30;

    //         case remindBeforeMin.hr1:
    //             return 60;

    //         default:
    //             return 0;
    //     }
    // }

    public static select<T, TResult>(values: T[], selector: (val: T) => TResult): TResult[] {
        if (!values) {
            return [];
        }

        const array: TResult[] = [];

        for (const value of values) {
            array.push(selector(value));
        }

        return array;
    }

    public static setDate(obj: any, property: string): void {
        if (!obj || !property || property === '') {
            return;
        }

        const value = obj[property];

        if (!value || value === '') {
            return;
        }

        const parsedValue = DateTime.fromISO(value).toFormat('yyyy/MM/dd');

        if (parsedValue) {
            obj[property] = parsedValue;
        }
    }

    public static getJsonFile(file: any, onLoad: (reader: FileReader, file: JsonFile) => void = null): JsonFile {
        const jsonFile = new JsonFile();

        jsonFile.fileName = file.name;
        jsonFile.fileType = file.type;

        const reader = new FileReader();

        reader.onload = (_event) => {
            jsonFile.base64 = reader.result;
            if (onLoad) {
                onLoad(reader, jsonFile);
            }
        };

        reader.readAsDataURL(file);

        return jsonFile;
    }
    public static getCloneJsonFile(name: string): JsonFile {
        const jsonFile = new JsonFile();

        jsonFile.fileName = name;

        return jsonFile;
    }
    public static updateValueAndValidity(form: FormGroup): void {
        if (!form) {
            return;
        }

        for (const controlName of Object.keys(form.controls)) {
            form.controls[controlName].updateValueAndValidity();
        }
    }

    public static setDateFormat(formGroup: FormGroup, control: string): void {
        const ctrl = formGroup.get(control);

        if (!ctrl) {
            return;
        }

        if (ctrl.value && ctrl.value !== '') {
            ctrl.patchValue(DateTime.fromISO(ctrl.value).toFormat('yyyy-MM-dd'));
        } else {
            ctrl.patchValue('');
        }
    }

    public static removeWhiteSpaceFromProperties(obj: any): any {
        const value = {};

        for (const val in obj) {
            if (obj.hasOwnProperty(val)) {
                value[val.replace(' ', '')] = obj[val];
            }
        }

        return value;
    }
    
}

export class DocValidationDTO {
    valid: boolean;
    alertType: | 'error' | 'warn' | 'success';
    alertMessage: string;
}

export const MY_DATE_FORMATS = {
    parse: {
        dateInput: 'DD MMM YY',
    },
    display: {
        dateInput: 'DD MMM YY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'DD MMM YY',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};