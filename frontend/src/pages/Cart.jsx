import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { React, useEffect, useState } from 'react';

const Cart = () => {
	var sum = 0;
  const [cart, setCart] = useState([]);

  const CreateCart = async (cartStorage) => {
		if (cartStorage) {
			const cartList = await Promise.all(cartStorage.map(async (c) => {
				const res = await axios.get(`/backend/products/${c.product_id}`)
					.catch((err) => console(err));
				const item = {
					product_id: c.product_id,
					number: c.number,
					name: res.data.name,
					price: res.data.price,
					image_id: 1
				};
				return item;
			}));
			setCart(cartList);
		}
  }

	const handleChange = (e, i) => {
		var value = Number(e.target.value);
		const cartStorage = JSON.parse(localStorage.getItem('cart'));

		if (value < 0)
			value = 0;
		cartStorage[i].number = value;
		localStorage.setItem('cart', JSON.stringify(cartStorage));
		CreateCart(cartStorage);
	}

	const handleTrash = (i) => {
		const cartStorage = JSON.parse(localStorage.getItem('cart'));

		cartStorage.splice(i, 1);
		localStorage.setItem('cart', JSON.stringify(cartStorage));
		CreateCart(cartStorage);
	}

	useEffect(() => {
		const cartStorage = JSON.parse(localStorage.getItem('cart'));

		CreateCart(cartStorage);
	}, []);

	return (
		<div className='my-16'>
			<p className='mt-32 mb-10 sm:mt-40 sm:mb-20 text-center text-xl sm:text-4xl'>
				カートに入っている商品
			</p>
			{ cart.length ?
				<div className='w-3/4 mx-auto'>
					{ cart.map((item, i) => {
						sum += item.price * item.number;
						return (
							<div key={i} className='pr-2 py-4 flex border-b items-center'>
								<img
									src={'/products/' + item.image_id + '.jpg'}
									alt='商品画像'
									className='w-16 sm:w-32 aspect-square object-cover' />
								<div className='w-full sm:flex pl-4 font-mono items-center'>
									<a
										href={'/products/' + item.product_id}
										className='h-full sm:w-3/5 hover:underline'>
										{item.name}
									</a>
									<div className='h-full sm:w-2/5 flex justify-end items-center'>
										<p className='h-full text-xl font-bold'>
											¥{item.price}
										</p>
										<p className='text-stone-400 font-normal text-base'>/</p>
										<p className='text-stone-400 font-normal text-base'>個</p>
										<p className='mx-1 h-full text-base font-normal items-center text-center'>×</p>
										<input
											value={item.number}
											min={0}
											type='number'
											onChange={(e) => {handleChange(e, i)}}
											className='w-16 mx-2 p-2 border rounded' />
										<button>
											<FontAwesomeIcon
												onClick={() => {handleTrash(i)}}
												icon={faTrash}
												className='text-stone-300 hover:text-stone-400' />
										</button>
									</div>
								</div>
							</div>
						);
					})}
					<form action='/backend/create-checkout-session' method='POST' className='w-60 mx-auto my-10'>
						<p className='mt-10 text-center text-2xl sm:text-3xl font-mono font-bold'>
							合計：{sum}円
						</p>
						<p className='pt-4 mb-8 text-center text-sm text-stone-600'>※送料は購入手続き時に計算されます</p>
						<button type='submit' className='w-60 p-2 text-white bg-amber-600 hover:bg-amber-500 rounded'>
							お支払いにすすむ
						</button>
					</form>
				</div>
				: <p className='my-48 text-center'>現在、カートに入っている商品はありません。</p>
			}
		</div>
	);
};

export default Cart;
