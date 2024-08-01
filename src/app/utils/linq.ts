export class Linq {
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

    public static where<T>(source: T[], selector: (val: T) => boolean): T[] {
        return source.filter(selector);
    }

    public static first<T>(source: T[], predicate?: (val: T) => boolean): T {
        if (!source) {
            return;
        }

        if (!predicate) {
            predicate = () => true;
        }

        for (const value of source) {
            if (predicate(value)) {
                return value;
            }
        }
    }

    public static last<T>(source: T[], predicate?: (val: T) => boolean): T {
        if (!source) {
            return;
        }

        if (!predicate) {
            predicate = () => true;
        }

        for (const value of source.reverse()) {
            if (predicate(value)) {
                return value;
            }
        }
    }

    public static distinct<T>(source: T[]): T[] {
        if (!source) {
            return [];
        }

        const distArray: T[] = [];

        for (const val of source) {
            if (distArray.indexOf(val) !== -1) {
                continue;
            }

            distArray.push(val);
        }

        return distArray;
    }

    public static sum<T>(source: T[], selector?: (val: T) => number): number {
        if (!source) {
            return 0;
        }

        let values: any[] = source;

        if (selector) {
            values = source.map(selector);
        }

        return values.reduce((acc, value) => acc + value, 0);
    }

    public static selectMany<TSource, TMap>(source: TSource[], selector: (value: TSource) => TMap[]): TMap[] {
        if (!source || !selector) {
            return [];
        }

        const array: TMap[] = [];

        for (const value of source) {
            const collection = selector(value);
            array.push(...collection);
        }

        return array;
    }

    public static groupBy<T, TKey>(source: T[], keySelector: (val: T) => TKey): Grouping<TKey, T>[] {
        if (!source || !keySelector) {
            return null;
        }

        const grouping: Grouping<TKey, T>[] = [];


        for (const value of source) {
            const key = keySelector(value);

            let group = grouping.find(g => g.key === key);

            if (!group) {
                group = new Grouping<TKey, T>();
                group.key = key;
                group.value = [];
                grouping.push(group);
            }

            group.value.push(value);
        }

        return grouping;
    }

    public static convertToTitleCase(inputString: string): string {
        if (!inputString) {
            return inputString;
        }

        return inputString.toLowerCase().split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    public static convertToLowerCase(inputString: string): string {
        if (!inputString) {
            return inputString;
        }

        return inputString.toLowerCase();
    }

    public static recirect(url, queryParams?): void {
        if (queryParams) {
            const queryString = Object.keys(queryParams)
                .map(key => key + '=' + queryParams[key])
                .join('&');

                url = url + '?' + queryString;
        }
        window.open(location.origin + url);
    }
}

export class Grouping<TKey, TValue> {
    key: TKey;
    value: TValue[];
}
