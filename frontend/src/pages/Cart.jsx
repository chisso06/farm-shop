import { React } from 'react';
import { cart, products } from '../db';

const Cart = () => {
	var sum = 0;

	// const handleSubmit = async () => {
	// 	window.confirm("デモサイトのため、決済はできません。");
	// }

	return (
		<div className='my-16'>
			<p className='mt-32 mb-10 sm:mt-40 sm:mb-20 text-center text-xl sm:text-4xl'>
				カートに入っている商品
			</p>
			<div className='w-3/4 mx-auto'>
				{cart.map((item, i) => {
					const productList = products.find(({productId}) => productId === item.productId);
					sum += productList.price * item.number;
					return (
						<a href={'/products/' + item.productId} key={i} className='w- py-4 flex border-b items-center'>
							<img
								src={productList.src}
								alt='商品画像'
								className='w-16 sm:w-32 aspect-square object-cover' />
							<div className='w-full sm:flex pl-4 font-mono items-center'>
								<p className='h-full sm:w-3/4'>{productList.name}</p>
								<div className='h-full sm:w-1/4 flex'>
									<p className='h-full text-xl font-bold'>
										¥{productList.price}
										<span className='text-stone-400 font-normal text-base'>/個</span>
										<span className='h-full text-base font-normal items-center text-center'> ×{item.number}</span>
									</p>
									</div>
							</div>
						</a>
					);
				})}
				<form action='/create-checkout-session' method='POST' className='w-60 mx-auto my-10'>
					<p className='my-10 text-center text-2xl sm:text-3xl font-mono font-bold'>
						合計：{sum}円
					</p>
					<button type='submit' className='w-60 p-2 text-white bg-amber-600 hover:bg-amber-500 rounded'>
						お支払いにすすむ
					</button>
				</form>
			</div>
		</div>
	);
};

export default Cart;
