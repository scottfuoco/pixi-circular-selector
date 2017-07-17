import React, {Component} from 'react';
import * as PIXI from 'pixi.js';

class ArcGesture extends Component {


  componentDidMount() {
    this.app = new PIXI.autoDetectRenderer(
      ArcGesture.Config.CANVAS_SIZE, ArcGesture.Config.CANVAS_SIZE,
      {antialias: false, transparent: true, resolution: 1}
    );
    this.gameCanvas.appendChild(this.app.view);

    // this.app.stage.addChild(PIXI.Sprite.fromImage('megaman.png'));
    this.stage = new PIXI.Container();

    PIXI.loader
      .add('megaman', 'megaman.png')
      .load(this.setup);
  }

  setup = () => {
    this.megaman = new PIXI.Sprite(
      PIXI.loader.resources['megaman'].texture
    )

    this.megaman.anchor.set(.5,.5);
    this.megaman.scale.set(.5, .5);
    this.megaman.x = this.app.width / 2;
    this.megaman.y = this.app.height/ 2;
    this.megaman.interactive = true;

    this.megaman.vy = 3;

    this.megaman.on('click', () => {
      this.megaman.scale.x -= .1;
      this.megaman.scale.y -= .1;
    });

    this.stage.addChild(this.megaman);
    this.app.render(this.stage);

    this.animationLoop();
  }

  animationLoop = () => {
    this.megaman.rotation += 0.01;
    this.app.render(this.stage);
    requestAnimationFrame(this.animationLoop);

  }
  componentWillUnmount() {
    this.app.stop();
  }

  moveDown = () => {
    if(!this.mouseDown) { return }
    this.megaman.y += this.megaman.vy;
    requestAnimationFrame(this.moveDown);
  }

  touchStart = () => {
    this.mouseDown = true;
    this.moveDown();
  }

  touchEnd = () => {
    this.mouseDown = false;
  }


  render(){

    return (
      <div className='container'
          onTouchStart={() => this.touchStart()}
          onTouchEnd={() => this.touchEnd()}
          onMouseDown={() => this.touchStart()}
          onMouseUp={() => this.touchEnd()}
      >
      <div ref={(component) => {this.gameCanvas = component}} />
              </div>
    );
  }

}
export default ArcGesture;