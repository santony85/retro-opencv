import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  ElementRef,
} from '@angular/core';
import { NgOpenCVService, OpenCVLoadResult } from 'ng-open-cv';
import { tap, switchMap, filter } from 'rxjs/operators';
import { forkJoin, Observable, empty, fromEvent, BehaviorSubject } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { Platform } from '@ionic/angular';
import { WifiWizard2 } from '@ionic-native/wifi-wizard-2/ngx';
import { WebServer } from '@ionic-native/web-server/ngx';

declare var cv: any;

import * as mapboxgl from 'mapbox-gl-cordova-offline';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  private urljpg = 'http://192.168.4.2/mjpeg/1';
  private urlstream = 'http://192.168.4.2/mjpeg/1';

  private myframe: any;

  private classifiersLoaded = new BehaviorSubject<boolean>(false);
  classifiersLoaded$ = this.classifiersLoaded.asObservable();

  @ViewChild('canvasInput', { static: true }) //iframe
  canvasInput: ElementRef;
  @ViewChild('canvasOutput', { static: true })
  canvasOutput: ElementRef;
  @ViewChild('imgInput', { static: true })
  imgInput: ElementRef;

  private offsetw = 0;
  private offseth = 0;

  mapmb: mapboxgl.Map;

  scalem = 0;
  scalev = 1;
  zmap = 900;
  zvid = 890;
  mvidb = 0;
  mvidt = 0;

  vidh = '100%';
  vidw = '100%';

  scalefact = 'scale(1.0) translate(0%, 0%)';
  mleft = '0px';
  mtop = '0px';

  screenw = 0;
  screenh = 0;

  constructor(
    private ngOpenCVService: NgOpenCVService,
    private sanitize: DomSanitizer,
    private platform: Platform,
    private wifiWizard2: WifiWizard2,
    private webServer: WebServer
  ) {
    platform.ready().then(() => {
      console.log('Width: ' + platform.width());
      console.log('Height: ' + platform.height());

      this.screenw = platform.width();
      this.screenh = platform.height();

      if (this.screenw > 800) {
        var propv = this.screenw / 800;
        var ptop = (this.screenw - 800) / 2;
        var plef = (this.screenh - 600) / 2;

        this.scalefact = 'scale(' + propv + ') translate(0px, 0px)';
      } else this.scalefact = 'scale(1) translate(0px, 0px)';
    });
  }

  mapbox() {
    var mypos = {
      lat: 46.496422,
      lon: -1.775933,
    };
    (mapboxgl as any).accessToken =
      'pk.eyJ1Ijoic2FudG9ueTg1IiwiYSI6ImNpeGg4czMyNDAwMW0yb251OWVsMWJ4cGwifQ.avcth1xBhfvZ7fhAvnYblQ';
    let env = this;

    this.mapmb = new mapboxgl.Map({
      container: 'mapmb',
      style: 'mapbox://styles/mapbox/streets-v9', //stylesheet location
      zoom: 16,
      bearing: 0,
      pitch: 45,
      center: [mypos.lon, mypos.lat],
    });
    // Add map controls
    //this.mapmb.addControl(new mapboxgl.NavigationControl());

    // Add map controls
    /*this.mvidt= -34;
    this.mvidb= -33;
    this.scalev =0;
    this.zvid=900;
    this.zmap=890;
    this.scalem =1;*/

    this.mapmb.on('load', function (map) {
      /*env.mapmb.addSourceType('mbtiles', (mapboxgl as any).MBTilesSource, function (res) {
      console.log(res)
      env.mapmb.addSource('openmaptiles', {
            type: 'mbtiles',
            path: '../assets/data/pl.mbtiles' 
          });
        });*/
    });

    var nav = new mapboxgl.NavigationControl({
      showCompass: false,
      showIn: true,
      showOut: false,
    });
    this.mapmb.addControl(nav, 'top-left');
    var nav = new mapboxgl.NavigationControl({
      showCompass: false,
      showIn: false,
      showOut: true,
    });
    this.mapmb.addControl(nav, 'top-right');

    /*this.mapmb = new mapboxgl.Map({
      container: 'mapmb',
			style: this.style,
      zoom: 14,
      pitch: 45,
      center: [mypos.lon, mypos.lat],

      hash:true
    }).then(function(map){

      var nav = new mapboxgl.NavigationControl({showCompass:false,showIn:true,showOut:false});
      map.addControl(nav, 'top-left');
      var nav = new mapboxgl.NavigationControl({showCompass:false,showIn:false,showOut:true});
      map.addControl(nav, 'top-right');
      console.log('ici')
      //map.on('load', function () {
        map .addSourceType('mbtiles', (mapboxgl as any).MBTilesSource, function (res) {
          console.log(res)
          map.addSource('openmaptiles', {
                type: 'mbtiles',
                name: '../assets/data/pl.mbtiles' 
            });
        });
    //});

    })*/
  }

  openURLXX() {
    //console.log('ici');
    return this.sanitize.bypassSecurityTrustResourceUrl(this.urljpg);
  }

  ngOnInit() {
    this.ngOpenCVService.isReady$
      .pipe(
        // The OpenCV library has been successfully loaded if result.ready === true
        filter((result: OpenCVLoadResult) => result.ready),
        switchMap(() => {
          // Load the face and eye classifiers files
          let ci = this.canvasInput.nativeElement;
          this.offsetw = ci.offsetWidth;
          this.offseth = ci.offsetHeight;
          console.log(this.offsetw);
          console.log(this.offseth);
          return this.loadClassifiers();
        })
      )
      .subscribe(() => {
        // The classifiers have been succesfully loaded
        this.classifiersLoaded.next(true);
      });
  }

  ionViewDidEnter() {
    //this.leafletMap();
    this.mapbox();
  }

  ngAfterViewInit(): void {
    // Here we just load our example image to the canvas
    let env = this;
    //console.log("there")
    this.ngOpenCVService.isReady$
      .pipe(
        filter((result: OpenCVLoadResult) => result.ready),
        tap((result: OpenCVLoadResult) => {
          env.ngOpenCVService
            .loadImageToHTMLCanvas(this.urlstream, env.imgInput.nativeElement)
            .subscribe(() => {
              env.detectFace();

              //console.log(document.getElementsByTagName('iframe')[0].contentWindow.document.body);
            });
        })
      )
      .subscribe(() => {});
  }

  loadClassifiers(): Observable<any> {
    return forkJoin(
      this.ngOpenCVService.createFileFromUrl(
        'haarcascade_frontalface_default.xml',
        `assets/opencv/data/haarcascades/haarcascade_frontalface_default.xml`
      ),
      this.ngOpenCVService.createFileFromUrl(
        'haarcascade_eye.xml',
        `assets/opencv/data/haarcascades/haarcascade_eye.xml`
      )
    );
  }

  detectFace() {
    // before detecting the face we need to make sure that
    // 1. OpenCV is loaded
    // 2. The classifiers have been loaded
    this.ngOpenCVService.isReady$
      .pipe(
        filter((result: OpenCVLoadResult) => result.ready),
        switchMap(() => {
          return this.classifiersLoaded$;
        }),
        tap(() => {
          this.clearOutputCanvas();
          this.findFaceAndEyes();
        })
      )
      .subscribe(() => {
        console.log('Face detected');
      });
  }

  clearOutputCanvas() {
    const context = this.canvasOutput.nativeElement.getContext('2d');
    context.clearRect(
      0,
      0,
      this.canvasOutput.nativeElement.width,
      this.canvasOutput.nativeElement.height
    );
  }

  findFaceAndEyes() {
    // Example code from OpenCV.js to perform face and eyes detection
    // Slight adapted for Angular
    const imgElement = document.querySelector('#imgInput');
    let src = cv.imread(imgElement);
    let gray = new cv.Mat();
    const faces = new cv.RectVector();
    const eyes = new cv.RectVector();
    const faceCascade = new cv.CascadeClassifier();
    const eyeCascade = new cv.CascadeClassifier();
    const FPS = 5;

    faceCascade.load('haarcascade_frontalface_default.xml');
    eyeCascade.load('haarcascade_eye.xml');
    // detect faces
    const msize = new cv.Size(0, 0);

    const ws = this.offsetw;
    const hs = this.offseth;

    function processvideo() {
      let begin = Date.now();
      src = cv.imread(imgElement);
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
      //get size

      let out = new cv.Mat(hs, ws, cv.CV_8UC4);
      faceCascade.detectMultiScale(gray, faces, 1.1, 3, 0, msize, msize);
      console.log('bfc');

      for (let i = 0; i < faces.size(); ++i) {
        const roiGray = gray.roi(faces.get(i));
        const roiSrc = out.roi(faces.get(i));
        const point1 = new cv.Point(faces.get(i).x, faces.get(i).y);
        const point2 = new cv.Point(
          faces.get(i).x + faces.get(i).width,
          faces.get(i).y + faces.get(i).height
        );
        cv.rectangle(out, point1, point2, [255, 0, 0, 255]);
        // detect eyes in face ROI
        eyeCascade.detectMultiScale(roiGray, eyes);
        for (let j = 0; j < eyes.size(); ++j) {
          const point3 = new cv.Point(eyes.get(j).x, eyes.get(j).y);
          const point4 = new cv.Point(
            eyes.get(j).x + eyes.get(j).width,
            eyes.get(j).y + eyes.get(j).height
          );
          cv.rectangle(roiSrc, point3, point4, [0, 0, 255, 255]);
        }
        roiGray.delete();
        roiSrc.delete();
      }

      cv.imshow('canvasOutput', out);
      let delay = 1000 / FPS - (Date.now() - begin);
      setTimeout(processvideo, delay);
      //console.log('afc');
    }
    setTimeout(processvideo, 0);
  }

  setmap() {
    this.vidh = '600px';
    this.vidw = '800px';
    this.mvidt = -33;
    this.mvidb = -33;
    this.scalev = 0;
    this.zvid = 900;
    this.zmap = 890;

    this.scalem = 1;
  }
  setvid() {
    this.mvidt = 0;
    this.mvidb = 0;
    this.scalev = 1;
    this.zvid = 890;
    this.zmap = 900;
    this.scalem = 0;
  }
}
