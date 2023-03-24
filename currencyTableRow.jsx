import  React,{ useRef, useEffect, useContext, useState } from 'react';
import { Context } from '../../layouts/context';
import Link from 'next/link';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import { MainContext } from '../../main/context';
import { useRouter } from 'next/router';
import Image from 'next/image';
import RemoveRedEyeIcon from '@material-ui/icons/RemoveRedEye';
import dynamic from 'next/dynamic';
import { useDispatch, useSelector } from 'react-redux';
import { setWatchList } from '../../../store/currencies/actions';
import IconButton from '@material-ui/core/IconButton';
import { transformer } from '../../../utils';

const GraphicThumbnail = dynamic(() => import('../../GraphicThumbnail'));
const LoaderSmall = dynamic(() => import('../../helpers/loaderSmall'));

function CurrencyTableRow({item, graphicsArray, color}){

    const {label} = useContext(MainContext);
    const {currency} = useContext(Context);
    const firstElem = useRef('null');
    const secondElem = useRef('null');
    const [url, setUrl] = useState(item.unit_info.name);
    const router = useRouter();
    const dispatch = useDispatch();
    const watchList = useSelector(state => state.currenciesReducer.watchlist);

    useEffect(() => {
        if(!item.unit_info.code) return;

        setUrl(`${transformer(item.unit_info.name)}${label !== 'usd' ? `_${label}` : ''}`);

    }, [label, item.unit_info.code]);

    const onclick = () => {
        router.push({
            pathname: '/currency/[id]',
            query: {id: url}
        });
    };

    const watchingHandler = (id) => {

        if(!watchList){
            dispatch(setWatchList([id]));
            localStorage.setItem('watchList', JSON.stringify([id]));
        }
        else{
            const index = watchList.indexOf(id);

            if(index >= 0){
                watchList.splice(index, 1);
                dispatch(setWatchList(watchList.length ? watchList.concat() : false));
                watchList.length ? localStorage.setItem('watchList', JSON.stringify(watchList)) : localStorage.removeItem('watchList');
            }
            else{
                dispatch(setWatchList(watchList.concat([id])));
                localStorage.setItem('watchList', JSON.stringify(watchList.concat([id])));
            }
        }
    };

    return (
        <tr itemProp="itemListElement" itemScope itemType="https://schema.org/ExchangeRateSpecification">
            <td
                className="table-cell table-cell-sticky z-index-5 pr-sm-0 pl-1 pl-sm-3"
                ref={firstElem}
            >
                <div className='d-flex align-items-center justify-content-around'>
                    <IconButton
                        aria-label={`watch ${item.unit_info.name}`}
                        onClick={()=> watchingHandler(item.unit_info.id)}
                    >
                        <RemoveRedEyeIcon style={{color: router.asPath !== '/watchlist' ? color ? color : '#4579f5' : '#4579f5'}}/>
                    </IconButton>
                    {item.unit_info.rank}
                </div>
            </td>
            <td
                className="table-cell name table-cell-left table-cell-sticky z-index-5 sticky-80"
                ref={secondElem}
                onClick={onclick}
            >
                <div className='d-flex align-items-center'>
                    <Image
                        src={item.unit_info.icon ? item.unit_info.icon : '/placeholderSrc.png'}
                        alt={item.unit_info.name}
                        className={'rounded-circle'}
                        itemProp="image"
                        width={24}
                        height={24}
                        quality={10}
                    />
                    <Link href={`/currency/${url}`} locale={router.locale}>
                        <a className="link ml-2 text-truncate" title={item.unit_info.name} itemProp="item" content={item.unit_info.code}>
                            {item.unit_info.name}
                        </a>
                    </Link>
                </div>
            </td>
            <td
                className="table-cell table-cell-right text-primary"
                itemProp="currentExchangeRate"
                itemScope
                itemType="https://schema.org/UnitPriceSpecification"
                onClick={onclick}
            >
                {item && new Intl.NumberFormat(router.locale, {
                    style: 'currency',
                    minimumFractionDigits: item.price > 1 ? 2 : 4,
                    currency: currency.label
                }).format(item.price)}
                <meta itemProp="priceCurrency" content={item.unit_info.code}/>
            </td>
            <td className="table-cell table-cell-right"  onClick={onclick}>
                {item && new Intl.NumberFormat(router.locale, {
                    style: 'currency',
                    minimumFractionDigits: 0,
                    currency: currency.label
                }).format(item.market_cap)}
            </td>
            <td className="table-cell table-cell-right text-primary"  onClick={onclick}>
                {item && new Intl.NumberFormat(router.locale, {
                    style: 'currency',
                    minimumFractionDigits: 0,
                    currency: currency.label
                }).format(item.volume)}
            </td>
            <td className="table-cell table-cell-right"  onClick={onclick}>
                {item && new Intl.NumberFormat(router.locale, {minimumFractionDigits: 0}).format(item.circulating_supply)}
                <span className='ml-1'>{item.unit_info.code}</span>
            </td>
            <td
                className={
                    'table-cell table-cell-right ' +
                    (item.change_24h >= 0 ? 'text-success' : 'text-danger')
                }
                onClick={onclick}
            >
                {item && new Intl.NumberFormat(router.locale, {
                    style: 'percent',
                    minimumFractionDigits: 2
                }).format(item.change_24h / 100)}
            </td>
            <td
                className={
                    'table-cell table-cell-right ' +
                    (item.change_7d >= 0 ? 'text-success' : 'text-danger')
                }
                onClick={onclick}
            >
                {
                    graphicsArray && item
                        ? <GraphicThumbnail
                            graphicData={(graphicsArray[item.unit_info.id] ? graphicsArray[item.unit_info.id] : null)}
                            paramY={'price'}
                            change={
                                (item.change_7d >= 0
                                    ? '#16b8b8'
                                    : '#f54562')
                            }
                        />
                        : <div className={'chart-wrapper'}><LoaderSmall/></div>
                }
            </td>
            <td className={'table-cell table-cell-center more-icon'}  onClick={onclick}><MoreHorizIcon/></td>
        </tr>
    );
}

export default React.memo(CurrencyTableRow);
