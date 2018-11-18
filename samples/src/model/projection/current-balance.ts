import { ProjectionBase, StreamStateBase } from '../../../../src/infrastructure/interface/stream-state-base';
import { AccountCreated, AccountDeposited, AccountWithdrawed } from '../bank-account-events';
// import { prop, Typegoose } from 'typegoose';

interface IHaveBalance {
    Balance: number;
}

interface IHaveName {
    Name: string;
}

class CurrentBalance extends ProjectionBase implements IHaveBalance, IHaveName {

    private balance: number = 0;
    private name: string = '';

    public get Balance(): number {
        return this.balance;
    }

    public get Name(): string {
        return this.name;
    }

    constructor(streamId: any) {
        super(streamId);
        this.WireUpEvents();
    }

    // I only cares about AccountCreated, AccountDeposited, AccountWithdrawed
    private WireUpEvents(): void {
        this.RegisterEvent(AccountCreated, this.accountCreated);
        this.RegisterEvent(AccountDeposited, this.accountDeposited);
        this.RegisterEvent(AccountWithdrawed, this.accountWithdrawed);
    }

    // Appliers
    private accountCreated = (ev: AccountCreated): void => {
        this.balance = ev.startBalance;
        this.name = ev.name;
    }

    private accountDeposited = (ev: AccountDeposited): void => {
        this.balance = this.balance + ev.Value;
    }

    private accountWithdrawed = (ev: AccountWithdrawed): void => {
        this.balance = this.balance - ev.Value;
    }
    // End of appliers
}

// const CurrentBalanceSchema = new CurrentBalance().getModelForClass(CurrentBalance);

export { IHaveBalance, IHaveName, CurrentBalance };
