import React from 'react';
import PropTypes from 'prop-types';

export default (ReactTable) => {
  class ReactTableSelectableCell extends React.Component {
    constructor (props) {
      super(props);
      this.state = {
        selectedCells: []
      }

      this.lastSelectedCell = null;
      this.isSelected = this.isSelected.bind(this);
      this.findIndex = this.findIndex.bind(this);
      this.onSelectCell = this.onSelectCell.bind(this);
    }

    isSelected (data) {
      return this.findIndex(data) !== -1;
    }

    findIndex (data) {
      return this.state.selectedCells.findIndex(({ rowIndex, columnId }) => (
        rowIndex === data.rowIndex && columnId === data.columnId
      ));
    }

    onSelectCell (event, row) {
      event.stopPropagation();
      event.preventDefault();

      let cellData = {
        rowIndex: row.index,
        viewIndex: row.viewIndex,
        columnId: row.column.id,
        original: row.original,
      };

      // metaKey is CMD on Mac
      if (event.ctrlKey || event.metaKey) {
        const index = this.findIndex(cellData);
        if (index !== -1) {
          this.setState((state) => {
            const selectedCells = state.selectedCells.slice();
            selectedCells.splice(index, 1);
            return { selectedCells };
          });
        } else {
          this.setState(state => ({
            selectedCells: [...state.selectedCells, cellData],
          }));
        }
      } else if (event.shiftKey && this.lastSelectedCell) {
        let firstViewIndex;
        let lastViewIndex;

        if (cellData.viewIndex > this.lastSelectedCell.viewIndex) {
          firstViewIndex = this.lastSelectedCell.viewIndex;
          lastViewIndex = cellData.viewIndex + 1;
        } else {
          firstViewIndex = cellData.viewIndex;
          lastViewIndex = this.lastSelectedCell.viewIndex;
        }

        this.setState((state) => {
          let selectedCells = state.selectedCells;

          for (let i = firstViewIndex; i < lastViewIndex; i += 1) {
            const indexInResolvedData = (this.tableState.page * this.tableState.pageSize) + i;
            const inData = this.tableState.resolvedData[indexInResolvedData];

            cellData = {
              rowIndex: inData._index,
              columnId: row.column.id,
              original: inData._original,
            };

            if (!this.isSelected(cellData)) {
              selectedCells = [...selectedCells, cellData];
            }
          }

          return { selectedCells };
        });
        // TODO
      } else {
        this.setState({
          selectedCells: [cellData],
        });
      }

      this.lastSelectedCell = cellData;
    }

    getWrappedInstance() {
      if (this.wrappedInstance.getWrappedInstance) {
        return this.wrappedInstance.getWrappedInstance()
      }

      return this.wrappedInstance;
    }

    render() {
      const { columns, wrappedInstanceRef, ...props } = this.props;
      const { selectedCells } = this.state;
      this.data = props.data;
      return (
        <ReactTable
          ref={(c) => {
            this.wrappedInstance = c;
            if (wrappedInstanceRef) {
              wrappedInstanceRef(c);
            }
          }}
          columns={columns.map((column) => {
            const { isSelectable, ...columnProps } = column;
            if (isSelectable) {
              return {
                ...columnProps,
                Cell: (row, ...args) => {
                  const isSelected = this.isSelected({ rowIndex: row.index, columnId: row.column.id });
                  const selectData = {
                    onSelect: this.onSelectCell,
                    selectedCells,
                    isSelected,
                  };
                  const nextArgs = [...args, selectData];
                  return columnProps.Cell(row, ...nextArgs);
                },
                onChange: (row, value) => {
                  if (columnProps.onChange) {
                    if (selectedCells.length) {
                      columnProps.onChange(selectedCells, value);
                    } else {
                      columnProps.onChange([row], value);
                    }
                  }
                },
              };
            }

            return columnProps;
          })}
          {...props}
        >
          {(state, makeTable) => {
            this.tableState = state;
            return makeTable();
          }}
        </ReactTable>
      );
    }
  }

  ReactTableSelectableCell.propTypes = {
    wrappedInstanceRef: PropTypes.func,
    columns: PropTypes.array.isRequired,
  };

  return ReactTableSelectableCell;
};
