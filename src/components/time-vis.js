import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import {
  XYPlot,
  VerticalRectSeries,
  VerticalGridLines,
  HorizontalGridLines,
  XAxis,
  YAxis,
  Borders,
  Hint
} from 'react-vis';

/*
  data = array of datum
  datum = {
    x : horizontal position,
    y : vertical position,
    n : number of characters,
    published_date : date,
    law_stage : penyelidikan/penyidikan/penyidikan+praperadilan/penuntutan/penuntutan+praperadilan/praperadilan/pemeriksaan/upaya hukum ,
    characters : [
      {
        color : color of representation,
        name : name,
        role : saksi, tersangka, terdakwa, penasihat hukum , penyelidik, penyidik, penuntut umum, hakim
        social_status : [

        ]
      }
    ],
    "location": {
      "color": "#79C7E3",
      "name": "Mapolda Metro Jaya",
      "city": "Jakarta Pusat"
    },
    "time": {
      "color": "#FF9833",
      "name": "Siang"
    },
  }
*/

class TimeVis extends Component {
  constructor(props) {
    super(props);
    super(props);
    this.state = {
      time_hints: [
        /*
          {
            name : name,
            city : city,
          },
        */
      ],
      time_positions: [
        /*
          {
            name : name,
            positions : [
              {
                x0 : horizontal position start,
                x : horizontal position end,
                y0 : vertical position start,
                y : vertical position end,
                color : color of representation,
              }
            ],
          },
        */
      ],
      highlighted_data: [],
      hint_position: {},
      checked: true,
    }
    this.preprocessData = this.preprocessData.bind(this);
    this.onClickLabel = this.onClickLabel.bind(this);
  }

  componentWillMount() {
    this.preprocessData(this.props.data);
  }

  preprocessData(data) {
    var time_positions = [];
    var time_hints = [];
    for (var i = 0; i < data.length; i++) {
      const datum = data[i];
      const time = data[i].time;
      if (!_.isEmpty(time)) {
        const index = _.findIndex(time_positions, (value) => {
          return (value.name == time.name);
        })
        if (index == -1) {
          time_positions.push({
            name: time.name,
            positions: [
              {
                x0: (datum.x + this.props.horizontal_white_space),
                x: (datum.x + 1 - this.props.horizontal_white_space),
                y0: 0,
                y: 1,
                color: time.color
              }
            ]
          });
          time_hints.push([
            {
              name: time.name
            }
          ])
        } else {
          time_positions[index].positions.push({
            x0: (datum.x + this.props.horizontal_white_space),
            x: (datum.x + 1 - this.props.horizontal_white_space),
            y0: 0,
            y: 1,
            color: time.color
          });
          time_hints[index].push({
            name: time.name
          })
        }
      }
    }
    this.setState({
      ...this.state,
      time_positions: time_positions,
      time_hints: time_hints,
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.highlighted_data, nextProps.highlighted_data)) {
      var highlighted_data = [];
      var hint_position = {};
      if (!_.isEmpty(nextProps.highlighted_data)) {
        highlighted_data = [{
          x0: nextProps.highlighted_data.x0,
          x: nextProps.highlighted_data.x,
          y0: 0,
          y: 1,
          color: "transparent"
        }];
        hint_position = {
          x: nextProps.highlighted_data.x,
          y: 1,
        }
      }
      this.setState({
        ...this.state,
        highlighted_data: highlighted_data,
        hint_position: hint_position,
      });
    }
    if (!_.isEqual(this.props.adjust_viewed_time, nextProps.adjust_viewed_time)) {
      if ((nextProps.adjust_viewed_time[0] == "all")||(nextProps.adjust_viewed_time.length == this.state.time_positions.length)) {
        this.setState({
          ...this.state,
          checked: true,
        });
      } else {
        this.setState({
          ...this.state,
          checked: false,
        });
      }
    }
  }

  onCheckboxButton() {
    if (this.state.checked) {
      this.setState({
        ...this.state,
        checked: false
      });
      this.props.onHideAllTime();
    } else {
      this.setState({
        ...this.state,
        checked: true
      });
      this.props.onResetViewedTime();
    }
  }

  onClickLabel(event, color) {
    event.preventDefault();
    this.props.onAddViewedTime(color);
  }

  render() {
    const { RIGHT, TOP } = Hint.ALIGN;
    const { handleMouseOver } = this.props;
    return (
      <div className="inline-label-vis">
        <div className="field"
          style={{
            width: "100px",
            marginBottom: "0",
            marginLeft: "1.25rem",
            height: "1.5rem"
          }}>
          <div
            className="control">
            <label className="checkbox">
              <input
                onChange={this.onCheckboxButton.bind(this)}
                type="checkbox"
                checked={this.state.checked} />
              <b className="is-size-7">Waktu</b>
            </label>
          </div>
        </div>
        <hr style={{
          margin: ".2rem 0"
        }} />
        {_.map(this.state.time_positions, (time_position, index) => {
          return (
            <div key={index}
              className="level">
              <a className="level-left"
                onClick={(event) => { this.onClickLabel(event, time_position.positions[0].color) }}
                style={{
                  color: "black"
                }}>
                <div className="level-item">
                  <p className="is-size-7 elipsis"
                    style={{ width: "100px" }}>
                    {time_position.name}
                  </p>
                </div>
              </a>
              <div className="level-right">
                <div className="level-item">
                  <XYPlot
                    colorType="literal"
                    margin={{ left: 0, top: 0, bottom: 0, right: 0 }}
                    width={this.props.width - 100}
                    height={this.props.height}
                    xDomain={this.props.xDomain}
                    onMouseLeave={() => handleMouseOver({})}>
                    <VerticalRectSeries
                      data={[{
                        x0: (this.props.xDomain[0]),
                        x: (this.props.xDomain[1]),
                        y: 0,
                        y: 1,
                        color: "#f1f1f1"
                      }]} />
                    <VerticalRectSeries
                      data={time_position.positions} />
                    {(() => {
                      if (this.state.highlighted_data.length != 0) {
                        const hightlight_index = _.findIndex(time_position.positions, (value) => {
                          return ((value.x == this.state.highlighted_data[0].x) && (value.x0 == this.state.highlighted_data[0].x0));
                        });
                        if (hightlight_index != -1) {
                          return (
                            <VerticalRectSeries
                              data={this.state.highlighted_data}
                              stroke="#363636"
                              style={{ strokeWidth: 3 }} />
                          );
                        } else {
                          var temp = _.clone(this.state.highlighted_data, true);
                          temp[0].color = "#363636"
                          return (
                            <VerticalRectSeries
                              data={temp}
                              style={{ opacity: .1 }} />
                          )
                        }
                      }
                    })()}
                    <Borders style={{
                      bottom: { fill: 'transparent' },
                      left: { fill: '#fff' },
                      right: { fill: 'transparent' },
                      top: { fill: 'transparent' }
                    }} />
                    <VerticalRectSeries
                      opacity={0}
                      onValueMouseOver={(datapoint, { index }) => handleMouseOver(datapoint)}
                      data={time_position.positions} />
                    {/* Component for display hint */}
                    {(() => {
                      if (!_.isEmpty(this.state.hint_position)) {
                        const hint_index = _.findIndex(time_position.positions, (value) => {
                          return ((value.x == this.state.highlighted_data[0].x) && (value.x0 == this.state.highlighted_data[0].x0));
                        });
                        if (hint_index != -1) {
                          const hint_text = this.state.time_hints[index][hint_index];
                          return (
                            <Hint
                              align={{
                                horizontal: RIGHT,
                                vertical: TOP
                              }}
                              value={this.state.hint_position}>
                              <div className="tags has-addons character-vis-hint">
                                <span className="arrow-left"></span>
                                <span className="tag is-dark has-text-warning">{hint_text.name}</span>
                              </div>
                            </Hint>
                          );
                        }
                      }
                    })()}
                  </XYPlot>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    );
  }
}


TimeVis.propTypes = {
  data: PropTypes.array.isRequired,
  xDomain: PropTypes.array.isRequired,
  horizontal_white_space: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  highlighted_data: PropTypes.object,
  handleMouseOver: PropTypes.func.isRequired,
  onAddViewedTime: PropTypes.func.isRequired,
  onResetViewedTime: PropTypes.func.isRequired,
};

export default TimeVis;