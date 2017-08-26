import { IAggregateRoot, IAggreateStreamState } from './../../interface/IAggregate';
import { IAggregateEvent } from './../../interface/IEvent';

export interface IRepository<T extends IAggregateRoot, T1 extends IAggregateEvent> {

    StartStream( aggregate: T, withEvent?: T1 ) : void;
    StartStream( aggregate: T, withEvents?: T1[] ) : void;    

    AppendStream(streamId: AAGUID, events: T1[]): void;
    AppendStream(streamId: AAGUID, event: T1): void;

    GetStream(streamId: AAGUID): T;
    GetStreamState(streamId: AAGUID): IAggreateStreamState;
}