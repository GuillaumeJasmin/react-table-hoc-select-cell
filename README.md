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

const ReactTableSelectCell = createTable(ReactTable, config);
```

# Config
* ```retrievePrevOriginal``` - {function} - make possible to retrieve previous selected cells even if the data was changed. It's usefull when you need to change the order of data and you want to keep selected cells.
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

Select data are injected as second parameter of `Cell`:

```js
render () {
  return (
    <ReactTableSelectCell
      columns={[
        {
          Cell: (row, { selected, onSelect }) => {
            const style = { border: selected ? 'border solid 1px' : null };
            return (
              <div onClick={event => onSelect(event, row)} style={style}>
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

## Select data

* ```selected```  {bool} - `true` if cell is selected 


* ```getSelectedCells``` {func} - return array of selected cells


* ```selectedCells``` - DEPRECATED {array} - array of selected cells. Use `getSelectedCells` instead. It's deprecated because it can create issue if you use cell as PureComponent, all cells will be rerender when `selectedCells` change.


* ```onSelect``` {func} - Use to select a cell. It take `event` and `row` arguments 


* ```unselectAllCells``` {func} - unselect all selected cells. 

## Ref

You can use `wrappedInstanceRef` props to get the ref of ReactTable:
```js
render () {
  return (
    <ReactTableSelectCell
      wrappedInstanceRef={(ref) => { this.tableRef = ref; }}
      ...
    >
  )
}
```

## Public methods
* getSelectedCells
* unselectAllCells
* getWrappedInstance
