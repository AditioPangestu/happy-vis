import React, { Component } from "react";
import axios from "axios";
import _ from "lodash";

import {
  ComposableMap,
  ZoomableGroup,
  Geographies,
  Geography,
  Markers,
  Marker
} from "react-simple-maps";

import {
  XYPlot,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
  VerticalBarSeries,
  Hint
} from 'react-vis';

import { Motion, spring } from "react-motion"

import tooltip from "wsdm-tooltip"


class GeneralMap extends Component {

  constructor(props) {
    super(props);
    this.state = {
      center: [0, 20],
      zoom: 1,
      world_map: {},
      continents: [],
      default_style: {
        default: {
          fill: "#ECEFF1",
          stroke: "#607D8B",
          strokeWidth: 0.1,
          outline: "none",
        },
        hover: {
          fill: "#607D8B",
          stroke: "#607D8B",
          strokeWidth: 0.1,
          outline: "none",
        },
        pressed: {
          fill: "#FF5722",
          stroke: "#607D8B",
          strokeWidth: 0.1,
          outline: "none",
        },
      },
      country_colors: [],
      disableOptimization: false,
      tooltips_data: {},
      disablePanning: false,
      continent: {},
    };

    this.handleZoomIn = this.handleZoomIn.bind(this)
    this.handleZoomOut = this.handleZoomOut.bind(this)
    this.handleContinentClick = this.handleContinentClick.bind(this)
    this.handleReset = this.handleReset.bind(this)

    this.handleMove = this.handleMove.bind(this)
    this.handleLeave = this.handleLeave.bind(this)
    this.onViewLoaded = this.onViewLoaded.bind(this)
    this.viewGeographyLatLong = this.viewGeographyLatLong.bind(this)
    this.handleContinentReset = this.handleContinentReset.bind(this)
  }

  viewGeographyLatLong(geography, evt) {
    console.log(evt.clientX + ', ' + evt.clientY)
  }

  onViewLoaded(passed_data) {
    if (_.isEmpty(this.state.tooltips_data)) {
      return
    }
    // console.log(this.state.tooltips_data)
    const x = this.state.tooltips_data[passed_data.country][0];
    const y = this.state.tooltips_data[passed_data.country][1];

    const index = _.findIndex(this.props.raw, (datum) => {
      return datum.country == passed_data.country
    });

    if ((index != -1) && ((this.props.raw[index].region == this.props.viewed) || (this.props.viewed == "All"))) {
      const datum = this.props.raw[index];
      this.tip.show(`
        <div>
          <p class="is-size-7"><b>${datum.country + " "}</b><span class="is-size-7">${parseFloat(datum.happiness_score).toFixed(2)}</span></p>
        </div>
      `)
      this.tip.position({
        pageX: x,
        pageY: y
      })
      this.props.handleHover(datum);
    } else {
      this.props.handleHover({});
    }
  }

  handleMove(geography, evt) {
    const x = evt.clientX
    const y = evt.clientY + window.pageYOffset
    // const y = evt.clientY 
    const index = _.findIndex(this.props.raw, (datum)=>{
      return datum.country == geography.properties.name
    });
    if ((index != -1) && ((this.props.raw[index].region == this.props.viewed) || (this.props.viewed=="All"))){
      const datum = this.props.raw[index];
      this.tip.show(`
        <div>
          <p class="is-size-7"><b>${datum.country+" "}</b><span class="is-size-7">${parseFloat(datum.happiness_score).toFixed(2)}</span></p>
        </div>
      `)
      this.tip.position({
        pageX: x,
        pageY: y
      })
      this.props.handleHover(datum);
    } else {
      // this.tip.show(`
      //   <div class="tooltip-inner">
      //     ${geography.properties.name}
      //   </div>
      // `)
      // this.tip.position({
      //   pageX: x,
      //   pageY: y
      // })
      this.props.handleHover({});
    }
    var defaultStyle = this.state.default_style
  }
  handleLeave() {
    this.tip.hide();
    this.props.handleHover("");
  }

  handleZoomIn() {
    this.setState({
      
      zoom: this.state.zoom * 2,
      disablePanning: false,
    })
  }
  handleZoomOut() {
    this.setState({
      
      zoom: this.state.zoom / 2,
      disablePanning: false,
    })
  }

  handleContinentReset() {
    if (!_.isEmpty(this.state.continent)) {

      this.handleContinentClick(this.state.continent)
    } else {
      this.handleReset()
    }
  }

  handleContinentClick(continent) {
    this.setState({
      continent: continent,
      disableOptimization: true,
      zoom: continent.zoom,
      center: continent.coordinate,
      disablePanning: true,
    }, () => {
      this.setState({
        disableOptimization: false,
      })
    })
  }

  handleReset() {
    this.setState({
      continent: {},
      disableOptimization: true,
      center: [0, 20],
      zoom: 1,
      disablePanning: false,
    }, () => {
      this.setState({
        disableOptimization: false
      })
    })
  }

  componentWillMount() {

    axios.get('./src/data/world-50m.json')
      .then((response) => {
        const data = response;
        this.setState({
          
          world_map: data
        })
        axios.get('./src/data/regions.json')
          .then((response) => {
            var continents_centroid = response.data.data;
            this.setState({
              
              continents: continents_centroid
            })
            axios.get('./src/data/tooltips.json')
              .then((response) => {
                var tooltips_data = response.data;
                this.setState({

                  tooltips_data: tooltips_data
                })
              })
          })
      })
  }

  componentDidMount() {
    this.tip = tooltip();
    this.tip.create()
  }
  
  componentWillReceiveProps(nextProps) {

    if (this.props.viewed != nextProps.viewed) {
      if (nextProps.viewed == 'All') {
        this.handleReset()
      } else {
        // this.handleReset()
        this.handleContinentClick(this.state.continents[this.state.continents.findIndex(obj => obj.name == nextProps.viewed)])
      }
    }
    if (this.props.country_colors != nextProps.country_colors) {
      this.setState({
        disableOptimization: true,
        fill_color: nextProps.country_colors
      }, () => {
        this.setState({
          disableOptimization: false
        })
      })
      // this.setState({
      //   fill_color: nextProps.country_colors
      // })
    }
    if (this.props.map_highlighted_data != nextProps.map_highlighted_data) {
      if (!_.isEmpty(nextProps.map_highlighted_data)) {
        this.onViewLoaded(nextProps.map_highlighted_data);
      } else {
        this.tip.hide()
      }
    }
  }
  
  render() {
    var geographys = []
    // console.log(this.props.country_colors[this.props.country_colors.findIndex(obj => obj.name == "Australia")].color)
    var fill_color = this.props.country_colors
    if (this.state.continents.length > 0 && this.props.country_colors.length > 0) {
      return (
        <div>
          <button onClick={this.handleZoomIn}>+</button>
          <button onClick={this.handleZoomOut}>-</button>
          <button onClick={this.handleContinentReset}>Reset</button>
          {/* <button onClick={this.onViewLoaded}>asdf</button> */}

          <Motion
            defaultStyle={{
              zoom: 1,
              x: 0,
              y: 20
            }}
            style={{
              zoom: spring(this.state.zoom, { stiffness: 210, damping: 20 }),
              x: spring(this.state.center[0], { stiffness: 210, damping: 20 }),
              y: spring(this.state.center[1], { stiffness: 210, damping: 20 }),
            }}
          >
          {({zoom,x,y}) => (
            <ComposableMap
              projectionConfig={{
                scale: 137.28,
                rotation: [-11, 0, 0],
              }}
              width={635.406400747}
              height={350}
            >
              <ZoomableGroup center={[x,y]} zoom={zoom} disablePanning={this.state.disablePanning}>
                <Geographies geography="./src/data/world-50m.json" disableOptimization={this.state.disableOptimization}>
                  {(geographies, projection) => geographies.map((geography, i) => geography.id !== "ATA" && (

                      <Geography
                        key={i}
                        geography={geography}
                        projection={projection}
                        onMouseMove={this.handleMove}
                        onMouseLeave={this.handleLeave}
                        onClick={this.viewGeographyLatLong}
                        style={{
                          default: {
                            fill: fill_color[fill_color.findIndex(obj => obj.name == geography.properties.name)].color,
                            stroke: "#607D8B",
                            strokeWidth: 0.3,
                            outline: "none",
                          },
                          hover: {
                            fill: (fill_color[fill_color.findIndex(obj => obj.name == geography.properties.name)].color == "#ffffff" ? "#ffffff":"#607D8B"),
                            stroke: "#607D8B",
                            strokeWidth: 0.3,
                            outline: "none",
                          },
                          pressed: {
                            fill: "#ffffff",
                            stroke: "#607D8B",
                            strokeWidth: 0.3,
                            outline: "none",
                          }
                        }}
                      />
                  ))}
                </Geographies>
                {/* <Graticule /> */}
              </ZoomableGroup>
            </ComposableMap>
            )}
          </Motion>
        </div>
      );
    } else {
      return (
        <div>
          Loading...
        </div>
      )
    }
    
  }
}

export default GeneralMap;