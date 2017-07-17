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
      <div>
      <div className='SVGContainer'>
        {
          this.state.complete ?
          <h1>Animation Complete</h1> :
          <div>
            <h1>Progress {Math.floor(this.state.progress)}%</h1>
            <h2>
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