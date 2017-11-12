import { AggregateBase, EventRouter } from './../src/infrastructure/interface/AggregateBase';
import { EventBase } from './../src/infrastructure/interface/EventBase';

import { IApplyEvent } from './../src/infrastructure/interface/IEvent';


// Sample aggregate creation
export class AccountDeposited extends EventBase {
    constructor(public Value: number) {
        super();
    }
}

export class AccountWithdrawed extends EventBase {
    constructor(public Value: number) {
        super();
    }
}

export class NameSet extends EventBase {
    constructor(public anotherValue: string) {
        super();
    }
}

// Stream of Events 
export class BankAccount extends AggregateBase {

    private balance: number = 0;
    private accountHolder: string = '';

    constructor() {
        super();
        this.WireUpEvents();
    }

    public WireUpEvents(): void {
        this.RegisterEvent<AccountDeposited>(AccountDeposited.name, this.accountDeposited);
        this.RegisterEvent<NameSet>(NameSet.name, this.accountHolderSet);
        this.RegisterEvent<AccountWithdrawed>(AccountWithdrawed.name, this.accountWithdrawed)
    }

    // Getters
    public get CurrentBalance(): number {
        return this.balance;
    }
    public get AccountHolderName(): string {
        return this.accountHolder;
    }

    // Setters
    public deposit(newValue: number): this {
        this.RaiseEvent(new AccountDeposited(newValue));
        return this;
    }

    public withdraw(newValue: number, threshold: number = 0): this {
        if (newValue < 0) throw new Error(`Invalid amount ${newValue} given for withdraw action`);
        else if (newValue - threshold > this.balance) throw new Error(`It is not possible to withdraw more than ${newValue} `);

        this.RaiseEvent(new AccountWithdrawed(newValue));

        return this;
    }

    public setName(newValue: string): this {
        this.RaiseEvent(new NameSet(newValue));
        return this;
    }
    // End of setters

    // Appliers
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