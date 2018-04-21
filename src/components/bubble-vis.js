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
       value : .5
     }],
     preprocessed_data : [
       {
         x0: 0,
         x: 1,
         y: 3
       }
     ]
   }
 }

  render(){
    
    return (
      <XYPlot
        yDomain={[0, 2]}
        width={230}
        height={75}
        margin={{ top: 10, bottom: 10 }}
        stackBy="y">
        <VerticalGridLines />
        <HorizontalGridLines />
        <YAxis />
        <VerticalRectSeries
          data={[
            { x0: 1, x: 2, y: 10 },
            { x0: 2, x: 4, y: 5 },
            { x0: 5, x: 6, y: 15 }
          ]}
        />
        <VerticalRectSeries
          data={[
            { x0: 1, x: 2, y: 12 },
            { x0: 2, x: 4, y: 2 },
            { x0: 5, x: 6, y: 15 }
          ]} />
      </XYPlot>
    );
  }
}