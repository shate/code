import React from 'react';
import { useContext, useEffect, useState } from 'react';
import { Context } from '../layouts/context';
import Link from 'next/link';
import FilterListIcon from '@material-ui/icons/FilterList';
import CloseIcon from '@material-ui/icons/Close';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';

const Filter = dynamic(() => import('../filters/filter'));

const TableControls = (props) => {

    const [filterFieldState, setFilterFieldState] = useState(false);
    const [isWatchList, setIsWatchList] = useState(false);
    const {translation, lang} = useContext(Context);
    const router = useRouter();
    const activePage = (router.route).slice(1) || 'cryptocurrencies';
    const stateWatchlist = useSelector(state => state.currenciesReducer.watchlist);

    useEffect(() => {
        setIsWatchList(stateWatchlist);
    }, [stateWatchlist]);

    useEffect(() => {
            if (!props.dataIsLoad) {
                setFilterFieldState(false);
            }
        },
        [props.dataIsLoad]);

    return (
        <>
            <div className="table-control row flex-column-reverse flex-lg-row m-0">
                <div className="table-container col-12 col-lg-7 col-xl-8 px-0" itemScope="" itemType="http://schema.org/SiteNavigationElement">
                    <ul className="table-tabs d-flex" itemgrop="about" itemScope="" itemType="http://schema.org/ItemList">
                        <li className={`table-tab${activePage === 'cryptocurrencies' ? ' table-tab-selected' : ' table-tab-not-selected'}`} itemgrop="itemListElement" itemScope="" itemType="http://schema.org/ListItem">
                            <Link href={'/'} locale={lang}>
                                <a className="d-flex h-100 align-items-center justify-content-center" itemProp="url">
                                    {translation && translation.cryptocurrencies ? translation.cryptocurrencies : 'Cryptocurrencies'}
                                </a>
                            </Link>
                        </li>
                        <li className={`table-tab ${activePage === 'markets' ? ' table-tab-selected' : ' table-tab-not-selected'}`} itemgrop="itemListElement" itemScope="" itemType="http://schema.org/ListItem">
                            <Link href={'/markets'} locale={lang}>
                                <a className="d-flex h-100 align-items-center justify-content-center" itemProp="url">
                                    {translation && translation.markets ? translation.markets : 'Markets'}
                                </a>
                            </Link>
                        </li>
                        <li className={`table-tab${activePage === 'fiats' ? ' table-tab-selected' : ' table-tab-not-selected'}`} itemgrop="itemListElement" itemScope="" itemType="http://schema.org/ListItem">
                            <Link href={'/fiats'} locale={lang}>
                                <a className="d-flex h-100 align-items-center justify-content-center" itemProp="url">
                                    {translation && translation.fiat ? translation.fiat : 'Fiats'}
                                </a>
                            </Link>
                        </li>
                        {
                            !process.env.NODE_ENV || process.env.NODE_ENV=== 'development'
                            ?   <li className={`table-tab${activePage === 'pos' ? ' table-tab-selected' : ' table-tab-not-selected'}`} itemgrop="itemListElement" itemScope="" itemType="http://schema.org/ListItem">
                                    <Link href={'/pos'} locale={lang}>
                                        <a className="d-flex h-100 align-items-center justify-content-center" itemProp="url">
                                           {translation && translation.pos ? translation.pos : 'PoS'}
                                        </a>
                                    </Link>
                                </li>
                                : ''
                        }

                        {
                            isWatchList
                                ?
                                <li className={`table-tab${activePage === 'watchlist' ? ' table-tab-selected' : ' table-tab-not-selected'}`} itemgrop="itemListElement" itemScope="" itemType="http://schema.org/ListItem">
                                    <Link href={'/watchlist'} locale={lang}>
                                        <a className="d-flex h-100 align-items-center justify-content-center">
                                            {translation && translation.watchlist ? translation.watchlist : 'Watchlist'}
                                        </a>
                                    </Link>
                                </li>
                                : null
                        }
                    </ul>
                </div>
                <div
                    className="table-nav col-12 col-lg-5 col-xl-4 d-flex align-items-center justify-content-between justify-content-md-end py-4 py-lg-0">
                   <div className='row flex-grow-1'>
                       <div className='col-4 px-2'>
                           <button
                               className={`main-container my-0 mr-0 w-100 ${
                                   filterFieldState ? 'active' : ''}`}
                               type='button'
                               onClick={() => setFilterFieldState(!filterFieldState)}
                           >

                               {!filterFieldState
                                   ? <FilterListIcon fontSize="small"/>
                                   : <CloseIcon fontSize="small"  style={{ color: '#4579f5' }}/>
                               }
                               <span
                                   className='ml-2'>{translation && translation.filters ? translation.filters : 'Filters'}
                               </span>
                           </button>
                       </div>
                       <div className='col-4 px-0'>
                           {props.pagination}
                       </div>
                       <div className='col-4 pl-2'>
                           <button
                               type={'button'}
                               className={`main-container table-view-all w-100 ${
                                   props.isFullWidthTable ? 'active' : ''
                                   }`}
                               onClick={() => {
                                   props.setMaxVal(props.totalLength);
                                   props.setPageCount(1);
                                   props.setFullWidthTable();
                               }}
                           >
                               {translation && translation.view_all ? translation.view_all : 'View All'}
                           </button>
                       </div>
                   </div>
                </div>
            </div>
            <div
                className={`filter-field d-flex justify-content-between align-items-center ${filterFieldState ? 'open' : ''}`}>
                {
                    filterFieldState
                        ? <Filter
                            array={props.table}
                            setTable={props.setTable}
                            translation={translation}
                            activeTable={activePage}
                            dataIsLoad={props.dataIsLoad}
                            currentPage={props.currentPage}
                        />
                        : ''
                }
            </div>
        </>
    );

};

export default React.memo(TableControls);


