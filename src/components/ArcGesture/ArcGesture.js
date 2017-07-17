import React, {Component} from 'react';
import * as PIXI from 'pixi.js';

import styles from './ArcGesture.css';

class ArcGesture extends Component {

  constructor(props) {
    super(props);

    this.dotsDrawn = 0;
    this.locked = false;
    this.active = false;
    this.initialDrawComplete = false;
    this.initialMouseData = null;
    this.movingMouseData = null;
    this.progressUpdatePrevious = 0;
    this.progressBottom = 0;
    this.progressTop = 0;
    this.resetSelectorTopDot = false;
    this.resetSelectorBottomDot = false;
    this.complete = false;
    this.framesAfterSelectionCounter = 0;
    this.nextQuestion = false;

    this.state = {
      progressTop: 0,
      progressBottom: 0,
    }
  }


  componentDidMount() {
    this.multiplier = this.props.bottom ? -1 : 1;

    this.app = new PIXI.autoDetectRenderer(
      ArcGesture.Config.CANVAS_SIZE, ArcGesture.Config.CANVAS_SIZE,
      {antialias: false, transparent: true, resolution: 1}
    );
    this.gameCanvas.appendChild(this.app.view);


    // this.app.stage.addChild(PIXI.Sprite.fromImage('megaman.png'));
    this.stage = new PIXI.Container();

    
    this.now = null;
    this.then = Date.now();
    this.delta = null;

    this.dots = new PIXI.Graphics();
    this.completeInnerRing = new PIXI.Graphics();
    this.completeOutterRing = new PIXI.Graphics();

    this.selectorDotTop = new PIXI.Graphics();
    this.selectorDotTop.interactive = true;
    this.selectorDotTop.buttonMode = true;
    this.selectorDotTop.defaultCursor = "pointer";

    this.selectorDotBottom = new PIXI.Graphics();
    this.selectorDotBottom.interactive = true;
    this.selectorDotBottom.buttonMode = true;
    this.selectorDotBottom.defaultCursor = "pointer";


    this.selectorDotTop
    // events for drag start
        .on('mousedown', (e) => this.onDragStart(ArcGesture.Config.SELECTOR_DOT_TOP, e))
        .on('touchstart', (e) => this.onDragStart(ArcGesture.Config.SELECTOR_DOT_TOP, e))
    // //     // events for drag end
        .on('mouseup', () => this.onDragEnd(ArcGesture.Config.SELECTOR_DOT_TOP))
        .on('mouseupoutside',() => this.onDragEnd(ArcGesture.Config.SELECTOR_DOT_TOP))
        .on('touchend', () => this.onDragEnd(ArcGesture.Config.SELECTOR_DOT_TOP))
        .on('touchendoutside', () => this.onDragEnd(ArcGesture.Config.SELECTOR_DOT_TOP))
        // events for drag move
        .on('mousemove',  (e) => this.onDragMove(ArcGesture.Config.SELECTOR_DOT_TOP, e))
        .on('touchmove',  (e) => this.onDragMove(ArcGesture.Config.SELECTOR_DOT_TOP, e))

    this.selectorDotBottom
        // events for drag start
        .on('mousedown', (e) => this.onDragStart(ArcGesture.Config.SELECTOR_DOT_BOTTOM, e))
        .on('touchstart', (e) => this.onDragStart(ArcGesture.Config.SELECTOR_DOT_BOTTOM, e))
        // events for drag end
        .on('mouseup', () => this.onDragEnd(ArcGesture.Config.SELECTOR_DOT_BOTTOM))
        .on('mouseupoutside',() => this.onDragEnd(ArcGesture.Config.SELECTOR_DOT_BOTTOM))
        .on('touchend', () => this.onDragEnd(ArcGesture.Config.SELECTOR_DOT_BOTTOM))
        .on('touchendoutside', () => this.onDragEnd(ArcGesture.Config.SELECTOR_DOT_BOTTOM))
        // events for drag move
        .on('mousemove',  (e) => this.onDragMove(ArcGesture.Config.SELECTOR_DOT_BOTTOM, e))
        .on('touchmove',  (e) => this.onDragMove(ArcGesture.Config.SELECTOR_DOT_BOTTOM, e))
    this.draw();

  }

  draw = () => {
    if(this.nextQuestion){
      return;
    }
    requestAnimationFrame(this.draw);
    this.now = Date.now();
    this.delta = this.now - this.then;
    if (this.delta > ArcGesture.Config.INITIAL_DOT_DRAW_INTERVAL) {
      this.then = this.now - (this.delta % ArcGesture.Config.INITIAL_DOT_DRAW_INTERVAL);
     this.selectorDotTop.clear();
     this.selectorDotBottom.clear();

     if(!this.complete){
      this.drawTopArc();
      this.drawBottomArc();
     }else {
      this.dots.clear();
      this.selectorDotTop.clear();
      this.selectorDotBottom.clear();
      this.selectComplete();
     }

      this.stage.addChild(this.selectorDotTop);
      this.stage.addChild(this.selectorDotBottom);
      this.stage.addChild(this.dots);
      this.stage.addChild(this.completeInnerRing);
      this.stage.addChild(this.completeOutterRing);
      this.app.render(this.stage);
    }


  }
  drawTopArc = () => {
    this.multiplier = 1;
    if(!this.initialDrawComplete){
      this.intialDrawArcDots(this.progressTop);
    }else {
      if(this.resetSelectorTopDot){
        if(this.progressTop <= 0){
          this.resetSelectorTopDot = false;
          this.locked = false;
          return;
        }
        this.progressTop -= 1;
        this.props.updateProgress(this.progressTop / ArcGesture.Config.NUM_DOTS * 100);
       this.updateDrawArcDots(this.progressTop, true);  
      }
      if(!this.resetSelectorBottomDot){
        this.updateDrawArcDots(this.progressTop, true); 
      }
    }
    this.drawSelectorDot(this.selectorDotTop, this.progressTop, this.progressBottom, ArcGesture.Config.SELECTOR_DOT_TOP); 
  }

  drawBottomArc = () => {
    this.multiplier = -1;
    if(!this.initialDrawComplete){
      this.dotsDrawn -= 1;
      this.intialDrawArcDots(this.progressBottom);
    }else {
      this.multiplier = -1;
      if(this.resetSelectorBottomDot){
        if(this.progressBottom <= 0){
          this.resetSelectorBottomDot = false;
          this.locked = false;
          return;
        }
        this.progressBottom -= 1;
        this.props.updateProgress(this.progressBottom / ArcGesture.Config.NUM_DOTS * 100);
        this.multiplier = -1;
        this.updateDrawArcDots(this.progressBottom, true); 
        this.multiplier = 1;
        this.updateDrawArcDots(this.progressTop, false);
        this.multiplier = -1;
      }else{
        this.updateDrawArcDots(this.progressBottom, false); 
      }
    }
    
    this.drawSelectorDot(this.selectorDotBottom, this.progressBottom, this.progressTop, ArcGesture.Config.SELECTOR_DOT_BOTTOM); 
  }

  intialDrawArcDots = (progress) => {
   this.drawArcDots(progress);
   if(this.dotsDrawn >= ArcGesture.Config.NUM_DOTS){
    this.initialDrawComplete = true;
   }
  }

  updateDrawArcDots = (progress, clear) => {
      this.dotsDrawn = 0;
      if(clear){
          this.dots.clear();  
      }
      while( this.dotsDrawn <= ArcGesture.Config.NUM_DOTS) { 
        this.drawArcDots(progress);
      }
  }
  drawArcDots = (progress) => {
      let alpha  = progress > this.dotsDrawn ? 0.1 : 1;
       if ((this.dotsDrawn - progress < 2) && (this.dotsDrawn - progress >= -1) ){
         alpha = 0;
       }
      let offset    = Math.PI / ArcGesture.Config.NUM_DOTS;
      let currentDotRadius = ArcGesture.Config.MAX_DOT_RADIUS - (ArcGesture.Config.DOT_RADIUS_INCREMENT * this.dotsDrawn); 
      let rd        = currentDotRadius > 0
                      ? currentDotRadius
                      : ArcGesture.Config.DOT_RADIUS_INCREMENT;
      let a         = offset * this.dotsDrawn;
      let center    = ( ArcGesture.Config.CANVAS_SIZE / 2 );
      let arcRadius = ( center - ArcGesture.Config.CURRENT_DOT_RADIUS - 10 );

      let x = center - arcRadius * Math.cos( a ) * this.multiplier;
			let y = center - arcRadius * Math.sin( a ) * this.multiplier;

      
      this.dots.beginFill(ArcGesture.Config.PASSIVE_DOT_COLOR, alpha);
      this.dots.drawCircle(x, y, rd);
      this.dots.endFill();

      this.dotsDrawn += 1;
  }

drawSelectorDot = (selectorDot, progress, otherProgress, id) => {
    const dotColor = ArcGesture.Config.ACTIVE_DOT_COLOR

    let ringColor = ArcGesture.Config.INACTIVE_STROKE_COLOR;
    let alpha = 1;
    if( this.active !== false) {
      if(this.active === id){
        ringColor = ArcGesture.Config.ACTIVE_STROKE_COLOR;
      }else {
        alpha = 0.2;
      }
    }

      const offset    = Math.PI / ArcGesture.Config.NUM_DOTS;
      const ringRadius = ArcGesture.Config.CURRENT_DOT_RADIUS * (Math.max( 0.3, 1 - (otherProgress / ArcGesture.Config.NUM_DOTS)));
      const dotRadius = ArcGesture.Config.MAX_DOT_RADIUS;
      const a         = offset * progress;
      const center    = ( ArcGesture.Config.CANVAS_SIZE / 2 );
      const arcRadius = ( center - ArcGesture.Config.CURRENT_DOT_RADIUS - 10 );

      const x = center - arcRadius * Math.cos( a ) * this.multiplier;
      const y = center - arcRadius * Math.sin( a ) * this.multiplier;

      selectorDot.lineStyle(1, ringColor, alpha);  //(thickness, color)
      selectorDot.drawCircle(x, y, ringRadius);   //(x,y,radius)
      selectorDot.endFill();

      selectorDot.beginFill(dotColor);
      selectorDot.lineStyle(0);  //(thickness, color)
      selectorDot.drawCircle(x, y, dotRadius);   //(x,y,radius)
      selectorDot.endFill();   

      selectorDot.hitArea = new PIXI.Circle(x, y, ringRadius);   //(x,y,radius)

}

selectComplete = () => {
  // +2 is for the -2 on the outter ring
    if (this.framesAfterSelectionCounter > 2*Math.PI + 2){
      this.nextQuestion = true;
      this.props.setComplete(true);
      return;
    }
    const offset = this.active === ArcGesture.Config.SELECTOR_DOT_TOP ? 0 : Math.PI;
    const a         = offset + this.framesAfterSelectionCounter;
    const center    = ( ArcGesture.Config.CANVAS_SIZE / 2 );
    const arcRadius = ( center - ArcGesture.Config.CURRENT_DOT_RADIUS - 10 );
    const color = ArcGesture.Config.ACTIVE_STROKE_COLOR;
    const dotRadius = ArcGesture.Config.MAX_DOT_RADIUS;
    const y = center;
    const x = center + arcRadius * Math.cos( offset ); 

    this.completeInnerRing.lineStyle(1, color);
    this.completeInnerRing.arc(center, center, arcRadius, offset, a );
    this.completeInnerRing.endFill();

    this.completeInnerRing.beginFill(color);
    this.completeInnerRing.lineStyle(0);  //(thickness, color)
    this.completeInnerRing.drawCircle(x, y, dotRadius);   //(x,y,radius)
    this.completeInnerRing.endFill();   

    if(this.framesAfterSelectionCounter >= 2){
      this.completeOutterRing.clear();
      this.completeOutterRing.lineStyle(1, color, .6);
      this.completeOutterRing.arc(center, center, arcRadius + ArcGesture.Config.CURRENT_DOT_RADIUS - 10 , offset, a - 2);
      this.completeOutterRing.endFill();
    }
    this.framesAfterSelectionCounter += 0.09;
}

  onDragStart = (id, e) => {
    if(this.complete) {
      return;
    }

    this.active = this.locked ? false : id;

    if (this.active === false) { 
      return
    }

    this.locked = true;
    
    if(id === ArcGesture.Config.SELECTOR_DOT_TOP){
      this.initialMouseData = Math.floor(this.selectorDotTop.hitArea.x);
      this.initialDragStartProgress = this.progressTop;
      this.props.setActiveDot(this.active);
    } else {
      this.initialMouseData = this.selectorDotBottom.hitArea.x;
      this.initialDragStartProgress = this.progressBottom;
      this.props.setActiveDot(this.active);
    }
  }

  onDragMove = (id, e) => {
    if(this.complete) {
      return;
    }
    if (this.active === id) {
      if(id === ArcGesture.Config.SELECTOR_DOT_TOP){
        const progressUpdate = Math.floor((e.data.global.x - this.initialMouseData) / (ArcGesture.Config.CANVAS_SIZE / (ArcGesture.Config.NUM_DOTS+5)));
        if (this.progressTop <= 0 && progressUpdate < 0){
          this.progressTop = 0;
          return;
        }
        else if (this.progressTop >= 30 && progressUpdate >= 30){
          this.progressTop = 30;
          return;
        } else {
          this.progressTop = this.initialDragStartProgress + progressUpdate;
        }
        this.props.updateProgress(this.progressTop / ArcGesture.Config.NUM_DOTS * 100);
      }else {
        const progressUpdate = Math.floor((e.data.global.x - this.initialMouseData) / (ArcGesture.Config.CANVAS_SIZE / (ArcGesture.Config.NUM_DOTS+5)));
        if(this.progressBottom <= 0 && progressUpdate > 0) {
           this.progressBottom = 0;
           return;
        }
        else if(this.progressBottom >= 30 && progressUpdate <= -30){
           this.progressBottom = 30;
          return;
        } else {
          this.progressBottom = this.initialDragStartProgress - progressUpdate;
        }
        this.props.updateProgress(this.progressBottom / ArcGesture.Config.NUM_DOTS * 100);
      }
    }
  }

  onDragEnd = (id) => {
    if(this.complete) {
      return;
    }
    if( ArcGesture.Config.SELECTOR_DOT_TOP === id ) {
      if( this.progressTop < 30) {
        this.resetSelectorTopDot = true;
        this.active = false;
        this.props.setActiveDot(this.active);
        return;
      }

    }
    if( ArcGesture.Config.SELECTOR_DOT_BOTTOM === id ){ 
      if ( this.progressBottom < 30) {
        this.resetSelectorBottomDot = true;
        this.active = false;
        this.props.setActiveDot(this.active);
        return;
      }
    }
          this.active = id;
    this.complete = true; 

  }
  render(){

    return (
      <div
        className={styles.canvas}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transformOrigin: '0 0 0',
          transform: 'scale(.5) translate(-50%, -50%) '}}
        ref={(component) => {this.gameCanvas = component}} />
    );
  }

}

ArcGesture.Config = {
	NUM_DOTS: 30,
	MAX_DOT_RADIUS: 8,
	DOT_RADIUS_INCREMENT: 0.25,
	CANVAS_SIZE: 1100,
	CURRENT_DOT_RADIUS: 65,
	PASSIVE_DOT_COLOR: 0x999999,
	ACTIVE_DOT_COLOR: 0xe1c765,
  INACTIVE_STROKE_COLOR: 0x000000,
  ACTIVE_STROKE_COLOR: 0xe1c765,
  INITIAL_DOT_DRAW_INTERVAL: 1,
  SELECTOR_DOT_TOP: 0,
  SELECTOR_DOT_BOTTOM: 1,
  
};

export default ArcGesture;