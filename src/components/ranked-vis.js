import React, { Component } from "react";
import axios from "axios";
import _ from "lodash";
import {
  XYPlot,
  LineSeries,
  Hint
} from 'react-vis';

export default class RankedVis extends Component {
  render(){
    return (
      <XYPlot
        colorType="literal"
        margin={{left:0, top:6,bottom:6}}
        xDomain={[0,this.props.x_domain]}
        width={180}
        height={12}
        >
        <LineSeries
          color={this.props.color}
          strokeWidth ={3}
          style={{ strokeLinecap: "round" }}
          data={[
            {
              x : 0,
              y : 0
            },
            {
              x : this.props.x,
              y : 0
            }
          ]}/>
      </XYPlot>
    )
  }
}