import { IAmEvent } from './event';

export class EventBase implements IAmEvent {
    // TODO
    AffectVersion: Number;

    private setVersion(version: number) {
        this.AffectVersion = version;
    }
}