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
    } = this.preprocessedData(this.props.data, this.props.y_domain)
    this.setState({
      
      preprocessed_data: preprocessed_data,
      ticks: ticks,
      x_ticks: x_ticks,
    });
  }

  preprocessedData(data, y_domain){
    var preprocessed_data = [];
    var ticks = [];
    var x_ticks = [];
    var gap = y_domain/4;
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
    return {
      ticks,
      x_ticks,
      preprocessed_data
    };
  }

  preprocessedHighlightData(data, y_domain,highlighted_data){
    var preprocessed_data = [];
    var ticks = [];
    var x_ticks = [];
    var gap = y_domain/4;
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
        color: (()=>{
          if (!_.isEmpty(highlighted_data)) {
            if (this.props.viewed_region == "All") {
              if (highlighted_data.region_name == datum.name) {
                return datum.color;
              } else {
                return "#dedede";
              }
            }
          } else {
            return datum.color;
          }
        })()
      });
      var tick = {};
      tick.name = datum.name;
      tick.value = i + 1;
      x_ticks.push(tick);
    }
    return {
      ticks,
      x_ticks,
      preprocessed_data
    };
  }

  componentWillReceiveProps(nextProps){
    if(!_.isEqual(this.props.data, nextProps.data)){
      const {
        ticks,
        x_ticks,
        preprocessed_data
      } = this.preprocessedData(nextProps.data, nextProps.y_domain);
      this.setState({
        
        preprocessed_data: preprocessed_data,
        ticks: ticks,
        x_ticks: x_ticks,
      });
    }
    if (!_.isEqual(this.props.highlighted_data, nextProps.highlighted_data)) {
      const {
        ticks,
        x_ticks,
        preprocessed_data
      } = this.preprocessedHighlightData(nextProps.data, nextProps.y_domain, nextProps.highlighted_data);
      this.setState({

        preprocessed_data: preprocessed_data,
        ticks: ticks,
        x_ticks: x_ticks,
      });
    }
  }

  render(){
    
    return (
      <XYPlot
        colorType="literal"
        xDomain={[0, this.props.y_domain]}
        width={150 + (this.props.first ? 160 : 0)}
        height={15*this.props.data.length + 25}
        margin={{ bottom: 10, left: (this.props.first?170:10),top : 25 }}>
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
                key={i}
                color={
                  (()=>{
                    if(!_.isEmpty(this.props.highlighted_data)){
                      if (this.props.viewed_region=="All"){
                        if (this.props.highlighted_data.region_name == this.props.data[i].name){
                          return this.props.data[i].color;
                        } else {
                          return "#dedede";
                        }
                      }
                    } else {
                      return this.props.data[i].color;
                    }
                  })()
                }
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
          data={this.state.preprocessed_data} />
        {(()=>{
          if (this.props.viewed_region == "All") {
            if(!_.isEmpty(this.props.highlighted_data)){
              const index = _.findIndex(this.props.data, (datum)=>{
                return (datum.name == this.props.highlighted_data.region_name)
              });
              if(index!=-1){
                return (
                  <MarkSeries
                    data={[{
                      y: (index+1),
                      x: parseFloat(this.props.highlighted_data.value),
                      color: "black"
                  }]}/>
                )
              }
            }
          }
        })()}
      </XYPlot>
    );
  }
}