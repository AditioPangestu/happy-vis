import React, {Component} from "react";
import axios from "axios";
import _ from "lodash";
import GeneralMap from "./generalMap";
import BubbleVis from "./bubble-vis";

class Vis extends Component {
  constructor(props){
    super(props);
    this.state = { 
      data : [],
      highlighted_data : {},
      current_x0_window : 0,
      current_x_window : 0,
      default_x0_window : 0,
      default_x_window : 0,
      width : 700,
      prev_absis : 0,
      is_mouse_down : false,
    };
   
  }

  componentWillMount(){
    axios.get('./src/data/processed_2015.json')
      .then((response) => {
        const {data} = response;
        this.setState({
          ...this.state,
          data : data
        })
      })
  }

  render(){
    if (this.state.data.length){
      return (
        <section className="section">
          <div className="columns">
            <div className="column is-9">
              <BubbleVis
                width={this.state.width}
                height={200}
                data={_.map(this.state.data,(datum)=>{
                  return {
                    x : datum.long,
                    y : datum.lat,
                    size: datum.gdp
                  }
                })}/>
            </div>
            <div className="column is-3">
              
          </div>
          </div>
        </section>
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

export default Vis;