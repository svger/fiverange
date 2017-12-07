# BidPrice
> 五档组件

## API
| 参数       | 说明             |  类型       | 默认值 |
| :---------: | :----------------: | :---------: | :----: |
| precision | 数据精度 | numer &#124; string    | `2` |
| formatConfig | 精度配置 | object    | 无 |
| handCount | 数据一手的单位 | numer &#124; string    | `100` |
| socketData | 股票推送数据 | object    | 无 |
| staticData | 股票基本信息数据 | object    | 无 |
| onGetPrice | 点击五档价格后的回调处理函数 | function    | `()=>{}` |
| clearValue | 是否清空五档数据 | boolean    | `false` |
| prefixCls | 样式前缀，如：`cefc-bidPrice`，可用于自定义样式 | string   | `cefc-bidPrice` |