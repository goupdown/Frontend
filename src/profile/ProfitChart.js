import React from 'react';
import SegmentedControl from '../generic/SegmentedControl';
import { Col } from 'reactstrap';
import { Desktop, Mobile } from '../generic/MediaQuery';
import AmCharts from 'amcharts3/amcharts/amcharts';
import SerialChar from 'amcharts3/amcharts/serial';
import AmChartsReact from "@amcharts/amcharts3-react";

class ProfitChart extends React.Component {

  constructor(props) {
    super(props);
    this.state = {selectedCurrency: 0, selectedInterval: 2};
  }

  formatData(trades, selectedInterval) {
    if(!trades || trades.length == 0) {
      return;
    }
    trades = trades.reduce((accum, item)  => accum.concat(item), [])

    trades = trades.slice().sort((t1, t2) =>  (new Date(t1.date)) - (new Date(t2.date)));
    let lastDate = trades[trades.length - 3].date;    
    let {period, lastDatePeriod, method} = this.getPeriod(selectedInterval, lastDate)
    console.log(trades.filter(d => (Date.parse(d.date) >= (Date.now() - period)))
    .map(t => ({category: t.date, 'column-1': t.price})));
    return trades.filter(d => (Date.parse(d.date) >= (Date.now() - period)) && (new Date(d.date)[method]() == lastDatePeriod))
    .map(t => ({category: t.date, 'column-1': t.price}));
  }

  getDateCurrent(dt,selectedInterval) {

  }


  getPeriod(selectedInterval, lastDate) {
    let period = 24*60*60*1000;
    let lastDatePeriod = new Date(lastDate).getMinutes()
    let method = 'getMinutes';
    switch(selectedInterval) {
      case 1:
        period = 7*period;
        lastDatePeriod = new Date(lastDate).getHours()
        method = 'getHours';
        break;
      case 2: 
        period *= 31;
        lastDatePeriod = new Date(lastDate).getHours()
        method = 'getHours';
        break;
      case 3:
        period *= 183;
        lastDatePeriod = new Date(lastDate).getDate()
        method = 'getDate';
        break;
      case 4:
        period *= 365;
        lastDatePeriod = new Date(lastDate).getMonth()
        method = 'getMonth';
        break
      case 5:
        period = Date.now();
        lastDatePeriod = new Date(lastDate).getMonth()
        method = 'getMonth';
        break;
    }
    return {period,lastDatePeriod, method};
  }

  render() {
    return (
      <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-8 profit-block">
        <div className="card">
          <div className="card-header">
            <div className="container-fuild h-100">
              <div className="row h-100 align-items-center">
                <div className="col-auto title-text">
                  <span className="icon icon-profit icon-005-growth"></span>PROFIT CHART
                </div>
                <Col className="d-flex justify-content-end">
                  <Desktop>
                    <SegmentedControl
                      className="currency-button"
                      segments={['USD', 'BTC']}
                      selectedIndex={this.state.selectedCurrency}
                      onChange={i => this.setState({selectedCurrency: i})}
                    />                  
                  </Desktop>
                  <Mobile>
                    <SegmentedControl
                      className="currency-button"
                      segments={['USD', 'BTC']}
                      segmentWidth={50}
                      selectedIndex={this.state.selectedCurrency}
                      onChange={i => this.setState({selectedCurrency: i})}
                    />                       
                  </Mobile>

                </Col>

              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="container d-flex flex-column profit-card-body">

              <div className="row order-3 order-md-1 justify-content-center">
                <div className="col-auto profit"><div className="circle"></div><div className="text">PROFIT AS TRADER</div></div>
                <div className="col-auto profit"><div className="circle green"></div><div className="text">PROFIT AS INVESTOR</div></div>
              </div>
              <div className="row order-2 justify-content-center amcharts-block">
                <div className="col-12">
                  <div className="amcharts">
                    {this.renderChart()}
                  </div>

                </div>

              </div>
              <div className="row order-1 order-md-3 justify-content-center">
                <Desktop>
                  <SegmentedControl
                    segments={['DAY', 'WEEK', 'MONTH', '6 MONTH', 'YEAR', 'ALL']}
                    selectedIndex={this.state.selectedInterval}
                    onChange={i => {
                      this.setState({selectedInterval: i});
                      this.setState({data: this.formatData(this.props.trades, i)});
                    }}
                  />
                </Desktop>
                <Mobile>
                  <SegmentedControl
                    segments={['DAY', 'WEEK', 'MONTH', '6 MONTH', 'YEAR', 'ALL']}
                    segmentWidth={50}
                    selectedIndex={this.state.selectedInterval}
                    onChange={i => {
                      this.setState({selectedInterval: i});
                      this.setState({data: this.formatData(this.props.trades, i)});
                    }}
                  />
                </Mobile>                
              </div>
              <div className="row order-4 d-flex d-md-none justify-content-center ">
                <div className="container-fuild alltime-block">
                  <div className="row justify-content-center">
                    <div className="col-auto">
                      <div className="graphic-fake"></div>
                    </div>
                    <div className="col-auto">
                      <div className="d-flex flex-column">
                        <div className="alltime">alltime</div>
                        <div className="percent">634.6%</div>
                        <div className="date">Since Sep 16th, 2016</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );

  }

  makeConfig(selectedInterval) {
    return {
      'type': 'serial',
      'categoryField': 'category',
      'startDuration': 0,
      'fontSize': 10,
      'color': '#6f6f71',
      'fontFamily': 'maven_proregular',
      'categoryAxis': {
        'gridPosition': 'start'
      },
      'trendLines': [],
      'colors': [
        '#0a87b8',
        '#32ba94',
      ],
      "categoryAxis": {
        "equalSpacing": true,
        "gridPosition": "start",
        "minPeriod": ['hh','DD', 'DD','MM', 'MM', 'MM'][this.state.selectedInterval],
        "parseDates": true
      },        
      'graphs': [
        {
          'balloonText': '[[title]] of [[category]]:[[value]]',
          'id': 'AmGraph-1',
          'title': 'graph 1',
          'lineAlpha': 1,
          'lineThickness': 2,
          'visibleInLegend': false,
          'type': 'smoothedLine',
          'valueField': 'column-1'
        }
      ],
      'guides': [],
      'valueAxes': [
        {
          'id': 'ValueAxis-1',
          'position': 'right',
        }
      ],
      'allLabels': [],
      'balloon': {},
      'legend': {
        'enabled': true,
        'useGraphSettings': true
      },
      'titles': [
      ],
      'dataProvider': this.formatData(this.props.trades, selectedInterval)
    };
  }

  renderChart() {
    const config = this.makeConfig(this.state.selectedInterval)
          return ( 
            <AmChartsReact.React  style={{height: '100%', width: '100%', backgroundColor: 'transparent',position: 'absolute'}}
           options={config} />
           )
  }
}

export default ProfitChart;
