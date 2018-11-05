import { AccountCreated, AccountDeposited, AccountWithdrawed, NameSet } from './bank-account-events';
import { AggregateBase } from '../../../src/infrastructure/interface/aggregate-base';

export interface IBankAccount {
    accountName: string;
    startBalance?: number;
}

// Stream of Events
export class BankAccount extends AggregateBase {

    private balance: number = 0;
    private accountHolder: string = '';
    private creationDate: Date;

    constructor(obj?: IBankAccount) {
        super();
        this.WireUpEvents();

        if (obj) { this.createBankAccount(obj.accountName, obj.startBalance); }
    }

    private createBankAccount(name: string, startBalance: number): void {
        if (name === '') {
            throw new Error('Invalid name input provided !');
        }

        if (startBalance < 0 ) {
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
    public get CurrentBalance(): number {
        return this.balance;
    }
    public get AccountHolderName(): string {
        return this.accountHolder;
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
    // End of appliers
}
