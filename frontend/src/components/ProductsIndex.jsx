import { React, useContext } from 'react';
import { imageSrc } from '../functions';
import { ToastContext } from '../functions/context/ToastFunc';

const ProductsIndex = ({products, category, base64Images}) => {
	const toast_context = useContext(ToastContext);

	const handleAddCart = (e, p_i) => {
		e.preventDefault();

		const item = {
			product_id: products[p_i].id,
			number: 1,
		};
		const cart = JSON.parse(localStorage.getItem('cart'));
		const i = cart.findIndex(({product_id}) => product_id === item.product_id);

		if ((i < 0 && products[p_i].stock < item.number)
			|| (i >= 0 && products[p_i].stock < cart[i].number + item.number))
			window.alert('在庫数を超えています。');
		else {
			if (i < 0)
				cart.push(item);
			else
				cart[i].number += item.number;
			localStorage.setItem('cart', JSON.stringify(cart));
			toast_context.setMessage('商品を買い物かごに追加しました');
		}
	};

	return (
		<ul className='grid sm:grid-cols-2 gap-8' >
		{ products.length ? products.map((p, i) => {
			if (!category || p.category === category)
			return (
				<li key={i}>
					<div className='hover:opacity-60'>
						<a href={'/products/' + p.id}>
							<img
								src={imageSrc(base64Images[p.base64Images_idx])}
								alt='goods'
								className='aspect-video object-cover rounded' />
							<div className='p-2 my-2'>
								<p className='mb-2'>
									{p.name && p.name.length <= 25 ? p.name : p.name.substring(0, 24) + '…'}
								</p>
								<p className='font-mono font-bold text-center'>¥{p.price}</p>
							</div>
						</a>
					</div>
					<div className='mb-2 w-full flex justify-center'>
						<button
							onClick={(e) => handleAddCart(e, i)}
							className='py-1 px-2 bg-black text-white text-sm hover:bg-amber-600'>
							カートに入れる
						</button>
					</div>
				</li>
			);
		}):''
	}</ul>
	);
};

export default ProductsIndex;