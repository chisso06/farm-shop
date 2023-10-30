import { React } from 'react';
import { products } from '../db';

const Products = () => {
	return (
		<div class='my-16'>
			<p class='py-20 sm:py-40 text-center text-2xl sm:text-4xl bg-amber-800 text-white'>商品一覧</p>
			<ul class='w-3/4 mx-auto my-20 grid sm:grid-cols-3 gap-4' >{
				products.map((p, i) => {
					return (
						<li key={i} class='bg-stone-200 hover:opacity-60'>
							<a href={'/products/' + p.productId} class='aspect-square' >
								<img src={p.src} alt='goods' class='aspect-video object-cover' />
								<p class='p-2 text-sm font-mono' >{p.name}</p>
							</a>
						</li>
					);
				})
			}</ul>
		</div>
	);
};

export default Products;
