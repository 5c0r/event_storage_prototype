export interface ICommand<T> {
    payload: T;
}

export class CreatePayload {
    constructor(public Name: string, public Amount: number) {

    }
}

export class CreateCommand implements ICommand<CreatePayload> {
    payload: CreatePayload;

    constructor(name: string, amount: number) {
        this.payload = new CreatePayload(name, amount);
    }
}

export class DepositPayload {
    constructor(public Account: any, public Amount: number) {

    }
}

export class DepositCommand implements ICommand<DepositPayload> {
    payload: DepositPayload;

    constructor(account: any, amount: number) {
        this.payload = new DepositPayload(account, amount)
    }

}

export class TransferPayload {
    constructor(public From: any, public To: any, public Amount: number) {

    }
}

export class TransferCommand implements ICommand<TransferPayload> {
    payload: TransferPayload;

    constructor(from: string, to: any, amount: number) {
        this.payload = new TransferPayload(from, to, amount);
    }
}
