import React from 'react';
import PropTypes from 'prop-types';


const propTypes = {
    dataHoge: PropTypes.func,
};

// propstypeについて調べればバグが取れそう

Time_select_pulldown.propTypes = propTypes

class Time_select_pulldown extends React.Component {
    constructor(props) {
        super(props);
        console.log(props.name)
    }
    render() {
        return (
            <select id={this.props.name} value={this.props.val} key={this.props.name} onChange={(e) => this.props.onChange(e)}>
                {this.props.option}
            </select>
        )
    }

}

class Range_select extends React.Component {
    constructor(props) {
        super(props);
        console.log(props.name)
    }

    render() {
        const max_name = "max_" + this.props.name
        const min_name = "min_" + this.props.name
        return (
            <form>
                <input type="text" id={max_name} value={this.props.val} />
                <input type="text" id={min_name} value={this.props.val} />
            </form>
        )
    }
}

export { Time_select_pulldown, Range_select }