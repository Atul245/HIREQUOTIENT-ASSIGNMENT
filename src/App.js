import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
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
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

const ExpandCollapseIconButton = styled(IconButton)(({ theme, isExpanded }) => ({
  backgroundColor: isExpanded ? '#5F50F0' : '#F5F5F5', 
  borderRadius: '50%',
  height: '15px',
  width: '15px',
  color: isExpanded ? "white" : "grey", 
  marginRight: '15px',
  marginLeft: '-10px', 
  '&:hover': {
    backgroundColor: isExpanded ? '#5F50F0' : '#F5F5F5', 
  },
}));

const StyledKeyboardArrowDownIcon = styled(KeyboardArrowDownIcon)(() => ({
  fontSize: '14px', 
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    fontSize: 12,
    backgroundColor: theme.palette.common.white, 
    color: theme.palette.common.blue,
    textTransform: 'uppercase',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 12,
    textAlign: 'left',
    textTransform: 'uppercase',
    backgroundColor: theme.palette.common.blue, 
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

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  margin: theme.spacing(1), 
}));

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

function App() {
  const [data, setData] = useState([]);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://canopy-frontend-task.vercel.app/api/holdings');
        const jsonData = await response.json();
        const { payload } = jsonData;
        setData(payload);
        setExpanded(Object.fromEntries(Object.keys(groupByAssetClass(payload)).map(key => [key, false])));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const columns = [
    { title: 'Name Of The Holding', field: 'name' }, 
    { title: 'Ticker', field: 'ticker' },
    { title: 'Average Price', field: 'avg_price' },
    { title: 'Market Price', field: 'market_price' },
    { title: 'Latest Change Percentage', field: 'latest_chg_pct' },
    { title: 'Market Value In Base CCY', field: 'market_value_ccy' }
  ];

  const toggleExpand = (assetClass) => {
    setExpanded(prevState => ({
      ...prevState,
      [assetClass]: !prevState[assetClass]
    }));
  };

  const groupedData = groupByAssetClass(data);

  const renderColumns = (assetClassData) => {
    const assetClassColumns = columns.filter(column => {
      return assetClassData.some(row => row[column.field] !== null && row[column.field] !== undefined);
    });
    return assetClassColumns;
  };

  return (
    <>
      {Object.keys(groupedData).map((assetClass) => (
        <StyledAccordion key={assetClass} expanded={expanded[assetClass]} onChange={() => toggleExpand(assetClass)}>
          <AccordionSummary
            aria-controls={`${assetClass}-content`}
            id={`${assetClass}-header`}
          >
            <ExpandCollapseIconButton aria-label="expand row" size="small" isExpanded={expanded[assetClass]}>
                {expanded[assetClass] ? <StyledKeyboardArrowDownIcon /> : <KeyboardArrowDownIcon />}
            </ExpandCollapseIconButton>
            {assetClass.toUpperCase()} ({groupedData[assetClass].length})
          </AccordionSummary>
          <AccordionDetails>
            <StyledTableContainer component={Paper} className="asset-table-container">
              <Table aria-label="customized table">
                <TableHead>
                  <TableRow>
                    {renderColumns(groupedData[assetClass]).map((column, index) => (
                      <StyledTableCell key={index}>{column.title}</StyledTableCell> 
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody sx={{ border: '1px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  {groupedData[assetClass].map((row, rowIndex) => (
                    <StyledTableRow key={rowIndex}>
                      {renderColumns(groupedData[assetClass]).map((column, columnIndex) => (
                        <StyledTableCell key={columnIndex} align="left" className={column.field === 'latest_chg_pct' && row[column.field] < 0 ? 'negative-value' : ''}>
                          {row[column.field]}
                        </StyledTableCell> 
                      ))}
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </StyledTableContainer>
          </AccordionDetails>
        </StyledAccordion>
      ))}
    </>
  );
}

export default App;
