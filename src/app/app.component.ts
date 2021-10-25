import { Component } from '@angular/core';
import { WifiWizard2 } from '@ionic-native/wifi-wizard-2/ngx';
import { Platform } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private plt: Platform,
    private wifiwizard: WifiWizard2,
    private geolocation: Geolocation
  ) {
    let env = this;
    this.plt.ready().then(() => {
      this.wifiwizard
        .iOSConnectNetwork('RetroAP8266', 'Santony85')
        .then((con) => {
          console.log(con);
        })
        .catch((erc) => {
          console.log(erc);
        });

      /*env.geolocation.getCurrentPosition().then((resp) => {
        // resp.coords.latitude
        // resp.coords.longitude
        console.log(resp);
        env.wifiwizard.getConnectedSSID().then((data)=>{
          console.log(data);
          env.wifiwizard.iOSConnectNetwork("RetroAP8266", "Santony85").then((con)=>{
            console.log(con)
          }).catch((erc)=>{
            console.log(erc)
          })
        }).catch((err)=>{
          console.log(err)
        })
       }).catch((error) => {
         console.log('Error getting location XX', error);
       });*/
      //connect to esp8266
      /*this.hotspot.scanWifi().then((networks: HotspotNetwork[]) => {
        console.log(networks);
      });*/
    });
  }
}
