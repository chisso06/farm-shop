import { React } from 'react';
import { products } from '../db';

const News = () => {
	return (
		<div className='my-20 w-3/4 mx-auto'>
			<p className='mb-20 text-center text-4xl text-black'>お知らせ</p>
			<ul>
				<li className='py-5 border-b' >2023年10月1日 MHK『ひだまりTV』に出演します。</li>
				<li className='py-5 border-b' >2023年9月10日 ひだまりメディアに取材されました。</li>
				<li className='py-5 border-b' >2023年5月25日 ひだまり新聞にコラムが掲載されました。</li>
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
