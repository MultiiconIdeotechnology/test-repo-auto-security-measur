import { DateTime } from 'luxon';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

export interface IPdfColumn {
    header: string;
    property: string;
}

export class Pdf {
    public static export(title: string, columns: IPdfColumn[], data: any[]): void {
        const widths = [];
        const headerRow = [];
        const body = [];

        for (const column of columns) {
            widths.push('*');
            headerRow.push({ text: column.header, bold: true });
        }

        body.push(headerRow);

        for (const entry of data) {

            const item = [];

            for (const column of columns) {
                if (entry.hasOwnProperty(column.property)) {
                    item.push(entry[column.property]);
                } else {
                    item.push('');
                }
            }

            body.push(item);
        }

        const docDefinition = {
            content: [
                { text: title, style: 'header' },
                { text: 'Generated On: ' + DateTime.now().toFormat('DD-MM-yyyy hh:mm:ss'), style: 'textStyle' },
                { text: '      ', style: 'textStyle' },
                {
                    layout: 'lightHorizontalLines', // optional
                    table: {
                        headerRows: 1,
                        widths: widths,
                        body: body
                    }
                }
            ],

            styles: {
                header: {
                    fontSize: 22,
                    bold: true,
                    color: 'red',
                },
                textStyle: {
                }
            }
        };

        pdfMake.createPdf(docDefinition).download(title);
    }
}
