// Import React, useState, useEffect
import React, { useState, useEffect } from 'react';

// Import styled from MUI
import { styled } from '@mui/material/styles';

// Import MUI components
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

// Styled components
const ExpandCollapseIconButton = styled(IconButton)(({ theme, isExpanded }) => ({
  backgroundColor: isExpanded ? '#5F50F0' : '#F5F5F5', 
  borderRadius: '50%',
  height: '15px',
  width: '15px',
  color: isExpanded ? "white" : "black", 
  marginRight: '15px',
  '&:hover': {
    backgroundColor: isExpanded ? '#5F50F0' : '#F5F5F5', 
  },
}));


const StyledKeyboardArrowDownIcon = styled(KeyboardArrowDownIcon)(({ theme }) => ({
  fontSize: '16px', 
}));

const StyledKeyboardArrowUpIcon = styled(KeyboardArrowUpIcon)(({ theme }) => ({
  fontSize: '16px', 
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    fontSize: 12,
    backgroundColor: theme.palette.common.white, 
    color: theme.palette.common.cyan,
    textTransform: 'uppercase',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 12,
    textAlign: 'left',
    textTransform: 'uppercase',
    backgroundColor: theme.palette.common.cyan, 
    color: 'NAVY', 
    paddingRight: '15px', 
  },
  '&.negative-value': {
    color: 'red', 
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  margin: theme.spacing(1),
  marginTop: theme.spacing(2),
}));

// Function to group data by asset class
function groupByAssetClass(data) {
  return data.reduce((groups, item) => {
    const { asset_class } = item;
    if (!groups[asset_class]) {
      groups[asset_class] = [];
    }
    groups[asset_class].push(item);
    return groups;
  }, {});
}

// Main App component
function App() {
  const [data, setData] = useState([]);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://canopy-frontend-task.vercel.app/api/holdings');
        const jsonData = await response.json();
        const { payload } = jsonData;
        // console.log(jsonData);
        setData(payload);

        // Set all groups to initially collapsed
        setExpanded(Object.fromEntries(Object.keys(groupByAssetClass(payload)).map(key => [key, false])));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Define columns
  const columns = [
    { title: 'Name Of The Holding', field: 'name', width: '25%' }, 
    { title: 'Ticker', field: 'ticker', width: '20%' },
    { title: 'Average Price', field: 'avg_price', width: '12%' },
    { title: 'Market Price', field: 'market_price', width: '13%' },
    { title: 'Latest Change Percentage', field: 'latest_chg_pct', width: '15%' },
    { title: 'Market Value In Base CCY', field: 'market_value_ccy', width: '30%' }
  ];

  // Function to toggle expand/collapse
  const toggleExpand = (assetClass) => {
    setExpanded(prevState => ({
      ...prevState,
      [assetClass]: !prevState[assetClass]
    }));
  };

  // Group data by asset_class
  const groupedData = groupByAssetClass(data);

  // Function to render columns based on available data
  const renderColumns = (assetClassData) => {
    const assetClassColumns = columns.filter(column => {
      return assetClassData.some(row => row[column.field] !== null && row[column.field] !== undefined);
    });
    return assetClassColumns;
  };

  return (
    <>
      {Object.keys(groupedData).map((assetClass) => (
        <StyledTableContainer key={assetClass} component={Paper} className="asset-table-container">
          <Table aria-label="customized table">
            <TableBody>
              <TableRow>
                <StyledTableCell>
                  <ExpandCollapseIconButton aria-label="expand row" size="small" onClick={() => toggleExpand(assetClass)} isExpanded={expanded[assetClass]}>
                      {expanded[assetClass] ? <StyledKeyboardArrowUpIcon /> : <StyledKeyboardArrowDownIcon />}
                  </ExpandCollapseIconButton>
                  {assetClass} ({groupedData[assetClass].length})
                </StyledTableCell>
              </TableRow>
              {expanded[assetClass] && (
                <React.Fragment>
                  <TableHead>
                    <TableRow>
                      {renderColumns(groupedData[assetClass]).map((column, index) => (
                        <StyledTableCell key={index} style={{ width: column.width }}>{column.title}</StyledTableCell> 
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody sx={{ border: '1px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    {groupedData[assetClass].map((row, rowIndex) => (
                      <StyledTableRow key={rowIndex}>
                        {renderColumns(groupedData[assetClass]).map((column, columnIndex) => (
                          <StyledTableCell key={columnIndex} align="left" style={{ width: column.width }} className={column.field === 'latest_chg_pct' && row[column.field] < 0 ? 'negative-value' : ''}>
                            {row[column.field]}
                          </StyledTableCell> 
                        ))}
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </React.Fragment>
              )}
            </TableBody>
          </Table>
        </StyledTableContainer>
      ))}
    </>
  );
}

export default App;
