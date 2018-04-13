import React, {Component} from "react";
import PropTypes from "prop-types";
import moment from "moment";
import _ from "lodash";

import { ScrollToHOC, ScrollArea } from "react-scroll-to";

import StoryDetail from "./story-detail";

class StoryDetailContainer extends Component {
  
  constructor(props){
    super(props);

    this.state = {
      closed_details : [true,true],
      default_closed_details : [true,true],
    }
    this.onChangeClose = this.onChangeClose.bind(this);
  }

  componentWillMount(){
    const length = this.props.data.events.length;
    var closed_details = []
    for (var i=0;i<length;i++){
      closed_details.push(true);
    }
    this.setState({
      ...this.state,
      closed_details: closed_details,
      default_closed_details: closed_details
    });
  }

  onChangeClose(index){
    var temp = _.clone(this.state.closed_details,true);
    temp[index] = !temp[index];
    this.setState({
      ...this.state,
      closed_details : temp
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.highlighted_data, nextProps.highlighted_data)) {
      if (!_.isEmpty(nextProps.highlighted_data)){
        this.setState({
          ...this.state,
          closed_details: this.state.default_closed_details,
        });
        const index = _.findIndex(this.props.data.events, (datum)=>{
          return (datum.x == (nextProps.highlighted_data.x0 - this.props.horizontal_white_space));
        })
        if (index != -1) {
          this.props.scroll(0, index * (43 + index));
        }
      }
    }
  }

  render(){
    return (
      <div>
        <figure className="image is-16by9">
          <img src={this.props.data.image_url}/>
        </figure>
        <ScrollArea 
          style={{
            height:"600px",
            overflowY:"scroll"
          }}>
          {_.map(this.props.data.events,(datum,index)=>{
            return (
            <StoryDetail
              key={index}
              onChangeClose={()=>this.onChangeClose(index)}
              onMouseOver={() => this.props.handleMouseOver({
                x0: (datum.x + this.props.horizontal_white_space),
                x: (datum.x + 1 - this.props.horizontal_white_space),
              })}
              onMouseLeave={()=>this.props.handleMouseOver(null)}
              close={this.state.closed_details[index]}
              event_components={datum.event_components}
              url={datum.url}
              event_name={datum.event_name}
              published_date={datum.published_date}/>
            );
          })}
        </ScrollArea>
      </div>
    );
  }
}

StoryDetailContainer.propTypes = {
  handleMouseOver: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired,
  horizontal_white_space: PropTypes.number.isRequired,
};

export default ScrollToHOC(StoryDetailContainer);