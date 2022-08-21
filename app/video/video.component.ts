import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as OT from '@opentok/client';
import config from '../config';
import { StateServiceVideo } from '../stateServiceVideo';
import { MessageIniVideoService } from '../messages/messageIniVideo.service';
import { MessageIniVideo } from '../messages/messageIniVideo';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})

export class VideoComponent {
   
  session!: OT.Session;
  publisher!: OT.Publisher;
  subscriber!: OT.Subscriber;
  apiKey!: string;
  token!: string;
  sessionId!: string;
  publishing!: boolean;
 

  totalSubscriptores: number=0;
  subscribers : any = {};
  connections : any = {};




  @ViewChild('publisherDiv', { static: false }) 
    publisherDiv!: ElementRef<HTMLDivElement>;

  constructor(
    private http: HttpClient,
    private stateService: StateServiceVideo,
    private renderer: Renderer2,
    private messageService: MessageIniVideoService
    ) {
    
  
      messageService.messages.subscribe(m => {
       this.newVideoRoom(m);
      } );
     
       

  }

  
  

  private newVideoRoom(message:MessageIniVideo) {
    
    let get_session_url : string = config.SAMPLE_SERVER_BASE_URL;
    
    this.http.get<StateServiceVideo>(get_session_url+message['roomName']).subscribe(
    (response) => {

        console.log(response);
        this.stateService.token = response.token;
        this.stateService.sessionId = response.sessionId;
        this.stateService.apiKey = response.apiKey;

        this.apiKey = this.stateService.apiKey!;
        this.token = this.stateService.token!;
        this.sessionId = this.stateService.sessionId!;

        const p: HTMLDivElement=this.createHtmlElementForVideo(message['myName']);   
  
        this.renderer.appendChild(this.publisherDiv.nativeElement, p); 

        this.publisher = OT.initPublisher(p, {
          height: "80%",
          width: "100%%",
          insertMode: 'append',
          name : message['myName'],
          style: {nameDisplayMode: "on"},
          showControls : true
        });

        this.appendControles(p);
       

        this.session = OT.initSession(this.apiKey, this.sessionId);
        
        this.session.connect(this.token, (err) => {
          if (err) {

            console.log(err);

          }else {
            
            this.session.publish(this.publisher, (err) => {
              if (err) {
                console.log(err)
              }
              else {
                this.publishing = true;
                console.log("Session published");
              }
            });
            
            let that = this;
            this.session.on("streamCreated", function (event) {
              that.onStreamCreated(event.stream);
              that.connections[event.stream.streamId]=event.stream.connection;
            }
            );
          }
        }
        )
      })
      
    }  
  


  private onStreamCreated(stream: OT.Stream) {

      this.totalSubscriptores++;
      

      if(this.subscribers[stream.streamId]==null){

        const p: HTMLDivElement=this.createHtmlElementForVideo(stream.name,stream.streamId);

        this.renderer.appendChild(this.publisherDiv.nativeElement, p);     
        
        this.subscribers[stream.streamId] = this.session.subscribe(stream, p, {
          insertMode: "append",
          width: "100%",
          height: "80%",
          style: {nameDisplayMode: "on",
                  audioLevelDisplayMode:"on"}
        }, (err) => {
          if (err) {
            alert(err.message);
          }
        });

        this.appendControles(p);

        let that=this;
        this.session.on("streamDestroyed", function (event) {
          
          console.log("streamDestroyed-------------->",event);
          
          event.preventDefault();  

          if(that.subscribers[event.stream.streamId]!=null){

          
            console.log("antes de unsubscribe(that.subscribers[event.stream.streamId]).................");
            that.session.unsubscribe(that.subscribers[event.stream.streamId]);
            console.log("antes de subscribers[event.stream.streamId].................");
            that.subscribers[event.stream.streamId] = null;
            console.log("despues de subscribers[event.stream.streamId].................");

          }

          if(that.session.getPublisherForStream(event.stream) != null){
            that.session.getPublisherForStream(event.stream)?.destroy;
          }
        
          var allDivs:HTMLCollectionOf<Element> =that.publisherDiv.nativeElement.getElementsByClassName(event.stream.name);
          if(allDivs[0]!=null){
            allDivs[0].remove();
          }
          
          that.totalSubscriptores=that.totalSubscriptores-1;

        });

        this.session.on("connectionDestroyed", function (event) {
          
          console.log("connectionDestroyed............................");

          
        });

        this.session.on("sessionDisconnected", function (event) {
          
          console.log("sessionDisconnected..........................");

        });

        this.session.on("connectionCreated", function (event) {
          
          console.log("connectionCreated..........................");
 
        });

      }
    }



  

    

    /********************************************************/
    /********************************************************/
    /********************************************************/
    /********************************************************/
    /********************************************************/


    private disconnectRemoto(idStream: string){
      
      if(this.subscribers[idStream]!=null){
            
        let elm:OT.Stream = this.subscribers[idStream]
        
        console.log("Unsubscribe---->"+idStream);
        this.session.unsubscribe(this.subscribers[idStream]);
        
        this.session.forceDisconnect(this.connections[idStream],(event)=>{
          console.log("fuerza deconexion------------------>",event?.message);
          
        });

        Array.from(this.publisherDiv.nativeElement.children).forEach(child => {
          if(child.id == idStream){
            this.subscribers[child.id]=null;
            this.renderer.removeChild(this.publisherDiv.nativeElement, child);
          }

        }); 

      }
    }

    private disconnectLocal(){
      

      Array.from(this.publisherDiv.nativeElement.children).forEach(child => {
        
        console.log('children.length------------------>' + this.publisherDiv.nativeElement.children.length);
        
        if(child.id != 'local'){
          
          this.session.unsubscribe(this.subscribers[child.id]);
          this.subscribers[child.id]=null;
        }

        this.renderer.removeChild(this.publisherDiv.nativeElement, child);

      }); 
      
      this.session.unpublish(this.publisher);
      this.session.disconnect();
      this.publishing=false;

    }


    private createHtmlElementForVideo(name: string, IdStream = 'local'):HTMLDivElement{
      
      const p: HTMLDivElement = this.renderer.createElement('DIV');

      this.renderer.setStyle(p,'width','250px');
      this.renderer.setStyle(p,'height','242px');
      this.renderer.setStyle(p,'botton','0');
      this.renderer.setStyle(p,'left','0');
      this.renderer.setStyle(p,'draggable',true);
      this.renderer.setProperty(p, 'id',IdStream);
      this.renderer.addClass(p,name);
     
      return p;

    }


    private appendControles(p: HTMLDivElement) {

      const button = this.renderer.createElement('button');
      const text = this.renderer.createText('Close');
      this.renderer.addClass(button,'button');
      this.renderer.appendChild(button, text);    
      this.renderer.appendChild(p, button);

      this.renderer.listen(button, 'click', () => {
  
        if (p.id != null && p.id != 'local') {
          this.disconnectRemoto(p.id);
        } else if (p.id == 'local') {
          this.disconnectLocal();
        }
  
      });
  
    } 

}
