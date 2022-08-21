import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { VideoComponent } from './video/video.component';
import { JoinComponent } from './join/join.component';
import { RepetirDirective } from './repetir.directive';
import { MessageIniVideoService } from './messages/messageIniVideo.service';


@NgModule({
  declarations: [
    AppComponent,
    VideoComponent,
    JoinComponent,
    RepetirDirective
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot([
      { path: '', component: JoinComponent, pathMatch: 'full' },
      { path: 'video', component: VideoComponent, pathMatch: 'full' }
    ])
  ],
  providers: [MessageIniVideoService],
  bootstrap: [AppComponent],
})
export class AppModule { }
