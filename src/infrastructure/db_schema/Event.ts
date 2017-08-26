import * as Mongoose from "mongoose";

interface IAggregateEvent extends Mongoose.Document {
    StreamId: AAGUID;
    Data: any;
    Type: string;
    AppendDate: Date;
}

const EventSchema = new Mongoose.Schema({
    StreamId: { type: String, required: true, index: true },
    Data: { type: Object, required: true },
    Type: { type: String, required: true },
    AppendDate: { type: Date, required: true }
})

const Event = Mongoose.model<IAggregateEvent>("event", EventSchema);

export { IAggregateEvent, EventSchema, Event }