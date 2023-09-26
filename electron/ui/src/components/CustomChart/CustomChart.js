import React from 'react';
import {useEffect, useState} from 'react';
import Plot from 'react-plotly.js';


export default function AreaChart(props) {
    const [ areaChartData, setAreaChartData ] = useState(null)

    useEffect(()=>{
        if(props.input) {
            let tempData = {}
            let tempKeys = []
            for (var key in props.data[props.category]) {
                tempData[props.data[props.category][key]] = {x:[], y: []}
                tempKeys.push(props.data[props.category][key])
            }

            Object.entries(props.data).map(([time, item], index ) => {
                if(index > 0) {
                    for (var ind in item){
                        var value = item[ind]
                        if(value === "") value = 0
                        var key = tempKeys[ind]
                        if (value) {
                            tempData[key].x.push(parseInt(time.substring(1)))
                            tempData[key].y.push(value)
                        }else if (value === 0){
                            tempData[key].x.push(parseInt(time.substring(1)))
                            tempData[key].y.push(value)
                        }
                    }
                }
                return 1
            })
            let tempAreaChartData = []
            // Object.entries(tempData).map(([key, value] ) => {
            //     tempAreaChartData.push({x: value.x, y: value.y, stackgroup: 'one', name: key})
            // })
            let keys = Object.keys(tempData).sort().reverse()
            keys.map((key, ind) => {
                let value = tempData[key]
                tempAreaChartData.push({x: value.x, y: value.y, stackgroup: 'one', name: key})
                return 1
            })
            setAreaChartData(tempAreaChartData)
        } else {
            let tempData = {}
            // organize area chart data
            for (var index = 1; index < props.data.length; index++) {
                let item = props.data[index]
                let key = item[props.labelIndex]
                // if(key.length > 4) {
                //     key=key.substring(0,4)
                //     console.log(key)
                // }
                key = key.replace('PostTreatmentTreatedWaterNode',"PTTWN").replace("PostTreatmentResidualNode","PTRN").replace('intermediate','I')
                let x = item[props.xindex]
                let y = item[props.yindex]
                if (key in tempData){
                    tempData[key].x.push(parseInt(x.substring(1)))
                    tempData[key].y.push(y)
                }else {
                    tempData[key] = {x: [x], y: [y]}
                }
            }
            let tempAreaChartData = []
            // Object.entries(tempData).map(([key, value] ) => {
            //     tempAreaChartData.push({x: value.x, y: value.y, stackgroup: 'one', name: key})
            // })

            // let keys = Object.keys(tempData).sort().reverse()
            let keys = Object.keys(tempData).sort()
            keys.map((key, ind) => {
                let value = tempData[key]
                tempAreaChartData.push({x: value.x, y: value.y, stackgroup: props.stackgroup, name: key})
                return 1
            })
            setAreaChartData(tempAreaChartData)
        }

    }, [props]);

  return ( 
        <Plot
            /* 
                x values are T values
                y values are bbl/week
                where does K value go? needs to be a label of some sort
            */
            data={areaChartData}
            layout={{
                width: props.width,
                height: props.height, 
                showlegend: props.showlegend, 
                title: props.title,
                xaxis: {
                    title: {
                        text: props.xaxis.titletext
                    }
                },
                yaxis: {
                    title: {
                        text: props.yaxis.titletext
                    }
                }
            }}
        />
  );

}

