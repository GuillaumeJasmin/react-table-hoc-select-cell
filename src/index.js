import React from 'react';
import PropTypes from 'prop-types';

const sortSelectedCells = (selectedCells) => {
  return selectedCells.sort((a, b) => {
    if (a.viewIndex > b.viewIndex) return 1;
    if (a.viewIndex < b.viewIndex) return -1;
    return 0;
  });
}

/**
 *
 * @param {ReactTable} ReactTable - ReactTable instance
 * @param {object}     publicConfig - config
 * @param {function}   publicConfig.retrievePrevOriginal - make possible to retrive previous original data
 * @param {bool|array} publicConfig.enableMultipleColsSelect - enable multiple columns select
 *
 * @return {object} ReactTable instance
 */
export default (ReactTable, publicConfig) => {
  const config = {
    enableMultipleColsSelect: false,
    ...publicConfig,
  };

  if (!Array.isArray(config.enableMultipleColsSelect) && !['boolean', 'function'].includes(typeof config.enableMultipleColsSelect)) {
    throw new Error('react-table-hoc-select-cell: enableMultipleColsSelect must be an array or a boolean');
  }

  class ReactTableSelectCell extends React.PureComponent {
    constructor (props) {
      super(props);
      this.state = {
        selectedCells: []
      }

      this.lastSelectedCell = null;
      this.selected = this.selected.bind(this);
      this.findIndex = this.findIndex.bind(this);
      this.onSelectCell = this.onSelectCell.bind(this);
      this.unselectAllCells = this.unselectAllCells.bind(this);
    }

    componentWillReceiveProps (nextProps) {
      if (config.retrievePrevOriginal) {
        this.setState((state) => {
          const { selectedCells } = state;

          if (!selectedCells.length) {
            return null;
          }

          const nextSelectedCells = selectedCells.slice();
          selectedCells.forEach((cell, index) => {
            const nextOriginal = nextProps.data.find(original => config.retrievePrevOriginal(cell.original, original));
            if (nextOriginal) {
              nextSelectedCells[index].original = nextOriginal;
            } else {
              nextSelectedCells.splice(index, 1);
            }
          });

          return {
            selectedCells: sortSelectedCells(nextSelectedCells)
          }
        });
      }
    }

    componentWillUpdate (nextProps, nextState) {
      const { onSelectedCellsWillChange } = this.props;
      if (this.state.selectedCells !== nextState.selectedCells) {
        onSelectedCellsWillChange(nextState.selectedCells);
      }
    }

    selected (data) {
      return this.findIndex(data) !== -1;
    }

    findIndex (data) {
      return this.state.selectedCells.findIndex(({ index, column }) => (
        index === data.index && column.id === data.column.id
      ));
    }

    onSelectCell (event, row) {
      event.stopPropagation();
      event.preventDefault();
      const { enableMultipleColsSelect } = config;
      const { selectedCells } = this.state;

      let cellData = {
        index: row.index,
        viewIndex: row.viewIndex,
        column: row.column,
        original: row.original,
      };

      let replace = false;

      var cellDataWithDiffColumnId = selectedCells.find(({ column }) => column.id !== cellData.column.id);

      if (cellDataWithDiffColumnId) {
        if (!enableMultipleColsSelect) {
          replace = true;
        } else if (Array.isArray(enableMultipleColsSelect)) {
          const foundArray = enableMultipleColsSelect.find(items => items.includes(cellData.column.id) && items.includes(cellDataWithDiffColumnId.column.id));
          if (!foundArray) {
            replace = true;
          }
        } else if (typeof enableMultipleColsSelect === 'function') {
          replace = !enableMultipleColsSelect(cellData, cellDataWithDiffColumnId);
        }
      }

      if (replace) {
        this.setState({
          selectedCells: [cellData],
        });
        this.lastSelectedCell = cellData;
        return;
      }

      // metaKey is CMD on Mac
      if (event.ctrlKey || event.metaKey) {
        const index = this.findIndex(cellData);
        if (index !== -1) {
          this.setState((state) => {
            const selectedCells = state.selectedCells.slice();
            selectedCells.splice(index, 1);
            return { selectedCells: sortSelectedCells(selectedCells) };
          });
        } else {
          this.setState(state => ({
            selectedCells: sortSelectedCells([...state.selectedCells, cellData]),
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
              index: inData._index,
              column: row.column,
              original: inData._original,
            };

            if (!this.selected(cellData)) {
              selectedCells = [...selectedCells, cellData];
            }
          }

          return { selectedCells: sortSelectedCells(selectedCells) };
        });
      } else {
        this.setState(() => {
          // const index = this.findIndex(cellData);
          // if (index !== -1) {
          //   const selectedCells = state.selectedCells.slice();
          //   selectedCells.splice(index, 1);
          //   return { selectedCells };
          // } else {
          //   return { selectedCells: [cellData] }
          // }
          return { selectedCells: sortSelectedCells([cellData]) };
        })
      }

      this.lastSelectedCell = cellData;
    }

    getWrappedInstance () {
      if (this.wrappedInstance.getWrappedInstance) {
        return this.wrappedInstance.getWrappedInstance()
      }

      return this.wrappedInstance;
    }

    unselectAllCells () {
      if (this.state.selectedCells.length) {
        this.setState({ selectedCells: [] });
      }
    }

    handleColumnsRecursively (columns) {
      const { selectedCells } = this.state;
      return columns.map((column) => {
        const { columns, ...columnProps } = column;
        if (columns) {
          return {
            ...columnProps,
            columns: this.handleColumnsRecursively(columns),
          }
        } else if (columnProps.Cell) {
          return {
            ...columnProps,
            Cell: (row, ...args) => {
              const selected = this.selected({ index: row.index, column: row.column });
              const selectData = {
                onSelect: this.onSelectCell,
                unselectAllCells: this.unselectAllCells,
                selectedCells,
                selected,
              };
              const nextArgs = [...args, selectData];
              return columnProps.Cell(row, ...nextArgs);
            },
          };
        }

        return column;
      })
    }

    render() {
      const { columns, wrappedInstanceRef, children, ...props } = this.props;
      this.data = props.data;
      return (
        <ReactTable
          ref={(c) => {
            this.wrappedInstance = c;
            if (wrappedInstanceRef) {
              wrappedInstanceRef(c);
            }
          }}
          columns={this.handleColumnsRecursively(columns)}
          {...props}
        >
          {(state, makeTable) => {
            this.tableState = state;
            if (children) {
              return children(state, makeTable);
            }
            return makeTable();
          }}
        </ReactTable>
      );
    }
  }

  ReactTableSelectCell.propTypes = {
    wrappedInstanceRef: PropTypes.func,
    columns: PropTypes.array.isRequired,
    data: PropTypes.array,
    children: PropTypes.any,
    onSelectedCellsWillChange: PropTypes.func,
  };

  return ReactTableSelectCell;
};
