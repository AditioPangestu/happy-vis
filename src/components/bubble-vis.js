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
  LineSeries,
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
        x: datum.value,
        y:(i+1),
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
        xDomain={[0, this.props.y_domain]}
        width={150 + (this.props.first ? 190 : 0)}
        height={18*this.props.data.length}
        margin={{ bottom: 10, left: (this.props.first?200:10),top : 25 }}>
        <HorizontalGridLines />
        <VerticalGridLines 
          tickValues={_.map(this.state.ticks, (tick) => { return tick.value })}/>
        <XAxis
          orientation="top"
          tickValues={_.map(this.state.ticks, (tick)=>{return tick.value})}/>
        {(()=>{
          if(this.props.first){
            return (
              <YAxis
                tickValues={_.map(this.state.x_ticks, (tick) => { return tick.value })}
                tickFormat={(value) => { return this.state.x_ticks[value - 1].name }} />
            )
          }
        })()}
        {(() => {
          var line_series = [];
          for (var i = 0; i < this.props.data.length; i++) {
            line_series.push(
              <LineSeries
                color={this.props.data[i].color}
                data={[
                  {
                    x: 0,
                    y: (i + 1)
                  },
                  {
                    y: (i + 1),
                    x: this.props.data[i].value
                  }
                ]} />
            );
          }
          return line_series;
        })()}
        <MarkSeries
          data={this.state.preprocessed_data}/>
      </XYPlot>
    );
  }
}