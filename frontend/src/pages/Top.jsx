import { React, useContext, useEffect, useState } from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import { PopularItems } from '../components';
import { getNews } from '../functions';
import { LoadingContext } from '../functions/context/LoadingFunc';

const News = () => {
	const [news, setNews] = useState([]);
	const { showBoundary } = useErrorBoundary();
	const context = useContext(LoadingContext);

	useEffect(() => {
		const getData = async () => {
			context.setLoading(true);
			var newsData;
			try {
				newsData = await getNews();
			} catch (err) {
				showBoundary(err);
				return ;
			}
			setNews(newsData);
			context.setLoading(false);
		}
		getData();
	}, []);

	return (
		<div className='my-20'>
			<p className='mb-20 text-center text-4xl text-black'>お知らせ</p>
			<ul>{
				news.length ? news.map((n, i) => {
					return (<li key={i} className='py-5 border-b' >{n.date} {n.content}</li>);
				}):''
			}</ul>
		</div>
	);
};

const Top = () => {
	return (
		<div>
			<img src='images/top.png' alt='top' className='w-full' ></img>
			<div className='w-3/4 mx-auto'>
				<News />
				<PopularItems />
			</div>
		</div>
	);
};

export default Top;
