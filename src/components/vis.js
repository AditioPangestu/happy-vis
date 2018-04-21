import React, {Component} from "react";
import axios from "axios";
import _ from "lodash";
import GeneralMap from "./generalMap";
import BubbleVis from "./bubble-vis";

class Vis extends Component {
  constructor(props){
    super(props);
    this.state = { 
      data_2015 : {
        raw : [],
        agregate : [{
          data : [{
            name : "name",
            value : 0
          }],
          max_value : 999,
          attribute_name : "",
        }]
      },
      data_2016 : {

      },
      data_2017 : {

      },
      data : {

      },
      highlighted_data : {},
      continents : [],
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
    axios.get('./src/data/continents.json')
      .then((response) => {
        const continents = response.data.data;
        this.setState({
          ...this.state,
          continents: continents
        })
        axios.get('./src/data/processed_2015.json')
          .then((response) => {
            const { data } = response;
            this.setState({
              ...this.state,
              data: this.preproccesData(data, continents)
            })
          });
      });
  }

  meanContinent(data, atribut, region_name) {
    return _.meanBy(_.filter(data, (datum) => { return datum.region == region_name}),(datum)=>{
      return parseFloat(datum[atribut]);
    })
  }

  preproccesData(data, continents){
    var atribut_names = ["generosity", "trust", "freedom", "life_expectancy", "family", "gdp"]
    var agregates = [];
    for (var i = 0; i < atribut_names.length;i++){
      var agregate = {}
      agregate.attribute_name = atribut_names[i];
      agregate.data = [];
      agregate.max_value = parseFloat(_.maxBy(data,(datum)=>{
        return parseFloat(datum[agregate.attribute_name]);
      })[agregate.attribute_name]);
      for(var j = 0; j < continents.length;j++){
        var continent = {};
        continent.name = continents[j].name;
        continent.value = this.meanContinent(data, agregate.attribute_name, continent.name);
        agregate.data.push(continent);
      }
      agregates.push(agregate);
    }
    console.log(agregates);
  }

  render(){
    if (this.state.data.length){
      return (
        <section className="section">
          <div className="columns">
            <div className="column is-9"
              style={{
                width:"700px"
              }}>
              <GeneralMap />
              <div className="columns is-gapless is-marginless">
                <div className="column">
                  <p>Cek</p>
                  <BubbleVis
                    first={true}
                    width={this.state.width}
                    height={400}
                    data={_.map(this.state.data,(datum)=>{
                      return {
                        x : parseFloat(datum.long),
                        y: parseFloat(datum.lat),
                        size: parseFloat(datum.gdp)
                      }
                    })}/>
                </div>
                <div className="column">
                  <p>Makan</p>
                  <BubbleVis
                    first={true}
                    width={this.state.width}
                    height={400}
                    data={_.map(this.state.data, (datum) => {
                      return {
                        x: parseFloat(datum.long),
                        y: parseFloat(datum.lat),
                        size: parseFloat(datum.gdp)
                      }
                    })} />
                </div>
                <div className="column">
                  <p>Makan</p>
                  <BubbleVis
                    first={true}
                    width={this.state.width}
                    height={400}
                    data={_.map(this.state.data, (datum) => {
                      return {
                        x: parseFloat(datum.long),
                        y: parseFloat(datum.lat),
                        size: parseFloat(datum.gdp)
                      }
                    })} />
                </div>
              </div>
              <div className="columns is-gapless">
                <div className="column">
                  <p>Cek</p>
                  <BubbleVis
                    width={this.state.width}
                    height={400}
                    data={_.map(this.state.data,(datum)=>{
                      return {
                        x : parseFloat(datum.long),
                        y: parseFloat(datum.lat),
                        size: parseFloat(datum.gdp)
                      }
                    })}/>
                </div>
                <div className="column">
                  <p>Makan</p>
                  <BubbleVis
                    first={false}
                    width={this.state.width}
                    height={400}
                    data={_.map(this.state.data, (datum) => {
                      return {
                        x: parseFloat(datum.long),
                        y: parseFloat(datum.lat),
                        size: parseFloat(datum.gdp)
                      }
                    })} />
                </div>
                <div className="column">
                  <p>Makan</p>
                  <BubbleVis
                    first={false}
                    width={this.state.width}
                    height={400}
                    data={_.map(this.state.data, (datum) => {
                      return {
                        x: parseFloat(datum.long),
                        y: parseFloat(datum.lat),
                        size: parseFloat(datum.gdp)
                      }
                    })} />
                </div>
              </div>
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