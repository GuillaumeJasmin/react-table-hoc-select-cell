ReactTable HOC for selectable cells 
===================

IMPORTANT: Not yep published on NPM !

## Commands available

* CLICK
* CTLR + CLICK
* SHIFT + CLICK

## Config

<!-- ```
npm install react-table-hoc-select-cell --save
``` -->

```js
import ReactTable from 'react-table';
import createTable from 'react-table-hoc-selectable-cell';

const ReactTableSelectableCell = createTable(ReactTable);
```

```js
render () {
  return (
    <ReactTableSelectableCell
      enableMultipleColsSelect={false}
      columns={[
        {
          selectable: true,
          Cell: (row, { onSelect, selected, selectedCells }) => {
            const style = { border: selected ? 'border solid 1px' : null };
            return (
              <div onClick={selectData.onSelect} style={style}>
                {row.value}
              <div/>
            )
          },
        }
      ]}
    >
  )
}
```

# Config
* enableMultipleColsSelect - bool|array - if false, you can only select the cells of the same column id.
If it's an array, you can specify wich column is associated with other
```js
enableMultipleColsSelect={[['name', 'firstName'], ['age', 'weight']]};
```
