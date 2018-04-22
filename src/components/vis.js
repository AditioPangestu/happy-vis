import React, {Component} from "react";
import axios from "axios";
import _ from "lodash";
import chroma from "chroma-js";
import GeneralMap from "./generalMap";
import BubbleVis from "./bubble-vis";
import Legends from "./legend";

class Vis extends Component {
  constructor(props){
    super(props);
    this.state = { 
      data : {
        raw: [],
        aggregates: []
      },
      highlighted_data : {},
      regions : [],
      viewed_region : "All",
      current_x0_window : 0,
      current_x_window : 0,
      default_x0_window : 0,
      default_x_window : 0,
      width : 700,
      prev_absis : 0,
      is_mouse_down : false,
    };
    this.onChangeDropdown = this.onChangeDropdown.bind(this);
  }

  componentWillMount(){
    axios.get('./src/data/regions.json')
      .then((response) => {
        const regions = response.data.data;
        this.setState({
          ...this.state,
          regions: regions
        })
        axios.get('./src/data/ranked_2017.json')
          .then((response) => {
            const { data } = response;
            this.setState({
              ...this.state,
              data: {raw:data, aggregates:this.preproccesData(data, regions)}
            })
          });
      });
  }

  meanregion(data, atribut, region_name) {
    return _.meanBy(_.filter(data, (datum) => { return datum.region == region_name}),(datum)=>{
      return parseFloat(datum[atribut]);
    })
  }

  preproccesData(data, regions){
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
      for(var j = 0; j < regions.length;j++){
        var region = {};
        region.name = regions[j].name;
        region.color = regions[j].color;
        region.value = this.meanregion(data, aggregate.attribute_name, region.name);
        aggregate.data.push(region);
      }
      aggregates.push(aggregate);
    }
    return aggregates;
  }

  preproccesregionData(data, region) {
    var atribut_names = ["life_expectancy", "generosity", "trust", "freedom", "family", "gdp"]
    var atribut_reader_names = ["Life Expectancy", "Generosity", "Trust", "Freedom", "Family", "GDP"]
    var aggregates = [];
    const color_scale = chroma.scale(['white', region.color]).mode('lab');    
    const region_data = _.filter(data,(datum)=>{return (datum.region == region.name)});
    for (var i = 0; i < atribut_names.length; i++) {
      var aggregate = {}
      aggregate.attribute_name = atribut_names[i];
      aggregate.name = atribut_reader_names[i];
      aggregate.data = [];
      aggregate.max_value = parseFloat(_.maxBy(region_data, (datum) => {
        return parseFloat(datum[aggregate.attribute_name]);
      })[aggregate.attribute_name]);
      aggregates.push(aggregate);
    }
    for(var i=0; i < region_data.length;i++){
      const datum = region_data[i];
      for (var j = 0; j < atribut_names.length; j++) {
        aggregates[j].data.push({
          name: datum.country,
          value: parseFloat(datum[[atribut_names[j]]]),
          color: color_scale((region_data.length-i)/region_data.length+.5).hex()
        });
      }
    }
    return aggregates;
  }

  onChangeDropdown(e){
    const {value} = e.target;
    this.setState({
      ...this.state,
      viewed_region : value
    })
    if(value == "All"){
      this.setState({
        ...this.state,
        data: { raw: this.state.data.raw, aggregates: this.preproccesData(this.state.data.raw, this.state.regions) }
      })
    } else {
      console.log("cuy");
      this.setState({
        ...this.state,
        data: { raw: this.state.data.raw, aggregates: this.preproccesregionData(this.state.data.raw, _.find(this.state.regions,{name : value})) }
      })
    }
  }

  render(){
    if (this.state.data.aggregates.length != 0){
      return (
        <div>
          <section className="section">
            <div className="columns is-gapless is-marginless">
              <div className="column is-9"
                style={{
                  width:"700px"
                }}>
                <GeneralMap />
                
              </div>
              <div className="column">
                <div className="content">
                  <p className="title is-4">World Happiness Score</p>
                  <div className="field is-horizontal">
                    <div className="field-label is-small">
                      <label className="label">region</label>
                    </div>
                    <div className="field-body">
                      <div className="field is-narrow">
                        <div className="control">
                          <div className="select is-fullwidth is-small">
                            <select onChange={this.onChangeDropdown}>
                              <option value="All">All</option>
                              <option value="Eastern Asia">Eastern Asia</option>
                              <option value="Western Europe">Western Europe</option>
                              <option value="Southeastern Asia">Southeastern Asia</option>
                              <option value="North America">North America</option>
                              <option value="Sub-Saharan Africa">Sub-Saharan Africa</option>
                              <option value="Southern Asia">Southern Asia</option>
                              <option value="Central and Eastern Europe">Central and Eastern Europe</option>
                              <option value="Latin America and Caribbean">Latin America and Caribbean</option>
                              <option value="Australia and New Zealand">Australia and New Zealand</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="columns is-gapless is-marginless">
              {(() => {
                var bubbles = [];
                for (var i = 0; i < 6; i++) {
                  bubbles.push(
                    <div className="column" key={i}>
                      <p className={"is-size-7 title__bar "+((i==0)?"is-first":"")}>{this.state.data.aggregates[i].name} Score</p>
                      <BubbleVis
                        first={i == 0}
                        name={this.state.data.aggregates[i].name}
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