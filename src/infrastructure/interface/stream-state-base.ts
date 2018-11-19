import { AggreateStreamState } from './aggregate';
import { ApplyEvent, IAmEvent } from './event';
import { EventRouter } from './aggregate-base';

export class StreamStateBase implements AggreateStreamState {

    StreamId: any;

    CurrentVersion: number;

    constructor(streamId?: any, version?: number) {
        super();
        this.StreamId = streamId || null;
        this.CurrentVersion = version || 1;
    }
}

export abstract class ProjectionBase extends StreamStateBase {

    private _eventRouter: EventRouter = {};

    constructor(streamId?: any) {
        super(streamId);
    }

    public ApplyEvent(ev: IAmEvent, evType?: string): void {
        const className = evType || ev.constructor.name;
        /**
         * Rationale: Projection can only cares about some events, so we can just register
         * any events that the projection really cares about
         */
        if (!this._eventRouter[className]) {
            // throw new Error(`No event router found for ${className}`);
            return;
        }
        this.InvokeEvent(ev, evType);
    }

    public RegisterEvent(evType: any, eventFunc: ApplyEvent<IAmEvent>): void {
        const type = evType.name;

        if (!eventFunc) {
            throw new Error(`Event applier for ${type} is undefined !`);
        }

        if (!this._eventRouter[type]) {
            this._eventRouter[type] = eventFunc;
        } else {
            throw new Error(`Event ${type} is registered already`);
        }
    }

    private InvokeEvent(event: IAmEvent, evType?: string): void {
        this._eventRouter[evType || event.constructor.name](event);

        this.CurrentVersion++;
    }
}
