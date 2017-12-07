import React from 'react';
import Cell from '../src';

class App extends React.Component {

  render() {
    return (
      <div>
        <div>Cell Demo</div>
        <Cell>
          <Cell.Title>添加银行卡</Cell.Title>
          <Cell.Item>
            <Cell.Left text="选择银行" />
            <Cell.Right arrow>
              <span>请选择</span>
            </Cell.Right>
          </Cell.Item>
          <Cell.Item>
            <Cell.Left text="银行卡号" />
            <Cell.Right arrow>
              <input type="tel" />
            </Cell.Right>
          </Cell.Item>
        </Cell>
      </div>
    );
  }
}

export default App;
