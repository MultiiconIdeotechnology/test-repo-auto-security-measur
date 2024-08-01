import { AppConfig } from "app/config/app-config";

export class Pagination {
    length: number = 0;
    page: number = 0;
    size: number = 0;
    pageSizeOptions = AppConfig.pageSizeOptions;
    showFirstLastButtons: boolean = true;
}