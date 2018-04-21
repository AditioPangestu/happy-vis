import React, { Component } from "react";
import axios from "axios";
import _ from "lodash";

import {
  ComposableMap,
  ZoomableGroup,
  Geographies,
  Geography,
} from "react-simple-maps"


class GeneralMap extends Component {

  constructor(props) {
    super(props);
    this.state = {
      world_map: {},
    };

  }

  componentWillMount() {
    axios.get('./src/data/world-50m.json')
      .then((response) => {
        const data = response;
        this.setState({
          ...this.state,
          world_map: data
        })
      })
  }
  
  render() {
    if (!_.isEmpty(this.state.world_map)) {
      return (
        <div>
          <ComposableMap
            projectionConfig={{
              scale: 130,
              rotation: [-11, 0, 0],
            }}
            width={600}
            height={330.5}
          // style={{
          //   width: "75%",
          //   height: "auto",
          // }}
          >
            <ZoomableGroup center={[0, 20]} disablePanning>
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
                        strokeWidth: 0.75,
                        outline: "none",
                      },
                      hover: {
                        fill: "#607D8B",
                        stroke: "#607D8B",
                        strokeWidth: 0.75,
                        outline: "none",
                      },
                      pressed: {
                        fill: "#FF5722",
                        stroke: "#607D8B",
                        strokeWidth: 0.75,
                        outline: "none",
                      },
                    }}
                  />
                ))}
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
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