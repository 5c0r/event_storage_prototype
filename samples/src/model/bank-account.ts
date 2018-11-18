import { AccountCreated, AccountDeposited, AccountWithdrawed, NameSet, AccountDeactivated, AccountActivated } from './bank-account-events';
import { AggregateBase } from '../../../src/infrastructure/interface/aggregate-base';

export interface IBankAccount {
    AccountName: string;
    Balance: number;
    Active: boolean;
    CreationDate: Date;
}

export class BankAccountResponse implements IBankAccount {

    static FromProjection(projection: BankAccount): BankAccountResponse {
        return new BankAccountResponse(
            projection.AccountName, projection.Balance,
            projection.Active, projection.CreationDate);
    }
    constructor(public readonly AccountName: string, public readonly Balance: number,
        public readonly Active: boolean, public readonly CreationDate: Date) { }


}

// Stream of Events
export class BankAccount extends AggregateBase implements IBankAccount {

    private balance: number = 0;
    private accountHolder: string = '';
    private creationDate: Date;
    private active: boolean = false;

    constructor() {
        super();
        this.WireUpEvents();
    }

    public createBankAccount(name: string, startBalance: number): void {
        if (name === '') {
            throw new Error('Invalid name input provided !');
        }

        if (startBalance < 0) {
            throw new Error(`Cannot input negative starting balance !`);
        }

        this.RaiseEvent(new AccountCreated(name, startBalance, new Date()));
    }

    public WireUpEvents(): void {
        this.RegisterEvent(AccountCreated, this.accountCreated);
        this.RegisterEvent(AccountDeposited, this.accountDeposited);
        this.RegisterEvent(NameSet, this.accountHolderSet);
        this.RegisterEvent(AccountWithdrawed, this.accountWithdrawed);
    }

    // Getters
    public get Balance(): number {
        return this.balance;
    }
    public get AccountName(): string {
        return this.accountHolder;
    }

    public get Active(): boolean {
        return this.active;
    }

    public get CreationDate(): Date {
        return this.creationDate;
    }

    // Setters
    public deposit(newValue: number): this {
        this.RaiseEvent(new AccountDeposited(newValue));
        return this;
    }

    public withdraw(newValue: number, threshold: number = 0): this {
        if (newValue < 0) {
            throw new Error(`Invalid amount ${newValue} given for withdraw action`);
        }

        if (newValue - threshold > this.balance) {
            throw new Error(`It is not possible to withdraw more than ${newValue} `);
        }

        this.RaiseEvent(new AccountWithdrawed(newValue));

        return this;
    }

    public setName(newValue: string): this {
        this.RaiseEvent(new NameSet(newValue));
        return this;
    }
    // End of setters

    // Appliers
    public accountCreated = (ev: AccountCreated): void => {
        this.accountHolder = ev.name;
        this.active = true;
        this.balance = ev.startBalance;
    }

    public accountDeposited = (ev: AccountDeposited): void => {
        this.balance = this.balance + ev.Value;
    }

    public accountHolderSet = (ev: NameSet): void => {
        this.accountHolder = ev.anotherValue;
    }

    public accountWithdrawed = (ev: AccountWithdrawed): void => {
        this.balance = this.balance - ev.Value;
    }

    public accountDeactivated = (ev: AccountDeactivated): void => {
        this.active = false;
    }

    public accountActivated = (ev: AccountActivated): void => {
        this.active = true;
    }
    // End of appliers
}
