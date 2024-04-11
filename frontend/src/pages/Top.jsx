import axios from 'axios';
import { React, useEffect, useState } from 'react';

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

const PopularItems = () => {
	const [products, setProducts] = useState([]);

	useEffect(() => {
		const getProducts = async () => {
			await axios.get('/backend/products?popular_status=1')
			.then((res) => {
				console.log(res.data);
				setProducts(res.data);
			});
		}
		getProducts();
	}, []);

	return (
		<div className='my-20 w-3/4 mx-auto'>
			<p className='mb-20 text-center text-4xl text-black'>人気商品</p>
			<div className='grid md:grid-cols-3 gap-5' >
				{products.map((p, i) => {
					return (
						<a href={'/products/' + p.id} className='bg-black hover:opacity-60' >
							<img src={'/products/' + p.image_id +'.jpg'} alt='goods' className='aspect-video sm:aspect-square object-cover' ></img>
						</a>
					)
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
			<PopularItems />
		</div>
	);
};

export default Top;
