import axios from 'axios';
import { React, useEffect, useState } from 'react';
import { products } from '../db';

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

const Goods = () => {
	return (
		<div className='my-20 w-3/4 mx-auto'>
			<p className='mb-20 text-center text-4xl text-black'>人気商品</p>
			<div className='grid md:grid-cols-3 gap-5' >
				{products.map((p, i) => {
					if (p.popular) {
						return (
							<a href={'/products/' + p.productId} className='bg-black hover:opacity-60' >
								<img src={p.src} alt='goods' className='aspect-video sm:aspect-square object-cover' ></img>
							</a>
						)
					} else {
						return (<></>);
					}
				})}
			</div>
		</div>
	);
};

const Top = () => {
	return (
		<div>
			<img src='images/top.png' alt='top' className='w-full' ></img>
			<News />
			<Goods />
		</div>
	);
};

export default Top;
