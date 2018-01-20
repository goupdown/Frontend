import React from 'react';
import SegmentedControl from '../generic/SegmentedControl';
import { Col } from 'reactstrap';
import { Desktop, Mobile } from '../generic/MediaQuery';
import AmChartsReact from '@amcharts/amcharts3-react';

class ProfitChart extends React.Component {

  constructor(props) {
    super(props);
    const trades = [].concat.apply([], props.trades);
    const tradesAsInvestor = [].concat.apply([], props.tradesAsInvestor);
    const profit = calculateAllProfit(trades);
    const profitAsInvestor = calculateAllProfit(tradesAsInvestor);
    this.state = {selectedCurrency: 0, selectedInterval: 2, profit, profitAsInvestor};
  }

  componentWillReceiveProps(nextProps) {
    const trades = [].concat.apply([], nextProps.trades);
    const profit = calculateAllProfit(trades);
    const tradesAsInvestor = [].concat.apply([], nextProps.tradesAsInvestor);
    const profitAsInvestor = calculateAllProfit(tradesAsInvestor);
    this.setState({trades, profit, profitAsInvestor});
  }
  formatData(selectedInterval) {
    let data = this.state.profit;
    let dataAsInvestor = this.state.profitAsInvestor;
    let now = Date.now();
    let endDate = now - now % 3600000;
    let numberOfPoints;
    let startDate;
    switch(selectedInterval) {
      case 0:
        startDate = endDate - 86400000;
        numberOfPoints = 25;
        break;
      case 1:
        startDate = endDate - 86400000 * 7;
        numberOfPoints = 29;
        break;
      case 2:
        startDate = endDate - 86400000 * 30;
        numberOfPoints = 31;
        break;
      case 3:
        startDate = endDate - 86400000 * 180;
        numberOfPoints = 31
        break;
      case 4:
        startDate = endDate - 86400000 * 360;
        numberOfPoints = 31;
        break;
      case 5:
        if(data.length === 0 && dataAsInvestor.length === 0) {
          startDate = endDate - 8640000;
          numberOfPoints = 2;
        } else {
          let traderFirst = data[0];
          let investorFirst = dataAsInvestor[0];
          if(traderFirst && investorFirst) {
            startDate = Math.min(traderFirst[0], investorFirst[0]);
          } else if(!traderFirst) {
            startDate = investorFirst[0];
          } else {
            startDate = traderFirst[0];
          }
          numberOfPoints = 18;
        }
    }
    const isUsd = this.state.selectedCurrency === 0;
    data = calculatePoints(startDate, endDate, numberOfPoints, data, isUsd);
    dataAsInvestor = calculatePoints(startDate, endDate, numberOfPoints, dataAsInvestor, isUsd);
    const shared = [];
    for(let i = 0; i < data.length; i++) {
      shared.push({
        category: data[i][0],
        'column-1': data[i][1],
        investor_profit: dataAsInvestor[i][1],
      });
    }
    return shared;
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
                        <div className="percent">0%</div>
                        <div className="date">Since {formatDate(new Date(this.props.dt || Date.now()))}</div>
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
      "hideCredits": true,
      'color': '#6f6f71',
      'fontFamily': 'maven_proregular',
      'trendLines': [],
      'colors': [
        '#0a87b8',
        '#32ba94',
      ],
      'categoryAxis': {
        'equalSpacing': true,
        'gridPosition': 'start',
        'minPeriod': 'hh',
        'parseDates': true
      },
      'graphs': [
        {
          'balloonText': '[[title]] of [[category]]:[[value]]',
          'id': 'AmGraph-1',
          'lineAlpha': 1,
          'lineThickness': 2,
          'visibleInLegend': false,
          'type': 'smoothedLine',
          'valueField': 'column-1'
        },
        {
          'balloonText': '[[title]] of [[category]]:[[value]]',
          'id': 'investor_profit',
          'lineAlpha': 1,
          'lineThickness': 2,
          'visibleInLegend': false,
          'type': 'smoothedLine',
          'valueField': 'investor_profit'
        },
      ],
      'guides': [],
      'valueAxes': [
        {
          'title': this.state.selectedCurrency ? 'BTC' : 'USD',
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
      'dataProvider': this.formatData(selectedInterval)
    };
  }

  renderChart() {
    const config = this.makeConfig(this.state.selectedInterval);
    return (
      <AmChartsReact.React  style={{height: '100%', width: '100%', backgroundColor: 'transparent',position: 'absolute'}}
        options={config} />
    );
  }
}

function calculateAllProfit(trades) {
  trades = trades.map(t => ({...t, date: new Date(t.date).getTime()}));
  trades.sort((t1, t2) => t1.date - t2.date);
  const profitPoints = [];
  let totalProfit = 0;
  const buys = {};

  for(let trade of trades) {
    if(trade.type === 'Buy') {
      let info = buys[trade.amountCurrency];
      if(!info) {
        info = {amount: trade.amount, price: trade.price};
        buys[trade.amountCurrency] = info;
      } else {
        let price = (info.amount * info.price + trade.amount * trade.price) /
          (info.amount + trade.amount);
        price = parseFloat(price.toFixed(8));
        info.amount += trade.amount;
        info.price = price;
      }
    } else {
      const info = buys[trade.amountCurrency];
      if(!info) {
        continue;
      } else if(info.amount < trade.amount) {
        continue;
      };
      const profitInBtc = parseFloat(((trade.price - info.price) * trade.amount).toFixed(8));
      totalProfit += profitInBtc;
      const totalProfitInUsd = parseFloat((totalProfit * trade.usdtToBtcRate).toFixed(2));
      profitPoints.push([trade.date, totalProfit, totalProfitInUsd]);
      info.amount -= trade.amount;
    }
  }
  return profitPoints;
};

function calculatePoints(startDate, endDate, n, profitPoints, isUsd) {
  n = n - 1;
  const points = [];
  const interval = (endDate - startDate) / n;
  const searchPoint = closure(profitPoints, isUsd);
  for(let i = 0; i <= n; i++) {
    const date = startDate + i * interval;
    points.push([date, searchPoint(date)]);
  }
  return points;
}

function formatDate(date) {
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  if(month < 10) {
    month = '0' + month;
  }
  let day = date.getDate();
  if(day < 10) {
    day = '0' + day;
  }
  return day + '.' + month + '.' + year;
}

function closure(array, isUsd) {
  if(array.length === 0) {
    return () => 0;
  } else {
    let startIndex = 0;
    let valueIndex = isUsd ? 2 : 1;
    return value => {
      for(let i = startIndex; i < array.length; i++) {
        const point = array[i];
        if(point[0] <= value) {
          startIndex = i;
          continue;
        } else if(i === 0) {
          return 0;
        } else {
          startIndex = i;
          return array[i - 1][valueIndex];
        }
      }
      return array[startIndex][valueIndex];
    };
  }
}

export default ProfitChart;
