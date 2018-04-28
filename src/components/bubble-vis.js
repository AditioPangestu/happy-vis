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
  Hint
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
    this.onHover = this.onHover.bind(this);
  }

  onHover(value){
    const index = Math.floor(value.y0);
    const datum_index = _.findIndex(this.props.raw, (datum) => {
      return datum.country == this.props.data[index].name
    });
    if (datum_index != -1) {
      const datum = this.props.raw[datum_index];
      this.props.handleBubbleHover(datum, datum);
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
            } else {
              if (highlighted_data.country_name == this.props.data[i].name) {
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
    const { AUTO, BOTTOM} = Hint.ALIGN;
    var viewed_highlight_data = {};
    if (!_.isEmpty(this.props.highlighted_data)) {
      if (this.props.viewed_region == "All") {
        const index = _.findIndex(this.props.data, (datum) => {
          return (datum.name == this.props.highlighted_data.region_name)
        });
        if (index != -1) {
          viewed_highlight_data.y = index + 1;
          viewed_highlight_data.x = parseFloat(this.props.highlighted_data.value);
          viewed_highlight_data.value = parseFloat(this.props.highlighted_data.value).toFixed(2);
          viewed_highlight_data.name = this.props.highlighted_data.country_name;
        }
      } else {
        const index = _.findIndex(this.props.data, (datum) => {
          return (datum.name == this.props.highlighted_data.country_name)
        });
        viewed_highlight_data.y = index + 1;
        viewed_highlight_data.x = parseFloat(this.props.highlighted_data.value);
        viewed_highlight_data.value = parseFloat(this.props.highlighted_data.value).toFixed(2);
        viewed_highlight_data.name = this.props.highlighted_data.country_name;
      }
    }
    return (
      <XYPlot
        colorType="literal"
        xDomain={[0, this.props.y_domain]}
        width={150 + (this.props.first ? 160 : 0)}
        height={18*this.props.data.length + 25}
        margin={{ bottom: 0, left: (this.props.first?170:10),top : 25 }}>
        <VerticalGridLines 
          tickValues={_.map(this.state.ticks, (tick) => { return tick.value })}/>
        <HorizontalGridLines 
          tickValues={_.range(1, this.props.data.length+1)}/>
        <XAxis
          orientation="top"
          hideLine
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
                      } else {
                          if (this.props.highlighted_data.country_name == this.props.data[i].name){
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
          size={4}
          data={this.state.preprocessed_data} />
        <VerticalRectSeries
          onValueMouseOver={this.onHover}
          onValueMouseOut={() => { this.props.handleBubbleHover({}, {})}}
          data={_.map(this.state.preprocessed_data,(datum, index)=>{
            return {
              x0 : 0,
              x : this.props.y_domain,
              y0 : ((index)*1+.5),
              y : ((index+1)*1+.5),
              opacity : 0
            }
          })}
        />
        {(()=>{
          if ((this.props.viewed_region == "All") && (!_.isEmpty(viewed_highlight_data))) {
            return (
              <MarkSeries
                size={4}
                data={[{
                  y: viewed_highlight_data.y,
                  x: viewed_highlight_data.x,
                  color: "black"
              }]}/>
            )
          }
        })()}
        {(()=>{
          if (!_.isEmpty(viewed_highlight_data)) {
            return (
              <Hint 
                align={{
                  horizontal: AUTO,
                  vertical: BOTTOM
                }}
                value={{
                  y: viewed_highlight_data.y - .5,
                  x: viewed_highlight_data.x,
                }}>
                <div className="box is-dark is-marginless"
                  style={{ maxWidth: "100px", padding: ".1rem .3rem", backgroundColor:"#ffffff8c"}}>
                  <p className="is-size-7"><b>{viewed_highlight_data.value}</b></p>
                  <p style={{fontSize:".5rem"}}>{viewed_highlight_data.name}</p>
                </div>
              </Hint>
            )
          }
        })()}

      </XYPlot>
    );
  }
}