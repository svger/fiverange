import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cns from 'classnames';

import styles from './style/index.less';

const defaultPrefixCls = 'cefc-bidPrice';

const DEAFAULT_VALUE = '--';

const EXCH = {
  SZ: '0',          // 深圳
  SH: '1',          // 上海
  HK: '2'           // 香港
};

const BID_TYPE = {
  BUY: { KEY: 'buy', TEXT: '买' },
  SELL: { KEY: 'sell', TEXT: '卖' },
};

const DEFAULT_PRICE_INFO = {
  price: DEAFAULT_VALUE, 
  amount: DEAFAULT_VALUE
};

class BidPrice extends Component {
  constructor(props) {
    super(props);

    const { socketData } = this.props;
    const bidPriceInfo = !isEmpty(socketData) ? this.getBidPriceInfo(socketData) : null;

    this.state = {
      bidPriceInfo
    };

    this.defaultPriceInfo = {
      buy: new Array(5).fill(DEFAULT_PRICE_INFO),
      sell: new Array(5).fill(DEFAULT_PRICE_INFO)
    };
  }

  componentWillReceiveProps(nextProps) {
    const { clearValue, socketData } = nextProps;

    if (isEmpty(socketData)) {
      return ;
    }

    const bidPriceInfo = !clearValue ? this.getBidPriceInfo(socketData) : null;

    this.setState({
      bidPriceInfo
    });
  }

  /**
   * 由socketData获取五档信息
   * @param {*} socketData 
   * @returns {Object} 买&卖五档信息
   */
  getBidPriceInfo(socketData) {
    const socketData = (Array.isArray(socketData)) ? socketData[0] : socketData;    
    const transInfoBuy = this.getPriceAndAmount(socketData.bids);
    const transInfoSell = this.getPriceAndAmount(socketData.asks);
    const buyParam = {
      priceList: transInfoBuy.bidPrice, 
      amountList: this.getAmount(transInfoBuy.bidVolume) 
    };
    const sellParam = {
      priceList: transInfoSell.askPrice, 
      amountList: this.getAmount(transInfoSell.askVolume)
    };

    return {
      buy: this.regroupingBidPriceInfo(buyParam),
      sell: this.regroupingBidPriceInfo(sellParam)
    };
  }

  /**
   * 获取推送数据中的数量和价格
   * @param {Array} data 买或卖的信息数组
   * @returns {Object} 买或卖的价格和数量数组
   */
  getPriceAndAmount(data) {
    let transInfo = { 
      price: [], 
      volume: [] 
    };

    if (!isEmpty(data) && Array.isArray(data)) {
      for (const item of data ) {
        transInfo.price.push(item.price);
        transInfo.volume.push(item.totalLevelVol);
      }
    }

    return transInfo;
  }

  /**
   * 重新计算五档数量, 以手为单位
   * @param amount 五档数量
   * @returns {*}
   */
  getAmount(amount) {
    return amount.map((item) => {
      return item ? parseInt(item / this.props.handCount) : item;
    });
  }

  getPriceFontColor(preClosePrice, price) {
    if (price === DEAFAULT_VALUE) {
      return '';
    }

    return cns({
      [`ft-green`]: parseFloat(preClosePrice) > parseFloat(price),
      [`ft-red`]: parseFloat(preClosePrice) < parseFloat(price),
    });
  }

  /**
   * 根据defaultInfo的结构,重组五档价格和数量
   * @param price 五档买入或卖出价格
   * @param amount 五档买入或卖出数量
   * @param key 标记是买入还是卖出
   * @returns 五档买入或卖出的价格和数量的数组
   */
  regroupingBidPriceInfo({ priceList, amountList }) {
    return priceList.map((item, index) => {
      return {
        price: item || DEAFAULT_VALUE,
        amount: amountList[index] || DEAFAULT_VALUE
      };
    });
  }

  /**
   * 点击五档价格的处理函数
   * @param {String} val 买或卖的价格
   */
  handlePriceClick(val) {
    return () => {
      isNumber(val) && this.props.onGetPrice(val);
    };
  }

  renderBidPriceInfo(priceInfo, name) {
    const { staticData, precision } = this.props;
    const preClosePrice = !isEmpty(staticData) ? decimalFormat(staticData.preClosePrice, precision) : '';
    const priceInfoCopy = [...priceInfo];
    const clsName = cns({
      noInfo: isEmpty(this.state.bidPriceInfo),
      bidPriceInfo: true,
      bidPriceInfo_buy: name === BID_TYPE.BUY.TEXT,
      bidPriceInfo_sell: name === BID_TYPE.SELL.TEXT
    });

    if (name === BID_TYPE.SELL.TEXT) {
      priceInfoCopy.reverse();
    }

    return (
      <ul styleName={clsName}>
        {
          priceInfoCopy.map((info, index) => {
            const key = `${name}${index}`;
            let price = decimalFormat(info.price, precision);
            let amount = info.amount !== DEAFAULT_VALUE ? switchUnit(info.amount) : info.amount;

            // 防止盘口数量带单位时折行, 若有中文单位,改变盘口数量列的宽度
            if (amount.indexOf('万') !== -1) {

              // 计算整数位的位数，为防止五档数量过长折行，整数位是3位或3位以上的，则略去小数点后的位数
              const integerLength = amount.split('.')[0].length;

              if (integerLength >= 3) {
                amount = `${amount.split('.')[0]}万`;
              }
            }

            return (
              <li key={key} onClick={this.handlePriceClick(price)} >
                <span styleName="price-1">{key}</span>
                <span styleName={`price-2 equal-price ${this.getPriceFontColor(preClosePrice, price)}`} >
                  {price}
                </span>
                <span styleName="price-3">{amount}</span>
              </li>
            );
          })
        }
      </ul>
    );
  }

  render() {
    const { bidPriceInfo } = this.state;

    return (
      <section>
        {this.renderBidPriceInfo(bidPriceInfo.sell || this.defaultPriceInfo.sell, BID_TYPE.SELL.TEXT)}
        {this.renderBidPriceInfo(bidPriceInfo.buy || this.defaultPriceInfo.buy, BID_TYPE.BUY.TEXT)}
      </section>
    );
  }
}

BidPrice.propTypes = {
  precision: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),     //数据精度
  handCount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),     //数据一手的单位
  socketData: PropTypes.object,                                             //股票的推送数据
  staticData: PropTypes.object,                                             //股票基本信息数据
  onGetPrice: PropTypes.func,                                               //点击五档价格后的回调处理函数,
  clearValue: PropTypes.bool,                                               //是否清空五档数据
  formatConfig: PropTypes.object,                                           //精度配置
};

BidPrice.defaultProps = {
  onGetPrice: () => {},
  clearValue: false,
  precision: 2,
  handCount: 100
};

export default BidPrice;