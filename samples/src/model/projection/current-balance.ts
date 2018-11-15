import { ProjectionBase, StreamStateBase } from '../../../../src/infrastructure/interface/stream-state-base';
import { AccountCreated, AccountDeposited, AccountWithdrawed } from '../bank-account-events';
import { prop, Typegoose } from 'typegoose';

interface IHaveBalance {
    Balance: number;
}

class CurrentBalance extends ProjectionBase implements Typegoose, IHaveBalance {

    private balance: number = 0;

    @prop({})
    public get Balance(): number {
        return this.balance;
    }

    constructor() {
        super();
        // super();
        this.WireUpEvents();
    }

    public setStreamId(streamId: any): void {
        this.StreamId = streamId;
    }

    // I only cares about AccountCreated, AccountDeposited, AccountWithdrawed
    public WireUpEvents(): void {
        this.RegisterEvent(AccountCreated, this.accountCreated);
        this.RegisterEvent(AccountDeposited, this.accountDeposited);
        this.RegisterEvent(AccountWithdrawed, this.accountWithdrawed);
    }

    // Appliers
    public accountCreated = (ev: AccountCreated): void => {
        this.balance = ev.startBalance;
    }

    public accountDeposited = (ev: AccountDeposited): void => {
        this.balance = this.balance + ev.Value;
    }

    public accountWithdrawed = (ev: AccountWithdrawed): void => {
        this.balance = this.balance - ev.Value;
    }
    // End of appliers
}

const CurrentBalanceSchema = new CurrentBalance().getModelForClass(CurrentBalance);

export { IHaveBalance, CurrentBalance, CurrentBalanceSchema };
