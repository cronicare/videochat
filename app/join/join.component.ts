import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MessageIniVideoService } from '../messages/messageIniVideo.service';
import { MessageIniVideo } from '../messages/messageIniVideo';

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.css']
})

export class JoinComponent {
  
  joinRoomForm;

  constructor(
    private formBuilder: FormBuilder,
    private messaseService: MessageIniVideoService
    ) {
    
      this.joinRoomForm = this.formBuilder.group({roomName: '', myName: ''});

  }

  onSubmit(roomData: any) {
    
    let lastMessage: MessageIniVideo = {myName:roomData['myName'], roomName:roomData['roomName']};
    
    this.messaseService.reportMessage(lastMessage);

    } 

}
