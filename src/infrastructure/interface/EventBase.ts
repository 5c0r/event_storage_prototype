import { IEvent } from './IEvent';

export class EventBase implements IEvent {
    // TODO
    AffectVersion: Number;

    private setVersion(version: number) {
        this.AffectVersion = version;
    }
}