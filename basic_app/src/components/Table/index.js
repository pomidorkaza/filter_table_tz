import React, { useState, useEffect, useMemo } from 'react';
import { Table, Spinner, Container, Alert } from 'reactstrap';

import Select from 'react-select';

import './main.css';
import Button from 'reactstrap/lib/Button';
import {API_URL} from '../../assets';


function isCompatible(word, subword){
    return word.toString().indexOf(subword.trim())!==-1;

}

const Preloader = () => {
    return <div style={{
        position: 'absolute',
        width: '100%',
        display: 'flex',
        margin: '30px auto',
        justifyContent: 'center',
        alignItems: 'center'
    }}><Spinner color="dark" />
    </div>;
}

export const MainTable = () => {

    const [allData, setAllData] = useState([]);
    const [isLoading, setLoading] = useState(false);

    const [filteredData, setFilteredData] = useState([]);

// пагинация
    const [paginationData, setPag] = useState({
        beginPage: 0,
        endPage: 10,
        step: 4
    });


    const operatorOption = useMemo(() => [{
        value: '>',
        label: 'Возрастание'
    },
    {
        value: '<',
        label: 'Убывание',

    },
    {
        value: 'contains',
        label: 'Содержит'
    },
    {
        value: '=',
        label: '='
    }

    ]);
    const [finalFilterObject, setFinalFilterObject] = useState({
        operation: '',
        key: '',
        value: ''
    });
    const [optionsfirst, setFirstOption] = useState([
        {
            value: 'name',
            label: 'Название'
        },
        {
            value: 'amount',
            label: 'Кол-во'
        },

        {
            value: 'distanse',
            label: 'Расстояние'
        }
    ]);

    const [filterMode, setFilterMode] = useState(false);

    const handleKeyChange = (select_param) => {
        setFinalFilterObject({
            ...finalFilterObject,
            key: select_param.value
        });
    }

    const handleOperationChange = (select_param) => {

        setFinalFilterObject({
            ...finalFilterObject,
            operation: select_param.value
        });

    }

    const handleFilterValueChange = (e) => {
        setFinalFilterObject({
            ...finalFilterObject,
            value: e.target.value
        })
    }


    const handleBeginFilter = () => {
        const { operation, key, value } = finalFilterObject;
        // operation - <,>, =, contains
        if(value.trim()===''){
            setFilterMode(true);
            setFilteredData([]);
            return ;
        }
        let final_filter_arr = [];
        switch (operation) {
            case '>':
                final_filter_arr = allData.filter((item) => {
                    return item[key] > value
                });
                setFilteredData(final_filter_arr);


                break;
            case '<':
                final_filter_arr = allData.filter((item) => {
                    return item[key] < value
                });
                setFilteredData(final_filter_arr);

                break;
            case '=':
                final_filter_arr = allData.filter((item) => {
                    return item[key].toString() === value.toString()
                });
                setFilteredData(final_filter_arr);
                break;

            case 'contains':
                 
                    final_filter_arr =  allData.filter((item) => {
                    
                        return isCompatible(item[key], value);
                        // return item[key].indexOf(value.toString().trim())!=-1;
                    });
                    setFilteredData(final_filter_arr);
                
               
                break;
            default:
                setFilteredData([]);
                break;
        }
        if (final_filter_arr.length) {
            setFilterMode(true);
            setPag({...paginationData,
            endPage:Math.ceil(final_filter_arr.length/paginationData.step)
            })
        }
        else {
            setFilterMode(true);
            setFilteredData([]);
        }
    }
    useEffect(() => {
        setLoading(true);

        fetch(`${API_URL}/all`)
        .then(res=>res.json())
        .then((data)=>{
            setLoading(false);
            if(data.error){
                console.log(data.error);
            }
            setPag({...paginationData,
                endPage: Math.ceil( (data.body.length)/paginationData.step)
            })
            setAllData(data.body);
        })
        // setTimeout(() => {
        //     setLoading(false);

        //     setAllData(DUMMY_DATA);
        // }, 3000);
    }, [])
    return <Container style={{
        position: 'relative'
    }}>

        <div className="filter-container">
            <div className="filter-container-item">
                {/* 
                селектор по ключу
             */}
                <Select


                    options={optionsfirst}

                    onChange={handleKeyChange}
                ></Select>
            </div>
            <div className="filter-container-item">
                <Select options={operatorOption}
                    onChange={handleOperationChange}
                ></Select>
            </div>
            <div className="filter-container-item">
                <input
                    value={finalFilterObject.value}
                    
                    onChange={handleFilterValueChange}
                />
            </div>
            <div className="filter-container-item">
                <Button
                    onClick={handleBeginFilter}
                    color="primary">Фильтровать</Button>
                
                { filterMode&& <Button color="warning" 
                    style={{
                        margin:'0 0 0 5px'
                    }}
                    onClick={()=>setFilterMode(false)}
                >Весь список</Button>}
            </div>
        </div>

        <Table dark>
            <thead>
                <tr>

                    <th>Дата</th>
                    <th>Название </th>
                    <th>Количество</th>
                    <th>Расстояние</th>
                </tr>
            </thead>

            {
                isLoading && <tr><Preloader /></tr>
            }




            {
                !filterMode ?
                    (() => {
                        // отображаем все 

                        if (!isLoading && allData.length)
                            return <tbody  >{

                                allData.slice(paginationData.beginPage* paginationData.step/*начальный элемент*/, paginationData.beginPage* paginationData.step + paginationData.step).map(item => {
                                    return <tr key={item.id}>
                                        <td>{item.data}</td>
                                        <td>{item.name}</td>
                                        <td>{item.amount}</td>
                                        <td>{item.distanse}</td>
                                    </tr>;
                                })}
                            </tbody>
                    })() :
                    (() => {
                        if (filteredData.length) {
                            return <tbody  >{
                                filteredData.slice(paginationData.beginPage* paginationData.step/*начальный элемент*/, paginationData.beginPage* paginationData.step + paginationData.step).map(item => {
                                    return <tr key={item.id}>
                                        <td>{item.data}</td>
                                        <td>{item.name}</td>
                                        <td>{item.amount}</td>
                                        <td>{item.distanse}</td>
                                    </tr>;
                                })}
                            </tbody>
                        } else {
                            return <tbody style={{
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'flex-start'
                            }}><th style={{
                                flex: 1,
                                display: 'flex'
                            }}> <Alert style={{
                                flex: '1'
                            }} color="info"
                            >
                <Button style={{
                    margin:'10px'
                    }}  color="danger"
                            onClick={()=>setFilterMode(false)}
                                        >Весь список</Button>
                                        Не удалось найти ни одной записи
                           
    </Alert> 
                                </th>
                            </tbody>

                        }


                    })()

            }



        </Table>
        <div style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <ul
                className="pagination">
                <li
                    className="page-item"><a
                        className="page-link" href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            setPag((prevPag) => {
                                console.log(prevPag);
                                return {
                                    ...prevPag,
                                    beginPage: prevPag.beginPage !== 0 ? prevPag.beginPage - 1 : prevPag.beginPage
                                }
                            })
                        }}
                    >{"<"}</a></li>

                {
                    (() => {

                        let pag_list = [];
                        for (let i = 0; i < paginationData.endPage; i++) {
                            if (i >= paginationData.beginPage || i <= paginationData.beginPage + paginationData.step-1) {
                                pag_list.push(<li key={i}
                                    onClick={(e) => {
                                        setPag({
                                            ...paginationData,
                                            beginPage: i + 1
                                        })
                                    }}
                                    className="page-item"><a className="page-link" href="#"
                                    > {i + 1}</a></li>)
                            }
                        }
                        return pag_list;
                    })()
                }

                <li
                    className="page-item"><a
                        className="page-link"

                        onClick={(e) => {
                            e.preventDefault();
                            setPag((prevPag) => {

                                return {
                                    ...prevPag,
                                    beginPage: prevPag.beginPage < prevPag.endPage ? prevPag.beginPage + 1 : prevPag.beginPage
                                }
                            })
                        }}
                        href="#">{">"}</a></li>
            </ul>
        </div>
    </Container>;
}