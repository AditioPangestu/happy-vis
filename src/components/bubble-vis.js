import React, { Component } from "react";
import axios from "axios";
import _ from "lodash";
import {
  XYPlot,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
  MarkSeries
} from 'react-vis';

export default class BubbleVis extends Component {
  render(){
    return (
      <XYPlot
        width={this.props.width}
        height={this.props.height}>
        <VerticalGridLines />
        <HorizontalGridLines />
        <XAxis />
        <YAxis />
        <MarkSeries
          strokeWidth={2}
          opacity="0.8"
          sizeRange={[5, 15]}
          data={this.props.data} />
      </XYPlot>
    );
  }
}