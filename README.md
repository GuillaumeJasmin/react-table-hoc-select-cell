ReactTable HOC for selectable cells 
===================

IMPORTANT: Not yep published on NPM !

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

const ReactTableSelectCell = createTable(ReactTable, config);
```

# Config
* ```retrievePrevOriginal``` - {function} - make possible to retrieve previous selected cells even the data was changed. It's usefull when you need to change the order of data and you to keep selected cells.
  ```js
  config = {
    retrievePrevOriginal: (prevOriginal, nextOriginal) => prevOriginal.id === nextOriginal.id
  }
  ```

* ```enableMultipleColsSelect``` - {bool | array | function} - default `false` - define if differents columns can be selected. You can choose to enable only some columns with an array.
In the next example, `name` and `firstname` column can be selected together, and `personalEmail` with `workEmail`. But `name` column cannot be selected with `personalEmail`: 

  * Array

  ```js
  config = {
    enableMultipleColsSelect: [['name', 'firsname'], ['personalEmail', 'workEmail']]
  }
  ```

  * Function

  ```js
  config = {
    enableMultipleColsSelect: (cellFrom, cellTo) => {
      return cellFrom.column.id === cellTo.column.id;
    }
  }
  ```

# Render

```js
render () {
  return (
    <ReactTableSelectCell
      columns={[
        {
          Cell: (row, { selected, selectedCells, onSelect, unselectAllCells }) => {
            const style = { border: selected ? 'border solid 1px' : null };
            return (
              <div onClick={onSelect} style={style}>
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

# Public methods
* unselectAllCells - make possible to unselect all cells
