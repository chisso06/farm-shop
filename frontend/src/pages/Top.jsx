import { React } from 'react';
import { products } from '../db';

const News = () => {
	return (
		<div class='my-20 w-3/4 mx-auto'>
			<p class='mb-20 text-center text-4xl text-black'>お知らせ</p>
			<ul>
				<li class='py-5 border-b' >2023年10月1日 MHK『ひだまりTV』に出演します。</li>
				<li class='py-5 border-b' >2023年9月10日 ひだまりメディアに取材されました。</li>
				<li class='py-5 border-b' >2023年5月25日 ひだまり新聞にコラムが掲載されました。</li>
			</ul>
		</div>
	);
};

const Goods = () => {
	return (
		<div class='my-20 w-3/4 mx-auto'>
			<p class='mb-20 text-center text-4xl text-black'>人気商品</p>
			<div class='grid md:grid-cols-3 gap-5' >
				{products.map((p, i) => {
					if (p.popular) {
						return (
							<a href={'/products/' + p.productId} class='bg-black hover:opacity-60' >
								<img src={p.src} alt='goods' class='aspect-video sm:aspect-square object-cover' ></img>
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
			<img src='images/top.png' alt='top' class='w-full' ></img>
			<News />
			<Goods />
		</div>
	);
};

export default Top;
