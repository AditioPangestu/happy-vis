import React, { Component } from "react";
import axios from "axios";
import _ from "lodash";
import {
  XYPlot,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
  VerticalRectSeries,
  MarkSeries,
} from 'react-vis';

export default class BubbleVis extends Component {

  /*
    Props
    data = [datum]
    datum = {
      "name": "Eastern Asia",
      "value": 1.234
    }
    highlighted_data = {
      "name": "Turki",
      "value": 1.45
    }
    xMax = 15
    first = true
  */

  constructor(props) {
    super(props);
    this.state = {
      ticks : [{
        name : "name",
        value : 1.2
      }],
      preprocessed_data : [
        {
          x0: 0,
          x: 1,
          y: 3
        }
      ],
      x_ticks: []
    }
  }

  componentWillMount(){
    const {
      ticks,
      x_ticks,
      preprocessed_data
    } = this.preprocessedData(this.props.data)
    this.setState({
      ...this.state,
      preprocessed_data: preprocessed_data,
      ticks: ticks,
      x_ticks: x_ticks,
    })
  }

  preprocessedData(data){
    var preprocessed_data = [];
    var ticks = [];
    var x_ticks = [];
    var gap = this.props.y_domain/4;
    for(var i=0;i<5;i++){
      var tick = {};
      tick.name = i*gap;
      tick.value = i*gap;
      ticks.push(tick);
    }
    for(var i=0;i<data.length;i++){
      const datum = data[i];
      preprocessed_data.push({
        x:(i+1),
        y:datum.value,
        color: datum.color
      });
      var tick = {};
      tick.name = datum.name;
      tick.value = i + 1;
      x_ticks.push(tick);
    }
    console.log(x_ticks)
    return {
      ticks,
      x_ticks,
      preprocessed_data
    };
  }

  render(){
    
    return (
      <XYPlot
        colorType="literal"
        yDomain={[0, this.props.y_domain]}
        width={522}
        height={100 + (this.props.last ? 190 : 0)}
        margin={{ top: 10, bottom: (this.props.last?200:10),left : 52 }}
        stackBy="y">
        <VerticalGridLines />
        <HorizontalGridLines 
          tickValues={_.map(this.state.ticks, (tick) => { return tick.value })}/>
        <YAxis
          tickValues={_.map(this.state.ticks, (tick)=>{return tick.value})}/>
        <YAxis
          position="start"
          left={-52}
          title={this.props.name}
          hideTicks
          hideLine/>
        {(()=>{
          if(this.props.last){
            return (
              <XAxis
                tickLabelAngle={-90}
                tickValues={_.map(this.state.x_ticks, (tick) => { return tick.value })}
                tickFormat={(value) => { return this.state.x_ticks[value - 1].name }} />
            )
          }
        })()}
        <MarkSeries
          data={this.state.preprocessed_data}/>
      </XYPlot>
    );
  }
}