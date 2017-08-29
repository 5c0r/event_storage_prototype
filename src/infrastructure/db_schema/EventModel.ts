import * as Mongoose from 'mongoose';
import { IAggregateEventDbSchema } from './../interface/IEvent';

const EventSchema = new Mongoose.Schema({
    StreamId: { type: String, required: true, index: true },
    Data: { type: Object, required: true },
    Type: { type: String, required: true },
    AppendDate: { type: Date, required: true },
    Version: { type: Number, required: true }
})

const EventModel = Mongoose.model<IAggregateEventDbSchema>('aggregate_events', EventSchema);

export { EventSchema, EventModel }