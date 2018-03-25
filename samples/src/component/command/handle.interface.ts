import { Observable } from "rxjs/Observable";

export interface IHandleFn<T> {
    (message: T): Observable<any>;
}

export interface IHandle<T> {
    name: string;
    handle: IHandleFn<T>;
}