import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { React, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { createCart, getIndexBase64Images, imageSrc, updateCartStorage } from '../functions';
import { ToastContext } from '../functions/ToastFunc';

const Cart = () => {
	const search = useLocation().search;
	const query = new URLSearchParams(search);
	const message = query.get('message');
	const context = useContext(ToastContext);
  const [sum, setSum] = useState(0);
  const [cart, setCart] = useState([]);
  const [base64Images, setBase64Images] = useState([]);

	const handleChange = (e, i) => {
		var value = Number(e.target.value);
		const cartStorage = JSON.parse(localStorage.getItem('cart'));

		if (value <= 0)
			cartStorage.splice(i, 1);
		else
			cartStorage[i].number = value;
		updateCartStorage(cartStorage);
		createCart(setCart);
	}

	const handleTrash = (i) => {
		const cartStorage = JSON.parse(localStorage.getItem('cart'));

		cartStorage.splice(i, 1);
		updateCartStorage(cartStorage);
		createCart(setCart);
	}

	useEffect(() => {
		createCart(setCart);
	}, []);

	useEffect(() => {
		if (message) {
			context.setMessage(message);
		}
	}, [message, context]);

	useEffect(() => {
		var calcSum = 0;
		const getData = async () => {
			const base64ImagesData = await getIndexBase64Images(cart);
			setBase64Images(base64ImagesData);
		}
		getData();

		cart.map((item) => {
			calcSum += item.price * item.number;
		});
		setSum(calcSum);
	}, [cart]);

	return (
		<div className='w-3/4 my-16 mx-auto'>
			<p className='mt-32 mb-10 sm:mt-40 sm:mb-20 text-center text-xl sm:text-4xl'>
				カートに入っている商品
			</p>
			{ cart.length ?
				<div className='mx-auto'>
					{ cart.length ? cart.map((item, i) => {
						return (
							<div key={i} className='pr-2 py-4 flex border-b items-center'>
								<img
									src={imageSrc(base64Images[item.base64Images_idx])}
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
											max={item.stock}
											type='number'
											onChange={(e) => {handleChange(e, i)}}
											className='w-16 mx-2 p-2 border rounded invalid:text-amber-700 invalid:border-amber-600' />
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
					}):''}
					<div className='w-60 mx-auto my-10'>
						<p className='mt-10 text-center text-2xl sm:text-3xl font-mono font-bold'>
							小計：{sum}円
						</p>
						<p className='pt-4 mb-8 text-center text-sm text-stone-600'>※送料は購入手続き時に計算されます</p>
						<a href='/order-form' className='w-60 p-2 inline-block text-center text-white bg-amber-600 hover:bg-amber-500 rounded'>
							お支払いにすすむ
						</a>
					</div>
				</div>
				: <p className='my-48 text-center'>現在、カートに入っている商品はありません。</p>
			}
		</div>
	);
};

export default Cart;
