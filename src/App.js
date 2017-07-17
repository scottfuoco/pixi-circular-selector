import React, { Component } from 'react';
import ArcGesture from './components/ArcGesture';
import styles from './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      progress: 0,
      activeDot: null,
      complete: false,
    }
  }

  updateProgress = (newProgress) => {
    this.setState({ progress: newProgress }); 
  };
  
  setActiveDot = (newActiveDot) => {
    this.setState({activeDot: newActiveDot});
  };

  setComplete = (value) => {
    this.setState({complete: value})
  }

  render() {
    return (
      <div className="appContainer">
      <div className='SVGContainer'>
        {
          this.state.complete ?
          <h1 style={{textAlign:"center"}}>Animation Complete</h1> :
          <div>
            <h1 style={{textAlign:"center"}}>Progress {Math.floor(this.state.progress)}%</h1>
            <h2 style={{textAlign:"center"}}>
            Active Dot 
            { this.state.activeDot === 0 ? ' Top' :
              this.state.activeDot === 1 ? ' Bottom' :
              ' None'
            }</h2>
            </div>
        }
        </div>
        <ArcGesture setActiveDot={this.setActiveDot} updateProgress={this.updateProgress} setComplete={this.setComplete} />
      </div>
    );
  }
}

export default App;
