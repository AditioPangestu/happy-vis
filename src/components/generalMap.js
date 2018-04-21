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
} from "react-simple-maps"

import { Motion, spring } from "react-motion"



class GeneralMap extends Component {

  constructor(props) {
    super(props);
    this.state = {
      center: [0, 20],
      zoom: 1,
      world_map: {},
      continents: []
    };

    this.handleZoomIn = this.handleZoomIn.bind(this)
    this.handleZoomOut = this.handleZoomOut.bind(this)
    this.handleContinentClick = this.handleContinentClick.bind(this)
    this.handleReset = this.handleReset.bind(this)

  }

  handleZoomIn() {
    this.setState({
      zoom: this.state.zoom * 2,
    })
  }
  handleZoomOut() {
    this.setState({
      zoom: this.state.zoom / 2,
    })
  }
  handleContinentClick(continent) {
    this.setState({
      zoom: 2,
      center: continent.coordinates,
    })
  }
  handleReset() {
    this.setState({
      center: [0, 20],
      zoom: 1,
    })
  }

  componentWillMount() {
    axios.get('./src/data/world-50m.json')
      .then((response) => {
        const data = response;
        this.setState({
          ...this.state,
          world_map: data
        })
        axios.get('./src/data/continents.json')
          .then((response) => {
            var continents_centroid = response.data.data;
            console.log(continents_centroid)
            this.setState({
              ...this.state,
              continents: continents_centroid
            })
          })
      })
  }

  
  
  render() {
    // if (!_.isEmpty(this.state.continents)) {
    if (this.state.continents.length > 0) {
      return (
        <div>

          {this.state.continents.map(
            (continent, i) => (
              <button
                key={i}
                onClick={() => this.handleContinentClick(continent)}
              >
                {continent.name}
              </button>
            )
          )}
          <button onClick={this.handleReset}>Reset</button>

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
                scale: 147.28,
                rotation: [-11, 0, 0],
              }}
              width={700}
              height={385.58}
            // style={{
            //   width: "75%",
            //   height: "auto",
            // }}
            >
              <ZoomableGroup center={[x,y]} zoom={zoom} disablePanning>
                <Geographies geography="./src/data/world-50m.json" >
                  {(geographies, projection) => geographies.map((geography, i) => geography.id !== "ATA" && (
                    <Geography
                      key={i}
                      geography={geography}
                      projection={projection}
                      style={{
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
                      }}
                    />
                  ))}
                </Geographies>
                
              </ZoomableGroup>
            </ComposableMap>)}
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