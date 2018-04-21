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
        width={700}
        height={200}>
        <VerticalGridLines />
        <HorizontalGridLines />
        <XAxis />
        <YAxis />
        <MarkSeries
          strokeWidth={2}
          opacity="0.8"
          sizeRange={[5, 15]}
          data={[
            { x: 1, y: 10, size: 30 },
            { x: 1.7, y: 12, size: 10 },
            { x: 2, y: 5, size: 1 },
            { x: 3, y: 15, size: 12 },
            { x: 2.5, y: 7, size: 4 }
          ]} />
      </XYPlot>
    );
  }
}