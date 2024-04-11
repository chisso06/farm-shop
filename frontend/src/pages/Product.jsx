import axios from 'axios';
import { React, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Toast } from '../components';

const Product = () => {
	const params = useParams();
	const productId = params.productId;
	const [product, setProduct] = useState({});
	const [images, setImages] = useState([]);
	const [item, setItem] = useState({
		productId: productId,
		number: 0,
	});
	const [isVisible, setIsVisible] = useState(false);

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
			})
		}
		getProduct();
		getImages();
	}, [productId]);

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
		console.log("handleSubmit");
		setIsVisible(true);
		window.confirm("デモサイトのため、カートに追加できません。");
	};

	useEffect(() => {
		document.getElementById("button").setAttribute("disabled", true);
	}, [])

	return (
		<div className='w-3/4 my-16 mx-auto'>
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
						<p className='text-stone-500'>+送料870円（奈良県）</p>
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
