import { IAggregateEvent, IEvent } from './IEvent';

export class EventBase implements IEvent {
    AffectVersion: Number;

    private setVersion(version: number) {
        this.AffectVersion = version;
    }
}