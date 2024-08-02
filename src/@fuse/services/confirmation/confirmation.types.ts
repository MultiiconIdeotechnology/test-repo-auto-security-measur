export interface FuseConfirmationConfig
{
    title?: string;
    inputBox?: string;
    datepickerBox?: Date;
    dateCustomShow?:  boolean;
    datepickerParameter?: Date;
    message?: string;
    customShow?:  boolean;
    icon?: {
        show?: boolean;
        name?: string;
        color?: 'primary' | 'accent' | 'warn' | 'basic' | 'info' | 'success' | 'warning' | 'error';
    };
    actions?: {
        confirm?: {
            show?: boolean;
            label?: string;
            color?: 'primary' | 'accent' | 'warn';
        };
        cancel?: {
            show?: boolean;
            label?: string;
        };
    };
    dismissible?: boolean;
}
