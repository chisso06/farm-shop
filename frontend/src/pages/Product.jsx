import axios from 'axios';
import { React, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Toast } from '../components';

const Product = () => {
	const params = useParams();
	const productId = Number(params.product_id);
	const [product, setProduct] = useState({});
	const [images, setImages] = useState([]);
	const [shippingMethod, setShippingMethod] = useState([]);
	const [item, setItem] = useState({
		product_id: productId,
		number: 0,
	});
	const [isVisible, setIsVisible] = useState(false);

	const handleChange = (e) => {
		const {name, value} = e.target;
		setItem({...item, [name]: Number(value) });
		if (Number(value) > 0) {
			document.getElementById("button").removeAttribute("disabled");
			document.getElementById("button").className = 'w-full p-2 mt-6 text-white bg-amber-600 hover:bg-amber-500 rounded';
		} else if (document.getElementById("button").disabled === false) {
			document.getElementById("button").setAttribute("disabled", true);
			document.getElementById("button").className = 'w-full p-2 mt-6 text-white bg-stone-400 rounded';
		}
	};

	const handleSubmit = async (e) => {
		const cart = JSON.parse(localStorage.getItem('cart'));
		const i = cart.findIndex(({product_id}) => product_id === item.product_id);

		if (i < 0)
			cart.push(item);
		else
			cart[i].number += item.number
		localStorage.setItem('cart', JSON.stringify(cart));
		console.log(cart);
		setIsVisible(true);
	};

	useEffect(() => {
		const getProduct = async () => {
			await axios.get(`/backend/products/${productId}`)
			.then((res) => {
				console.log('product:', res.data);
				setProduct(res.data);
			});
		}
		const getImages = async () => {
			await axios.get(`/backend/products/${productId}/images`)
			.then((res) => {
				console.log('images:', res.data);
				setImages(res.data);
			});
		}
		getProduct();
		getImages();
	}, [productId]);

	useEffect(() => {
		const getShippingMethod = async () => {
			await axios.get(`/backend/shipping/${product.shipping_method}`)
			.then((res) => {
				console.log('shippingMethod:', res.data);
				setShippingMethod(res.data);
			});
		}
		if (product.shipping_method)
			getShippingMethod();
	}, [product]);

	useEffect(() => {
		document.getElementById("button").setAttribute("disabled", true);
		if (!localStorage.getItem('cart'))
			localStorage.setItem('cart', JSON.stringify([]));
	}, [])

	const Modal = () => {
		const areaList = [
			{method_name: 'Hokkaido', name: '北海道', prefectures: ''},
			{method_name: 'Hokkaido', name: '東北', prefectures: '青森県, 岩手県, 宮城県, 秋田県, 山形県, 福島県'},
			{method_name: 'Hokkaido', name: '関東', prefectures: '茨城県, 栃木県, 群馬県, 埼玉県, 千葉県, 東京都, 神奈川県, 山梨県'},
			{method_name: 'Hokkaido', name: '信越', prefectures: '新潟県, 長野県'},
			{method_name: 'Hokkaido', name: '北陸', prefectures: '富山県, 石川県, 福井県'},
			{method_name: 'Hokkaido', name: '東海', prefectures: '岐阜県, 静岡県, 愛知県, 三重県'},
			{method_name: 'Hokkaido', name: '近畿', prefectures: '滋賀県, 京都府, 大阪府, 兵庫県, 奈良県, 和歌山県'},
			{method_name: 'Hokkaido', name: '中国', prefectures: '鳥取県, 島根県, 岡山県, 広島県, 山口県'},
			{method_name: 'Hokkaido', name: '四国', prefectures: '徳島県, 香川県, 愛媛県, 高知県'},
			{method_name: 'Hokkaido', name: '九州', prefectures: '福岡県, 佐賀県, 長崎県, 熊本県, 大分県, 宮崎県, 鹿児島県'},
			{method_name: 'Hokkaido', name: '沖縄', prefectures: ''},
		];
		if (shippingMethod.length) {
			return (
				<dialog id="modal" className="modal modal-bottom sm:modal-middle p-4 rounded-md">
					<div className="modal-box">
						<form method="dialog">
							<button className="btn btn-sm btn-ghost absolute right-4 top-4">✕</button>
						</form>
						<h3 className="font-bold text-lg">送料・配送方法について</h3>
						<p className="py-4">{shippingMethod[0].name}</p>
						<table className='text-sm'>
							<thead>
								<tr className='bg-stone-100 border'>
									<th>地域</th>
									{ shippingMethod.map((m, i) => {
										return (<th key={i} className='px-2 text-center'>{m.size}</th>);
									})}
								</tr>
							</thead>
							<tbody>{
								areaList.map((area) => {
									return (
										<tr className='border'>
											<td>
												<p>{area.name}</p>
												<p className='text-xs'>{area.prefectures}</p>
											</td>
											{ shippingMethod.map((m, i) => {
												return (<td key={i} className='px-2 text-center'>¥{m[area.method_name]}</td>);
											})}
										</tr>
									);
								})
							}</tbody>
						</table>
					</div>
				</dialog>
			);
		} else {
			return <div />;
		}
	}

	return (
		<div className='w-3/4 my-16 mx-auto'>
			<Modal />
			<Toast isVisible={isVisible} setIsVisible={setIsVisible} />
			<p className='mt-32 mb-10 sm:mt-40 sm:mb-20 text-center text-xl sm:text-4xl'>
				{product.name}
			</p>
			<div className='sm:flex gap-4'>
				<div className='sm:w-2/3'>
					<img
						src={images[0] ? '/products/' + images[0].id + '.jpg' : ''}
						alt='商品画像'
						className='w-full aspect-[3/2] object-contain bg-stone-200' />
					<div className='my-10'>
						<p className='mb-4 text-2xl font-bold font-mono'>商品について</p>
						<p className='whitespace-pre-line'>{product.description}</p>
					</div>
				</div>
				<div className='sm:w-1/3'>
					<div className='p-4 font-mono border rounded'>
						<p>通常価格（税込）</p>
						<p className='text-3xl text-amber-600 font-bold'>¥{product.price}</p>
						<button
							onClick={()=>document.getElementById('modal').showModal()}
							className="btn text-stone-500 text-sm">
							ⓘ<span className='hover:underline'>送料について</span>
						</button>
						<div className='pt-10 flex items-center'>
							<p className='pr-4'>数量</p>
							<input name='number' onChange={handleChange} type='number' min='0' className='w-20 p-2 border rounded'></input>
						</div>
						<button onClick={handleSubmit} id='button' className='w-full p-2 mt-6 text-white bg-stone-400 rounded'>
							カートに入れる
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Product;
