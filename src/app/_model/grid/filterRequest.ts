export class FilterRequest {
    public Skip: number;
    public Take: number;
    public OrderBy: string;
    public OrderDirection: number;
    public Filter: string;
    public columeFilters?: object;
}
