import { Subject } from "rxjs/Subject";
import { Observable } from 'rxjs/Observable';
import { Message } from "../message/message.interface";
import { IHandle } from "../command/handle.interface";
import { Subscription } from "rxjs";
import { map } from "rxjs/operators";

export class MessageQueue {
    private static readonly messagePipe = new Subject<Message>();
    public static readonly TestPipe = MessageQueue.messagePipe.asObservable().pipe(
        map(msg => msg)
    )
    public static readonly GetInstance = () => MessageQueue.messagePipe.asObservable();

    private static router: { [key: string]: Subscription } = {};
    public static Router: { [key: string]: Subscription } = MessageQueue.router;


    public static Send<Message>(message: Message): void {
        this.messagePipe.next(message);
    }

    public static Register(handler: IHandle<Message>): void {
        const msgSubscription = this.messagePipe
            .subscribe(message => handler.handle(message));

        if (this.router[`${handler.name}`]) throw new Error(`Already taken`);
        this.router[`${handler.name}`] = msgSubscription;
    }

    public static UnRegister<T>(handler: IHandle<T>): void {
        // this.Router[]
        // this.messagePipe.
    }
}