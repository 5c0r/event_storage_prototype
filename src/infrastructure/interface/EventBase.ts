import { Event } from './Event';

export class EventBase implements Event {
    // TODO
    AffectVersion: Number;

    private setVersion(version: number) {
        this.AffectVersion = version;
    }
}