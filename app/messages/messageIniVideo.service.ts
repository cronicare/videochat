import { Injectable } from "@angular/core"; 
import { Observable } from "rxjs";
import { Subject } from "rxjs";
import { MessageIniVideo } from "./messageIniVideo";

@Injectable()
export class MessageIniVideoService {
    private subject = new Subject<MessageIniVideo>();
    
    reportMessage(msg: MessageIniVideo) {
        this.subject.next(msg);
    }

    get messages(): Observable<MessageIniVideo> { 
        return this.subject;    
    }
}