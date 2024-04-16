import axios from 'axios';
import { React, useEffect, useState } from 'react';
import { PopularItems } from '../components';

const News = () => {
	const [news, setNews] = useState([]);

	useEffect(() => {
		const getNews = async () => {
			await axios.get('/backend/news')
			.then((res) => {
				console.log(res.data);
				setNews(res.data);
			});
		}
		getNews();
	}, []);

	return (
		<div className='my-20 w-3/4 mx-auto'>
			<p className='mb-20 text-center text-4xl text-black'>お知らせ</p>
			<ul>{
				news.map((n, i) => {
					return (<li key={i} className='py-5 border-b' >{n.date} {n.content}</li>);
				})
			}
			</ul>
		</div>
	);
};

const Top = () => {
	return (
		<div>
			<img src='images/top.png' alt='top' className='w-full' ></img>
			<News />
			<PopularItems />
		</div>
	);
};

export default Top;
