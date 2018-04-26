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

export default class Legend extends Component {

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
      ticks: [{
        name: "name",
        value: 1.2
      }]
    }
  }

  componentWillMount() {
    const ticks =this.preprocessedData(this.props.data)
    this.setState({
      
      ticks: ticks,
    })
  }

  preprocessedData(data) {
    var ticks = [];
    for (var i = 0; i < data.length; i++) {
      const datum = data[i];
      var tick = {};
      tick.name = datum.name;
      tick.value = i + 1;
      ticks.push(tick);
    }
    return ticks;
  }

  render() {

    return (
      <XYPlot
        width={522}
        height={100}
        margin={{ top: 10, bottom: 10, left: 52 }}>
        <XAxis/>
        <XAxis
          tickValues={_.map(this.state.ticks, (tick) => { return tick.value })}
          tickFormat={(value)=>{return this.state.ticks[value-1]}}/>
      </XYPlot>
    );
  }
}