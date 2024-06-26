import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { Table, TableCell, TableHead, TableRow, TableFooter, TableContainer, TablePagination, Button, IconButton, Box } from '@mui/material';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import { INFRASTRUCTURE_CAPEX_MAPPING, VARIABLE_INDEXES }  from '../../assets/InfrastructureCapexMapping.js'
import OverrideTableRows from './OverrideTableRows';


export default function OverrideTable(props) {  

    const {
        category, 
        data,
        columnNodes, 
        columnNodesMapping, 
        scenario, 
        show,
        updateScenario,
        newInfrastructureOverrideRow,
        setNewInfrastructureOverrideRow,
        rowFilterSet,
        columnFilterSet
    } = props

    const [rows, setRows] = useState([]);
    const [page, setPage] = useState(0);
    const [visibleRows, setVisibleRows] = useState([])
    const [rowsPerPage, setRowsPerPage] = useState(50);
  
    useEffect(() => {
      setPage(0)
    },[scenario.id, category])

    useEffect(() => {
      let tempRows
      if (Object.keys(rowFilterSet).length > 0) {
        try {
          tempRows = []
          for (let row of data[category].slice(1)) {
            if(rowFilterSet[row[0]].checked) tempRows.push(row)
          }
        } catch(e) {
          tempRows = data[category].slice(1)
        }
        
      } else {
        tempRows = data[category].slice(1)
      }
      setRows(tempRows)

    },[scenario, rowFilterSet])

    useEffect(() => {
      let tempVisibleRows = rows.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
      )
      setVisibleRows(tempVisibleRows)

    },[page, rowsPerPage, rows])
    
    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };
  
    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };

    const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;


    const handleCheckOverride = (index, value) => {
      let variable = category
      if(category ==="vb_y_overview_dict") variable = INFRASTRUCTURE_CAPEX_MAPPING[value[0]].variable_name
      let override_object = {variable: variable, isZero: false}
      let indexes = []
      for (let i of VARIABLE_INDEXES[category]) {
        if (!value[i].includes("-")) indexes.push(value[i])
      }
      override_object.indexes=indexes
      if(category ==="vb_y_overview_dict") override_object.value=1
      else override_object.value=""
        let tempOverrideValues = {...scenario.override_values}
        if(Object.keys(tempOverrideValues[category]).includes(""+index)) {
        delete tempOverrideValues[category][index]
        } else {
            tempOverrideValues[category][index] = override_object
        }
        const tempScenario = {...scenario}
        tempScenario.override_values = tempOverrideValues
        updateScenario(tempScenario, true)
    } 

    const handleInputOverrideValue = (event, number_value) => {
        let tempOverrideValues = {...scenario.override_values}
        let idx = event.target.name.split("::")[0]
        let inputType = event.target.name.split("::")[1]
        let val = event.target.value
        /*
        ***
          WHEN SETTING VALUE FOR INFRASTRUCTURE BUILDOUT STUFF, WE NEED TO SEND THE NAME, NOT THE VALUE
          THIS OCCURS WHEN INPUT TYPE IS select
          For example, 0 -> C0 and 350000 -> C1
        ***
        */
        if(inputType === "select") {
          if(category ==="vb_y_overview_dict") {
            // check for storage faciltiy or disposal facility. they only have 2 total indexes. the others have 3
            if(tempOverrideValues[category][idx].variable === "vb_y_Storage_dict" || tempOverrideValues[category][idx].variable === "vb_y_Disposal_dict") {
              if (tempOverrideValues[category][idx].indexes.length >=2) tempOverrideValues[category][idx].indexes[1] = (val)
              else tempOverrideValues[category][idx].indexes.push(val)
            } else {
              if (tempOverrideValues[category][idx].indexes.length >=3) tempOverrideValues[category][idx].indexes[2] = (val)
              else tempOverrideValues[category][idx].indexes.push(val)
            }
          } else {
            tempOverrideValues[category][idx].value = val
          }
          if (number_value !== undefined) {
            tempOverrideValues[category][idx].number_value = number_value
            if (number_value === 0 || number_value === "0") tempOverrideValues[category][idx].isZero = true
          }

          const tempScenario = {...scenario}
          tempScenario.override_values = tempOverrideValues
          updateScenario(tempScenario, true)
        }
        else if(inputType === "technology") {
          tempOverrideValues[category][idx].indexes[1] = val
          const tempScenario = {...scenario}
          tempScenario.override_values = tempOverrideValues
          updateScenario(tempScenario, true)
        }
        else if(!isNaN(val)) {
            if (val === "") tempOverrideValues[category][idx].value = val
            else tempOverrideValues[category][idx].value = parseInt(val)
            const tempScenario = {...scenario}
            tempScenario.override_values = tempOverrideValues
            updateScenario(tempScenario, true)
        }
    }

    const addNewRow = (newOverride, newRow) => {
      console.log('override value')
      console.log(newOverride)
      console.log('rowvalue')
      console.log(newRow)

      let tempOverrideValues = {...scenario.override_values}
      tempOverrideValues.vb_y_overview_dict[newOverride.key] = newOverride.value

      let tempInfrastructureTable = [...scenario.results.data.vb_y_overview_dict]
      tempInfrastructureTable.push(newRow)

      let tempScenario = {...scenario}
      tempScenario.override_values = tempOverrideValues
      tempScenario.results.data.vb_y_overview_dict=tempInfrastructureTable
      updateScenario(tempScenario, true)
    }


const renderOutputTable = () => {

  try {
    if (show) {
        return (
            <TableContainer sx={{overflowX:'auto', maxHeight: '73vh'}}>
            <Table style={{border:"1px solid #ddd"}} size='small' stickyHeader>
              <TableHead style={{backgroundColor:"#6094bc", color:"white"}}>
              <TableRow>
              {category === "vb_y_overview_dict" ? 
              <>
                <TableCell style={{backgroundColor:"#6094bc", color:"white", width: "20%"}}>CAPEX Type</TableCell>
                <TableCell style={{backgroundColor:"#6094bc", color:"white", width: "12%"}}>Location</TableCell>
                <TableCell style={{backgroundColor:"#6094bc", color:"white", width: "12%"}}>Destination</TableCell>
                <TableCell style={{backgroundColor:"#6094bc", color:"white", width: "12%"}}>Technology</TableCell>
                <TableCell style={{backgroundColor:"#6094bc", color:"white", width: "12%"}}>Capacity</TableCell>
                <TableCell style={{backgroundColor:"#6094bc", color:"white", width: "12%"}}>Unit</TableCell>
                <TableCell style={{backgroundColor:"#6094bc", color:"white", width: "7.5%"}}>Override</TableCell>
                <TableCell style={{backgroundColor:"#6094bc", color:"white", width: "12.5%"}}>Value</TableCell>
              </>
              
              :
              <>
              {data[category][0].map((value, index) => {
                if (Object.keys(columnNodes).length === 0 || columnNodes[columnNodesMapping[index]]){
                  return <TableCell key={`${value}_${index}`} style={{backgroundColor:"#6094bc", color:"white"}}>{value}</TableCell>
                }
              })}
                <TableCell style={{backgroundColor:"#6094bc", color:"white"}}>Override</TableCell>
                <TableCell style={{backgroundColor:"#6094bc", color:"white", width: "12.5%"}}>Value</TableCell>
              </>
              }
              
              </TableRow>
              </TableHead>
              <OverrideTableRows
                category={category}
                data={visibleRows}
                columnNodes={columnNodes}
                columnNodesMapping={columnNodesMapping}
                scenario={scenario}
                handleCheckOverride={handleCheckOverride}
                handleInputOverrideValue={handleInputOverrideValue}
                newInfrastructureOverrideRow={newInfrastructureOverrideRow}
                setNewInfrastructureOverrideRow={setNewInfrastructureOverrideRow}
                addNewRow={addNewRow}
              />
              <TableFooter>
                <TableRow>
                <TablePagination
                  rowsPerPageOptions={[25, 50, 100]}
                  count={rows.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  ActionsComponent={TablePaginationActions}
                />
                </TableRow>
              </TableFooter>
            
            </Table>
            {category === "vb_y_overview_dict" && 
              <Button style={{marginTop: "15px", color: "#0884b4", backgroundColor: "white", marginBottom: '15px'}} variant="contained" onClick={() => setNewInfrastructureOverrideRow(true)}>
                + Add infrastructure override
              </Button> 
            }
            
            </TableContainer>
            
          )
    }
      
  } catch (e) {
    console.error("unable to render category: ",e)
  }
}

  return ( 
    <>
    {renderOutputTable()}
    </>
  );

}



function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};