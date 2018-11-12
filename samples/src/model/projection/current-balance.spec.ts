import { CurrentBalance } from './current-balance';
import { AccountCreated } from '../bank-account-events';
import { IAmEvent } from '../../../../src/infrastructure/interface/event';
import { AccountDeposited, AccountWithdrawed } from '..';

describe('Current Balance projection', () => {
    test('can be built', () => {
        const newProjection = new CurrentBalance(null);
        expect(newProjection).toBeTruthy();
    })

    test('can apply depositevent', () => {
        const newProjection = new CurrentBalance('1');

        const events: IAmEvent[] = [
            new AccountCreated('1', 0, new Date()),
            new AccountDeposited(10)
        ]

        events.forEach(ev => newProjection.ApplyEvent(ev));

        expect(newProjection.CurrentVersion).toBe(3);
        expect(newProjection.Balance).toBe(10);

    });

    test('can apply withdrawevent', () => {
        const newProjection = new CurrentBalance('1');

        const events: IAmEvent[] = [
            new AccountCreated('1', 0, new Date()),
            new AccountWithdrawed(5)
        ]

        events.forEach(ev => newProjection.ApplyEvent(ev));

        expect(newProjection.CurrentVersion).toBe(3);
        expect(newProjection.Balance).toBe(-5);
    })
});
