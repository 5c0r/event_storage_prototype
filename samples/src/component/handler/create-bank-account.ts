import { IHandle, IHandleFn } from "../command/handle.interface";
import { CreateBankAccount } from "../message/create-bank-account.message";
import { Observable } from "rxjs/Observable";
import { of } from "rxjs";

export class CreateBankAccountHandler implements IHandle<CreateBankAccount> {
    handle: IHandleFn<CreateBankAccount> = (message: CreateBankAccount): Observable<any> => {
        console.log('Handling message CreateBankAccount');
        return of();
    }


    constructor() {

    }
}