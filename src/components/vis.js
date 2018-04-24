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
      map_data : [],
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
    this.preproccesMapData = this.preproccesMapData.bind(this);
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
            axios.get('./src/data/country_colors.json')
              .then((response) => {
                var country_colors = response.data.data;
                const aggregates = this.preproccesData(data, regions);
                const map_data = this.preproccesMapData(data, country_colors);

                this.setState({
                  ...this.state,
                  country_colors: country_colors,
                  map_data: map_data,
                  data: { raw: data, aggregates: aggregates  }
                })
              });
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
      var aggregate = {};
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

  preproccesMapData(data, country_colors){
    var map_data = _.clone(country_colors,true);
    const max_happy_score = parseFloat(_.maxBy(data, (datum) => {
      return parseFloat(datum.happiness_score);
    }).happiness_score);
    const min_happy_score = parseFloat(_.minBy(data, (datum) => {
      return parseFloat(datum.happiness_score);
    }).happiness_score);
    const color_scale = chroma.scale(['#d998cb', '#f2d249']).mode('lab');
    for(var j=0;j<country_colors.length;j++){
      const country_color = country_colors[j];
      const index = _.findIndex(data,(datum)=>{
        return datum.country == country_color.name;
      });
      if(index!=-1){
        map_data[j].color = color_scale(((data[index].happiness_score - min_happy_score) / (max_happy_score - min_happy_score))).hex()
      }
    }
    return map_data;
  }

  preproccesregionData(data, region, country_colors) {
    var atribut_names = ["life_expectancy", "generosity", "trust", "freedom", "family", "gdp"];
    var atribut_reader_names = ["Life Expectancy", "Generosity", "Trust", "Freedom", "Family", "GDP"];
    var aggregates = [];
    var map_data = _.clone(country_colors,true);
    const color_scale = chroma.scale([region.color, '#f2d249']).mode('lab');    
    const region_data = _.filter(data,(datum)=>{return (datum.region == region.name)});
    const max_happy_score = parseFloat(_.maxBy(region_data, (datum) => {
      return parseFloat(datum.happiness_score);
    }).happiness_score);
    const min_happy_score = parseFloat(_.minBy(region_data, (datum) => {
      return parseFloat(datum.happiness_score);
    }).happiness_score);
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
    for (var i = 0; i < region_data.length; i++) {
      const datum = region_data[i];
      for (var j = 0; j < atribut_names.length; j++) {
        aggregates[j].data.push({
          name: datum.country,
          value: parseFloat(datum[[atribut_names[j]]]),
          color: color_scale(((region_data[i].happiness_score - min_happy_score) / (max_happy_score - min_happy_score))).hex()
        });
      }
    }
    for (var j = 0; j < country_colors.length; j++) {
      const country_color = country_colors[j];
      const index = _.findIndex(region_data, (datum) => {
        return datum.country == country_color.name;
      });
      if (index != -1) {
        map_data[j].color = color_scale(((region_data[index].happiness_score - min_happy_score) / (max_happy_score - min_happy_score))).hex()
      }
    }
    return {
      map_data,
      aggregates
    };
  }

  handleMapHover(country_name){

  }

  onChangeDropdown(e){
    const {value} = e.target;
    if(value == "All"){
      this.setState({
        ...this.state,
        viewed_region: value,
        data: { raw: this.state.data.raw, aggregates: this.preproccesData(this.state.data.raw, this.state.regions), map_data: this.preproccesMapData(this.state.data.raw,this.state.country_colors) }
      })
    } else {
      const { aggregates, map_data } = this.preproccesregionData(this.state.data.raw, _.find(this.state.regions, { name: value }), this.state.country_colors);
      this.setState({
        ...this.state,
        viewed_region: value,
        data: { raw: this.state.data.raw, aggregates: aggregates, map_data:map_data }
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
                <GeneralMap viewed={this.state.viewed_region} country_colors={this.state.map_data} />
                
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