import { IAggregateRoot, IAggreateStreamState} from './../../interface/IAggregate';
import { IEvent } from './../../interface/IEvent';

import { Observable } from 'rxjs/Observable';


declare const emit: Function;

export interface IRepository<T extends IAggregateRoot> {

    StartStream(aggregate: T, withEvents?: IEvent[]): Observable<any>;

    AppendStream(streamId: AAGUID, events: IEvent[], expectedVersion?: number): void;

    GetStream(streamId: AAGUID, version?: Number): Observable<T>;
    GetStreamState(streamId: AAGUID): Observable<IAggreateStreamState>;

    GetEvents(streamId: AAGUID, version?: Number): Observable<IEvent[]>;
}
