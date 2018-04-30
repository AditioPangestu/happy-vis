import React, {Component} from "react";
import axios from "axios";
import _ from "lodash";
import chroma from "chroma-js";
import GeneralMap from "./generalMap";
import BubbleVis from "./bubble-vis";
import Legends from "./legend";
import RankedVis from "./ranked-vis";
import {ContinuousColorLegend} from "react-vis";

class Vis extends Component {
  constructor(props){
    super(props);
    this.state = { 
      data : {
        raw: [],
        aggregates: []
      },
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
      country_name : "",
      highlighted_data : {},
      max_happy_score:0,
      min_happy_score:0,
      scroll_index : {index : 0, update:true},
    };
    this.onChangeDropdown = this.onChangeDropdown.bind(this);
    this.preproccesMapData = this.preproccesMapData.bind(this);
    this.handleBubbleHover = this.handleBubbleHover.bind(this);
    this.handleHover = this.handleHover.bind(this);
    this.onRankedHover = this.onRankedHover.bind(this);
    this.onWheel = this.onWheel.bind(this);
  }

  componentWillMount(){
    axios.get('./src/data/regions.json')
      .then((response) => {
        const regions = response.data.data;
        this.setState({
          regions: regions
        })
        axios.get('./src/data/ranked_2017.json')
          .then((response) => {
            const { data } = response;
            axios.get('./src/data/country_colors.json')
              .then((response) => {
                var country_colors = response.data.data;
                const temp = _.cloneDeep(country_colors);
                const { map_data, max_happy_score, min_happy_score} = this.preproccesMapData(data, country_colors);
                const aggregates = this.preproccesData(data, regions, max_happy_score, min_happy_score);
                this.setState({
                  max_happy_score: max_happy_score,
                  min_happy_score: min_happy_score,
                  country_colors: temp,
                  map_data: map_data,
                  data: { raw: data, aggregates: aggregates  },
                  top_3: this.preproccesRankedData(data,max_happy_score,min_happy_score,false),
                  down_3: this.preproccesRankedData(data,max_happy_score,min_happy_score,true),
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

  preproccesData(data, regions, max_happy_score, min_happy_score){
    var atribut_names = ["life_expectancy", "generosity", "trust", "freedom", "family", "gdp"]
    var atribut_reader_names = ["Life Expectancy", "Generosity", "Trust", "Freedom", "Family", "GDP"]
    var aggregates = [];
    const color_scale = chroma.scale(['#33a8d4', '#ffdf36']);
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
        const happiness_score = this.meanregion(data, "happiness_score", region.name);
        region.color = color_scale(((happiness_score - min_happy_score) / (max_happy_score - min_happy_score))).hex();
        region.value = this.meanregion(data, aggregate.attribute_name, region.name);
        aggregate.data.push(region);
      }
      aggregates.push(aggregate);
    }
    return aggregates;
  }

  preproccesMapData(data, country_colors){
    var map_data = _.cloneDeep(country_colors);
    const max_happy_score = parseFloat(_.maxBy(data, (datum) => {
      return parseFloat(datum.happiness_score);
    }).happiness_score);
    const min_happy_score = parseFloat(_.minBy(data, (datum) => {
      return parseFloat(datum.happiness_score);
    }).happiness_score);
    const color_scale = chroma.scale(['#33a8d4', '#ffdf36']);
    for (var j = 0; j < map_data.length;j++){
      const country_color = map_data[j];
      const index = _.findIndex(data,(datum)=>{
        return datum.country == country_color.name;
      });
      if(index!=-1){
        map_data[j].color = color_scale(((data[index].happiness_score - min_happy_score) / (max_happy_score - min_happy_score))).hex()
      }
    }
    return {
      map_data,
      max_happy_score,
      min_happy_score,
    };
  }

  preproccesregionData(data, region, country_colors) {
    var atribut_names = ["life_expectancy", "generosity", "trust", "freedom", "family", "gdp"];
    var atribut_reader_names = ["Life Expectancy", "Generosity", "Trust", "Freedom", "Family", "GDP"];
    var aggregates = [];
    var map_data = _.cloneDeep(country_colors);
    const color_scale = chroma.scale(['#33a8d4', '#ffdf36']);    
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
    for (var i = 0; i < region_data.length; i++) {
      const datum = region_data[i];
      for (var j = 0; j < atribut_names.length; j++) {
        aggregates[j].data.push({
          name: datum.country,
          value: parseFloat(datum[[atribut_names[j]]]),
          color: color_scale(((region_data[i].happiness_score - this.state.min_happy_score) / (this.state.max_happy_score - this.state.min_happy_score))).hex()
        });
      }
    }
    for (var j = 0; j < map_data.length; j++) {
      const country_color = map_data[j];
      const index = _.findIndex(region_data, (datum) => {
        return datum.country == country_color.name;
      });
      if (index != -1) {
        map_data[j].color = color_scale(((region_data[index].happiness_score - this.state.min_happy_score) / (this.state.max_happy_score - this.state.min_happy_score))).hex()
      }
    }
    return {
      map_data,
      aggregates
    };
  }

  handleHover(highlighted_data){
    this.setState({
      highlighted_data: highlighted_data
    })
  }

  handleBubbleHover(highlighted_data, map_highlighted_data){
    this.setState({
      highlighted_data: highlighted_data,
      map_highlighted_data: map_highlighted_data,
    })
  }

  preproccesRankedData(data,max_happy_score,min_happy_score, desc){
    const color_scale = chroma.scale(['#33a8d4', '#ffdf36']);
    var sorted_data = [];
    if (desc){
      sorted_data = _.sortBy(data, (datum)=>{return (-datum.happiness_rank)});
    } else {
      sorted_data = _.sortBy(data, (datum)=>{return datum.happiness_rank});
    }
    return _.map(_.take(sorted_data,3),(datum)=>{
      return {
        happiness_score : parseFloat(datum.happiness_score),
        country : datum.country,
        color: color_scale(((parseFloat(datum.happiness_score) - min_happy_score) / (max_happy_score - min_happy_score))).hex()
      }
    });
  }

  onRankedHover(country_name) {
    const datum_index = _.findIndex(this.state.data.raw, (datum) => {
      return datum.country == country_name;
    });
    if (datum_index != -1) {
      const datum = this.state.data.raw[datum_index];
      this.handleBubbleHover(datum, datum);
    }
  }

  onChangeDropdown(e){
    const {value} = e.target;
    if(value == "All"){
      this.setState({
        viewed_region: value,
        map_data: this.preproccesMapData(this.state.data.raw, this.state.country_colors).map_data ,
        data: { raw: this.state.data.raw, aggregates: this.preproccesData(this.state.data.raw, this.state.regions, this.state.max_happy_score, this.state.min_happy_score)},
        top_3: this.preproccesRankedData(this.state.data.raw, this.state.max_happy_score, this.state.min_happy_score, false),
        down_3: this.preproccesRankedData(this.state.data.raw, this.state.max_happy_score, this.state.min_happy_score, true)
      });
    } else {
      const { aggregates, map_data } = this.preproccesregionData(this.state.data.raw, _.find(this.state.regions, { name: value }), this.state.country_colors);
      const region_data = _.filter(this.state.data.raw, (datum) => { return (datum.region == value) });
      this.setState({
        viewed_region: value,
        map_data: map_data,
        data: { raw: this.state.data.raw, aggregates: aggregates },
        top_3: this.preproccesRankedData(region_data, this.state.max_happy_score, this.state.min_happy_score, false),
        down_3: this.preproccesRankedData(region_data, this.state.max_happy_score, this.state.min_happy_score, true)
      });
    }
  }

  onWheel(event){
    event.preventDefault();
    if (this.state.scroll_index.index != "All"){
      if (event.deltaY < 0) {
        const scroll_index = this.state.scroll_index.index - 1;
        this.setState({
          scroll_index: {
            index : scroll_index < 0 ? 0 : scroll_index,
            update : true,
          }
        });
      } else {
        const scroll_index = this.state.scroll_index.index + 1;
        this.setState({
          scroll_index: {
            index : (scroll_index > (Math.ceil(this.state.data.aggregates[0].data.length / 10)-1) ? Math.ceil(this.state.data.aggregates[0].data.length / 10)-1 : scroll_index),
            update : true
          }
        });
      }
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
                  width:"652px"
                }}>
                <GeneralMap
                  raw={this.state.data.raw}
                  viewed={this.state.viewed_region}
                  country_colors={this.state.map_data}
                  handleHover={this.handleHover}
                  map_highlighted_data={this.state.map_highlighted_data}/>
                
              </div>
              <div className="column"
                style={{ marginRight: "1rem"}}>
                <div>
                  <p className="has-text-left">in</p>
                  <div className="level is-marginless">
                    <div className="level-left">
                      <div className="level-item"
                        style={{ marginRight: ".3rem" }}>
                        <div className="control">
                          <div className="select is-small"
                            style={{ width: "135px" }}>
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
                              <option value="Middle East and Northern Africa">Middle East and Northern Africa</option>
                              <option value="Australia and New Zealand">Australia and New Zealand</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="level-item">
                        <p className="title is-7 has-text-left">Region</p>
                      </div>
                    </div>
                  </div>
                  <div className="control">
                    <div className="select is-small"
                      style={{ marginTop: ".3rem" }}>
                      <select>
                        <option value="2017">2017</option>
                        <option value="2016">2016</option>
                        <option value="2015">2015</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <p className="title is-7" style={{ margin: ".5rem 0 .5rem" }}>Top {this.state.top_3.length} Countries</p>
                    {_.map(this.state.top_3, (datum, index) => {
                      return (
                        <div
                          onMouseOver={() => { this.onRankedHover(datum.country) }}
                          onMouseOut={() => { this.handleBubbleHover({}, {}) }}
                          className="content is-marginless"
                          key={index}>
                          <p className="is-size-7 is-marginless">#{index + 1 + " "}{datum.country + ", "}{parseFloat(datum.happiness_score).toFixed(2)}</p>
                          <RankedVis
                            color={datum.color}
                            x={parseFloat(datum.happiness_score)}
                            x_domain={this.state.max_happy_score} />
                        </div>
                      );
                    })}
                  </div>
                  <div>
                    <p className="title is-7" style={{ margin: "0.5rem 0" }}>Worst {this.state.down_3.length} Countries</p>
                    {_.map(this.state.down_3, (datum, index) => {
                      return (
                        <div
                          onMouseOver={() => { this.onRankedHover(datum.country) }}
                          onMouseOut={() => { this.handleBubbleHover({}, {}) }}
                          className="content is-marginless"
                          key={index}>
                          <p className="is-size-7 is-marginless">#{index + 1 + " "}{datum.country + ", "}{parseFloat(datum.happiness_score).toFixed(2)}</p>
                          <RankedVis
                            color={datum.color}
                            x={parseFloat(datum.happiness_score)}
                            x_domain={this.state.max_happy_score} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="column"
                style={{
                  width: "255px"
                }}>
                <div className="content is-marginless">
                  <p className="title is-4" style={{marginBottom:".5rem"}}>World Happiness Score</p>
                  <div style={{margin:".5rem 0 1rem"}}>
                    <ContinuousColorLegend
                      width={255}
                      startTitle={parseFloat(this.state.min_happy_score).toFixed(2)}
                      endTitle={parseFloat(this.state.max_happy_score).toFixed(2)}
                      startColor="#33a8d4"
                      endColor="#ffdf36"
                    />
                  </div>
                  <p className="is-marginless is-size-7 has-text-justified" style={{ width: "255px" }}>
                    The World Happiness Report was released by the Sustainable Development Solutions Network for the United Nations and first published in 2012. 
                  </p>
                  <p className="is-marginless is-size-7 has-text-justified" style={{ width: "255px" }}>
                    The report ranks countries on six key variables that support well-being: income, freedom, trust, healthy life expectancy, social support and generosity which reflect what has been broadly found in the research literature to be important in explaining national-level differences in life evaluations. Here, you will find the data of World Happiness Index from 2015 to 2017 for 147 countries indexed in our database.
                  </p>
                </div>
                
              </div>
            </div>
            <div className="columns is-gapless is-marginless">
              {(() => {
                var bubbles = [];
                for (var i = 0; i < 6; i++) {
                  bubbles.push(
                    <div className="column" key={i}>
                      {(()=>{
                        if(i==0){
                          return (
                            <div className="columns is-gapless is-marginless">
                              <div className="column">
                                <div style={{position:"relative"}}>

                                  <p className="is-size-7 title__bar has-text-right"
                                    style={{
                                      backgroundColor: "#fdfdfd",
                                      zIndex : 999999,
                                      position : "absolute",
                                      right : 0,
                                      bottom : "-35px"
                                    }}>{(this.state.viewed_region == "All")?"Region Name":"Country Name"}</p>
                                </div>
                              </div>
                              <div className="column">
                                <p className="is-size-7 title__bar is-first">{this.state.data.aggregates[i].name} Score</p>
                              </div>
                            </div>
                          )
                        } else {
                          return <p className="is-size-7 title__bar">{this.state.data.aggregates[i].name} Score</p>;
                        }
                      })()}
                      <div onWheel={this.onWheel}>
                        <BubbleVis
                          scroll_index={this.state.scroll_index}
                          setScrollIndex={function(value){this.setState({scroll_index:value})}.bind(this)}
                          viewed_region={this.state.viewed_region}
                          first={i == 0}
                          highlighted_data={
                            (()=>{
                              if (!_.isEmpty(this.state.highlighted_data)){
                                if(this.state.viewed_region == "All"){
                                  return {
                                    country_name: this.state.highlighted_data.country,
                                    region_name: this.state.highlighted_data.region,
                                    value: this.state.highlighted_data[this.state.data.aggregates[i].attribute_name]
                                  }
                                } else {
                                  return {
                                    country_name: this.state.highlighted_data.country,
                                    value: this.state.highlighted_data[this.state.data.aggregates[i].attribute_name]
                                  }
                                }
                              } else {
                                return {}
                              }
                            })()
                          }
                          handleBubbleHover={this.handleBubbleHover}
                          raw={this.state.data.raw}
                          name={this.state.data.aggregates[i].name}
                          width={this.state.width}
                          height={400}
                          data={this.state.data.aggregates[i].data}
                          y_domain={this.state.data.aggregates[i].max_value} />
                      </div>
                    </div>
                  );
                }
                return bubbles;
              })()}
              <div className="column" style={{ alignItems : "flex-end"}}>
                {(()=>{
                  const length = Math.ceil(this.state.data.aggregates[0].data.length/10);
                  return _.map(_.range(0,length),(value, index)=>{
                    if (value == (length-1)) {
                      if (value == 0){
                        return (
                          <div key={value}>
                            <a className="button is-small is-dark"
                              style={{ width: "33.56px", marginBottom: "10px", marginTop: "2.9rem" }}>All</a>
                          </div>
                        )
                      } else {
                        return (
                          <div key={value}>
                            <div>
                              <a className={"button is-small " + ((value == this.state.scroll_index.index) ?"is-dark":"")}
                                onClick={function () { this.setState({ scroll_index: { index: value, update: true } }) }.bind(this)}
                                style={{ width: "33.56px", marginBottom: "10px" }}>{value+1}</a>
                            </div>
                            <div>
                              <a className={"button is-small " + ((this.state.scroll_index.index=="All") ?"is-dark":"")}
                                onClick={function () { this.setState({ scroll_index: { index: "All", update: true } }) }.bind(this)}
                                style={{ width: "33.56px", marginBottom: "10px" }}>All</a>
                            </div>
                          </div>
                        )
                      }
                    } else {
                      if (value == 0) {
                        return (
                          <div key={value}>
                            <a className={"button is-small " + ((value == this.state.scroll_index.index) ?"is-dark":"")}
                              onClick={function () { this.setState({ scroll_index: { index: value, update: true } })}.bind(this)}
                              style={{ width: "33.56px", marginBottom: "10px", marginTop: "2.9rem" }}>{value+1}</a>
                          </div>
                        )
                      } else {
                          return (
                            <div key={value}>
                              <a className={"button is-small " + ((value == this.state.scroll_index.index) ?"is-dark":"")}
                                onClick={function () { this.setState({scroll_index : { index: value, update: true }}) }.bind(this)}
                                style={{ width: "33.56px", marginBottom: "10px"}}>{value+1}</a>
                            </div>
                          )
                      }
                    }
                  })
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