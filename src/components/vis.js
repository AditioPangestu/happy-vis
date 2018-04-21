import React, {Component} from "react";
import axios from "axios";
import _ from "lodash";
import GeneralMap from "./generalMap";
import BubbleVis from "./bubble-vis";
import Legends from "./legend";

class Vis extends Component {
  constructor(props){
    super(props);
    this.state = { 
      data_2015 : {
        raw : [],
        aggregates : [{
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
        console.log("continents", response.data);
        axios.get('./src/data/processed_2015.json')
        .then((response) => {
          const { data } = response;
          this.setState({
            ...this.state,
            data: {raw:data, aggregates:this.preproccesData(data, continents)}
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
    var atribut_names = ["life_expectancy", "generosity", "trust", "freedom", "family", "gdp"]
    var atribut_reader_names = ["Life Expectancy", "Generosity", "Trust", "Freedom", "Family", "GDP"]
    var aggregates = [];
    for (var i = 0; i < atribut_names.length;i++){
      var aggregate = {}
      aggregate.attribute_name = atribut_names[i];
      aggregate.name = atribut_reader_names[i];
      aggregate.data = [];
      aggregate.max_value = parseFloat(_.maxBy(data,(datum)=>{
        return parseFloat(datum[aggregate.attribute_name]);
      })[aggregate.attribute_name]);
      for(var j = 0; j < continents.length;j++){
        var continent = {};
        continent.name = continents[j].name;
        continent.color = continents[j].color;
        continent.value = this.meanContinent(data, aggregate.attribute_name, continent.name);
        aggregate.data.push(continent);
      }
      aggregates.push(aggregate);
    }
    return aggregates;
  }

  render(){
    if (!_.isEmpty(this.state.data)){
      return (
        <div>
          <section className="section">
            <div className="columns is-gapless is-marginless">
              <div className="column is-9"
                style={{
                  width:"600px"
                }}>
                <div className="content">
                  <p className="title is-4">World Happiness Score</p>
                </div>
                <GeneralMap />
                <div className="content">
                  <div className="field is-horizontal">
                    <div className="field-label is-small">
                      <label className="label">Continent</label>
                    </div>
                    <div className="field-body">
                      <div className="field is-narrow">
                        <div className="control">
                          <div className="select is-fullwidth is-small">
                            <select>
                              <option>All</option>
                              <option>Eastern Asia</option>
                              <option>Western Europe</option>
                              <option>Southeastern Asia</option>
                              <option>North America</option>
                              <option>Sub-Saharan Africa</option>
                              <option>Southern Asia</option>
                              <option>Central and Eastern Europe</option>
                              <option>Latin America and Caribbean</option>
                              <option>Australia and New Zealand</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="column">
                {(() => {
                  var bubbles = [];
                  for (var i = 0; i < 6; i++) {
                    bubbles.push(
                      <div key={i}>
                        {/* <p className="is-size-7 title__bar">{this.state.data.aggregates[i].name} Score</p> */}
                        <BubbleVis
                          last={i==5}
                          name={this.state.data.aggregates[i].name}
                          first={true}
                          width={this.state.width}
                          height={400}
                          data={this.state.data.aggregates[i].data}
                          y_domain={this.state.data.aggregates[i].max_value} />
                      </div>
                    );
                  }
                  return bubbles;
                })()}
              </div>
            </div>
          </section>
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

export default Vis;