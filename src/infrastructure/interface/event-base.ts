import { Event } from './event';

export class EventBase implements Event {
    // TODO
    AffectVersion: Number;

    private setVersion(version: number) {
        this.AffectVersion = version;
    }
}