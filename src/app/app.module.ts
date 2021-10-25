import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { NgOpenCVModule } from 'ng-open-cv';
import { OpenCVOptions } from 'projects/ng-open-cv/src/public_api';

import { WifiWizard2 } from '@ionic-native/wifi-wizard-2/ngx';

import { WebServer } from '@ionic-native/web-server/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';

//Error: The target entry-point ionic-native/wifi-wizard-2 has missing dependencies:

const openCVConfig: OpenCVOptions = {
  scriptUrl: `assets/opencv/opencv.js`,
  wasmBinaryFile: 'wasm/opencv_js.wasm',
  usingWasm: true,
};

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    NgOpenCVModule.forRoot(openCVConfig),
  ],
  providers: [
    WifiWizard2,
    Geolocation,
    WebServer,
    //Hotspot,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
