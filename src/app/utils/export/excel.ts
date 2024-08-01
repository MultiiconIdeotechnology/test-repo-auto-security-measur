import { Observable, Observer } from 'rxjs';
import * as XLSX from 'xlsx';
import { Linq } from '../linq';
import { CommonUtils } from '../commonutils';
import { DateTime } from 'luxon';

export interface IExportColumn {
    header: string;
    property: string;
}

export class Excel {
    public static export(sheetName: string, columns: IExportColumn[], data: any[], innerSheetTitle?: string, joinRowCol?: [joinRowCol]): void {
        const workBook: XLSX.WorkBook = XLSX.utils.book_new();

        const array = [];

        const headerRow = [];
        for (const column of columns) {
            headerRow.push(column.header);
        }

        if (innerSheetTitle != null && innerSheetTitle) {
            array.push([innerSheetTitle + " - " + DateTime.fromJSDate(new Date()).toFormat('d MMM yyyy')]);
            array.push([]);
        }

        array.push(headerRow);

        for (const entry of data) {

            const rowObj = [];

            for (const column of columns) {
                if (entry.hasOwnProperty(column.property)) {
                    rowObj.push(entry[column.property]);
                } else {
                    rowObj.push('');
                }
            }

            array.push(rowObj);
        }

        const workSheet = XLSX.utils.aoa_to_sheet(array);

        if (joinRowCol != null && joinRowCol.length > 0) {
            workSheet["!merges"] = joinRowCol;
        }
        
        XLSX.utils.book_append_sheet(workBook, workSheet, sheetName);
        XLSX.writeFile(workBook, sheetName + '.xlsx');
    }

    public static import(file: any): Observable<any[]> {
        return new Observable((observer: Observer<any[]>) => {
            const reader: FileReader = new FileReader();
            reader.readAsBinaryString(file);
            reader.onload = (e: any) => {
                /* create workbook */
                const binarystr: string = e.target.result;
                const wb: XLSX.WorkBook = XLSX.read(binarystr, { type: 'binary' });

                /* select the first sheet */
                const wsname: string = wb.SheetNames[0];
                const ws: XLSX.WorkSheet = wb.Sheets[wsname];

                /* save data */
                const data = Linq.select(XLSX.utils.sheet_to_json<any>(ws), (val: any) => CommonUtils.removeWhiteSpaceFromProperties(val));
                observer.next(data);
                observer.complete();
            };
        });
    }
}

class joinRowCol { s: { r: number, c: number }; e: { r: number, c: number } }

