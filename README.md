ReactTable HOC for selectable cells 
===================

## Commands available

* CLICK
* CTLR + CLICK
* SHIFT + CLICK

## Config

```
npm install react-table-hoc-select-cell --save
```

```js
import ReactTable from 'react-table';
import createTable from 'react-table-hoc-selectable-cell';

const ReactTableSelectableCell = createTable(ReactTable);
```

```js
render () {
  return (
    <ReactTableSelectableCell
      columns={[
        {
          isSelectable: true,
          Cell: (row, { onSelect, isSelected, selectedCells }) => {
            const style = { border: isSelected ? 'border solid 1px' : null };
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

