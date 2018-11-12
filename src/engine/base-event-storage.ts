import { ObjectId } from 'bson';
import * as Mongoose from 'mongoose';
import { Observable, of, throwError } from 'rxjs';
import { fromPromise } from 'rxjs/internal/observable/fromPromise';
import { map, tap, switchMap } from 'rxjs/operators';
import { EventModel } from '../infrastructure/db_schema/event-model';
import { AggreateStreamState } from '../infrastructure/interface/aggregate';
import { AggregateBase } from '../infrastructure/interface/aggregate-base';
import { AggregateEvent, AggregateEventDbSchema, IAmEvent } from '../infrastructure/interface/event';
import { MongooseInstance } from '../infrastructure/interface/storage/mongo-instance';
import { IWorkWithEvent } from '../infrastructure/interface/storage/event-store.interface';
import { StreamStateBase, ProjectionBase } from '../infrastructure/interface/stream-state-base';


// MongoDB javascript specific function
declare const emit: Function;

export class EventStorage<T1 extends AggregateBase> implements IWorkWithEvent<T1> {

    constructor(private readonly mongoose: MongooseInstance, private readonly typeConstructor: { new(): T1 }) {

    }

    public startMongo(connString: string): void {

    }

    public startMongoUsingInstance(mongoInstance: MongooseInstance) {

    }

    public startStream(aggregate: T1, withEvents?: any[]): ObjectId {
        try {
            const actionId = Math.random();
            aggregate._id = new Mongoose.Types.ObjectId();
            this.mongooseGuard();
            // console.log('Creating new stream', aggregate._id);
            this.appendStream(aggregate._id, aggregate.UncommittedEvents, true, aggregate.Version);

            return aggregate._id;
        } catch (error) {
            throw error;
        }
    }

    public startStreamWithEvents(events: any[]): ObjectId {
        try {
            const streamId = new Mongoose.Types.ObjectId();
            this.mongooseGuard();

            this.appendStream(streamId, events, true)

            return streamId;

        } catch (error) {
            throw error;
        }
    }

    // TODO: IApply interface instead of ProjectionBase
    public buildProjectionFromScratch(streamId: any, emptyProjection: ProjectionBase): any {
        try {
            const evts = this.getEvents(streamId);
            evts.forEach(ev => emptyProjection.ApplyEvent(ev));

            return emptyProjection;
        } catch (error) {
            throw error;
        }
    }


    private fromEvents(events: IAmEvent[], streamId: any, actionId: number, start?: number): AggregateEventDbSchema[] {
        return events.map((ev: IAmEvent, index) => this.fromEvent(streamId, ev, (start || 1) + index, actionId));
    }

    private fromEvent(streamId: any, ev: IAmEvent, version: number, actionId: number): AggregateEventDbSchema {

        const eventModel: AggregateEvent = {
            ActionId: actionId,
            Data: ev,
            AppendDate: new Date(),
            StreamId: streamId,
            Type: ev.constructor.name,
            Version: version
        }
        return new EventModel(eventModel);
    }

    private persistEvents(events: AggregateEventDbSchema[]): Promise<AggregateEventDbSchema[]> {
        return EventModel.insertMany(events).then(res => { console.log('persisted', res); return res; });
    }

    public appendStream(streamId: string | any, events: any[], newStream: boolean = false, expectedVersion?: number): void {
        try {

            const actionId = Math.random();

            // Split this into another observable , then we can merge observable and do any action we like
            const streamState$ = newStream ? of(new StreamStateBase()) : this.getStreamState(streamId)
                // TODO: Put this to tap or something else, this hurts my brain
                .pipe(
                    switchMap((state: any) => {
                        const innerExpectedVersion: number = expectedVersion || (state.CurrentVersion + events.length);
                        const outerExpectedVersion: number = state.CurrentVersion + events.length;

                        // console.log('outerExpected', state, state.CurrentVersion, events.length);

                        if (innerExpectedVersion !== outerExpectedVersion) {
                            throw new Error('Stream version mismatch !');
                        }
                        return of(state);
                    })
                );

            streamState$.subscribe((res: StreamStateBase) => {
                this.persistEvents(this.fromEvents(events, streamId, actionId, res.CurrentVersion));

            }, err => {
                throw new Error(err);
            })
        } catch (err) {
            throw new Error(`Error while appending stream ${streamId} ${err}`);
        }
    }

    public saveStream(aggregate: T1, version?: number): void {
        try {
            const actionId = Math.random();

            this.mongooseGuard();
            this.appendStream(aggregate._id, aggregate.UncommittedEvents, false, aggregate.Version);
        } catch (err) {
            throw new Error(`Error while saving stream ${aggregate._id}`);
        }
    }

    // I thought it was a PoC, I was wrong
    public getStream(streamId: string, version?: number): Observable<T1> {
        // 1st approach , WORKING
        return this.getEvents(streamId, version).pipe(
            map((res: AggregateEventDbSchema[]): T1 => {
                const aggregate = new this.typeConstructor();
                console.log('building aggregate', streamId, aggregate);
                aggregate.create(streamId);
                res.forEach(event => aggregate.RaiseEvent(event.Data, event.Type, true))

                return aggregate;
            })
        );
    }

    // What we call 'Aggregators'
    private buildAggregateFromEvents(events: IAmEvent[]): T1 {
        const aggregate = new this.typeConstructor();
        events.forEach((ev: any): void => aggregate.RaiseEvent(ev.Data, ev.Type, true));

        return aggregate;
    }

    public getStreamState(streamId: string): Observable<AggreateStreamState> {
        try {
            return fromPromise(
                EventModel.count({ StreamId: streamId })
                    .then((count: number) => {
                        if (count > 0) {
                            return new StreamStateBase(streamId, count);
                        } else {
                            throw new Error(`Invalid streamId ${streamId}`);
                        }
                    })
            );
        } catch (err) {
            return throwError(err);
        }
    }

    public getEvents(streamId: string, version?: number): Observable<IAmEvent[]> {
        let query = EventModel.find({ StreamId: streamId });

        query = version ? query.where('Version').lte(version) : query;

        return fromPromise(query.sort({ Version: 1 }).then(res => {
            if (version && res.length !== version) {
                throw new Error(`Invalid stream, Looking for version ${version} but only found ${res.length} events`);
            }
            return res;
        }));
    }

    public getEventsByTypes(streamId: string, types: any[] = []): Observable<IAmEvent[]> {

        let query = EventModel.find({ StreamId: streamId });

        types.forEach((type) => query = query.where('Type').equals(type));

        return fromPromise(query.sort({ Version: 1 }).then(res => {
            // TODO
            return res;
        }));
    }

    private mongooseGuard(): void {
        if (!this.mongoose || this.mongoose == null) {
            throw new Error('No mongoose instance instantiated !');
        }
    }

    public getStreamWithMapReduce(streamId: any, version?: number): Observable<T1> {
        const query: { [key: string]: any } = {
            'StreamId': streamId,
        }

        if (version) {
            query['Version'] = {
                '$lt': version
            }
        }

        const mapReduceOpts: Mongoose.ModelMapReduceOption<AggregateEventDbSchema, Mongoose.Types.ObjectId, any> = {
            query: query,
            map: function map() {
                emit(this._id, { item: this })
            },
            reduce: function reduce(key, values) {
                var ret = { item: [] };
                var item = {};

                values.forEach(function (value: any) {
                    if (!item[value.item._id]) {
                        ret.item.push(value.item);
                        item[value._id] = true;
                    }
                })
                return ret;
            }
        }

        return Observable.fromPromise(EventModel.mapReduce(mapReduceOpts).then(res => {
            if (res.length === 0) { return null; }

            //https://stackoverflow.com/questions/28149213/mongodb-mapreduce-method-unexpected-results#28161632
            const aggregate = new this.typeConstructor();
            res.map((item: any): IAmEvent => item.value.item).forEach((ev: any) => {
                aggregate.RaiseEvent(ev.Data, ev.Type, true);
            });

            return aggregate;
        }))
    }
}