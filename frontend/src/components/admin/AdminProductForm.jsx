import axios from 'axios';
import { React, useEffect, useRef, useState } from 'react';
import {
	deleteProduct,
	getBase64Images,
	getImages,
	getProduct,
	getShippingMethods,
	imageSrc
} from '../../functions';

const AdminProductForm = ({productId, setProductId}) => {
	const [product, setProduct] = useState({});
	const [images, setImages] = useState([]);
	const [shippingMethods, setShippingMethods] = useState([]);
	const [base64Images, setBase64Images] = useState([]);
	const [imageFiles, setImageFiles] = useState([]);
	const inputRef = useRef(null);
	const categoryList = ['フィナンシェ', 'ケーキ', 'その他'];

	const handleInputChange = (e) => {
		const name =  e.target.name;
		var value = e.target.value;

		if (e.target.type === 'checkbox') {
			value = Number(e.target.checked);
		}
		setProduct({
			...product,
			[name]: value
		});
	};

	const handleImageChange = (e) => {
		const files = e.target.files;
		if (!files)
			return ;
		const fileArray = Array.from(files);
		fileArray.forEach((file) => {
			const image = {
				id: 0,
				order_of_images: images.length + 1,
				product_id: productId,
				base64Images_idx: base64Images.length,
				imageFiles_idx: imageFiles.length,
				added: true
			}
			setImageFiles([...imageFiles, file]);
			setImages([...images, image]);
			const reader = new FileReader();
			reader.onloadend = () => {
				const base64Image = reader.result;
				if (typeof(base64Image) !== 'string') {
					setBase64Images([...base64Images, {}]);
					return ;
				} else {
					setBase64Images([...base64Images, base64Image]);
				}
			};
			reader.readAsDataURL(file);
			if (inputRef.current) {
				inputRef.current.value = "";
			}
		});
	};

	const handleImageClick = (i) => {
		const imageList = images;

		if (imageList[i].added) {
			base64Images.splice(imageList[i].base64Images_idx, 1);
			imageFiles.splice(imageList[i].imageFiles_idx, 1);
			imageList.splice(i, 1);
		} else {
			imageList[i].deleted = true;
		}
		setImages([...imageList]);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		await axios.post(`/backend/products/${productId}`, {product, images})
			.then(async (res) => {
				const imagesData = res.data.images;
				if (imageFiles.length) {
					const formData = new FormData();
					imageFiles.map((file, i) => {
						const image = imagesData.find((data) => data.imageFiles_idx === i);
						const blob = file.slice(0, file.size, file.type);
						const renamedFile = new File([blob], image.id +'.jpg', {type: file.type});
						formData.append('files[]', renamedFile);
					});
					await axios.post(
						`/backend/upload/products`,
						formData,
						{headers: {'content-type': 'multipart/form-data'}})
						.then((res2) => {
							// console.log(res2.data);
						});
				}
				const imagesData2 = imagesData.filter(image => !image.deleted);
				const newImages = imagesData2.map((image) => {
					return {
						id: image.id,
						product_id: image.product_id,
						order_of_images: image.order_of_images,
						base64Images_idx: image.base64Images_idx
					}
				});
				console.log(res.data.product);
				setProductId(res.data.product.id);
				setImages(newImages);
				setImageFiles([]);
			});
	};

	const handleDelete = async () => {
		if (window.confirm('この商品を削除しますか？')) {
			await deleteProduct(productId);
			setProductId(-1);
		}
	}

	useEffect(() => {
		const newProduct = {
			id: 0,
			name: '',
			description: '',
			price: 0,
			stock: 0,
			category: '',
			shipping_method: 0,
			public_status: 0,
			popular_status: 0
		};	
		const getData = async () => {
			const productData = productId ? await getProduct(productId) : newProduct;
			const imagesData = productId ? await getImages(productId) : [];
			const base64ImagesData = productId ? await getBase64Images(imagesData) : [];
			const shippingMethodsData = await getShippingMethods();
			setProduct(productData);
			setImages(imagesData);
			setBase64Images(base64ImagesData);
			setShippingMethods(shippingMethodsData);
		}
		getData();
	}, [productId]);

	return (
		<div className='p-4'>
			<button onClick={() => setProductId(-1)}>
				&lt; <span className='text-sm hover:underline'>商品一覧に戻る</span>
			</button>

			<form onSubmit={handleSubmit}>
				<p className='my-6 font-mono text-xl font-bold'>商品追加・編集</p>
				<div className='mt-4'>
					<label>
						商品名
						<span className='text-amber-600'>*</span>
						<span className='text-xs text-stone-400'>（最大100文字）</span>
					</label>
					<input
						onChange={handleInputChange}
						name='name'
						type='text'
						maxLength={100}
						className='w-full p-2 border rounded invalid:border-amber-600'
						value={product.name}
						required />
				</div>
				<div className='mt-4'>
					<label>商品写真</label>
					<div className='p-10 flex bg-stone-100 rounded'>
						{images.length ? images.map((image, i) => {return !image.deleted ? (
							<img
								src={imageSrc(base64Images[image.base64Images_idx])}
								onClick={() => handleImageClick(i)}
								key={i}
								alt='商品画像'
								className='w-24 mr-4 aspect-square object-contain bg-white rounded hover:opacity-50'/>
						):''}):''}
						<input
							onChange={handleImageChange}
							type='file'
							accept="image/jpeg, image/png"
							ref={inputRef}
							className='w-24 h-24 bg-white rounded' />
					</div>
				</div>
				<div className='mt-4'>
					<label>
						商品説明
						<span className='text-amber-600'>*</span>
						<span className='text-xs text-stone-400'>（最大2000文字）</span>
					</label>
					<textarea
						onChange={handleInputChange}
						name='description'
						maxLength={2000}
						className='w-full h-96 p-2 border rounded invalid:border-amber-600'
						value={product.description}
						required />
				</div>
				<div className='mt-4 flex items-center'>
					<label className='mr-2 w-1/2'>価格<span className='text-amber-600'>*</span></label>
					<input
						onChange={handleInputChange}
						name='price'
						type='number'
						min={1}
						className='p-2 w-1/2 border rounded invalid:border-amber-600'
						value={product.price}
						required />
				</div>
				<div className='mt-4 flex items-center'>
					<label className='mr-2 w-1/2'>在庫<span className='text-amber-600'>*</span></label>
					<input
						onChange={handleInputChange}
						name='stock'
						type='number'
						min={0}
						className='p-2 w-1/2 border rounded invalid:border-amber-600'
						value={product.stock}
						required />
				</div>
				<div className='mt-4 flex items-center'>
					<label className='mr-2 w-1/2'>カテゴリー<span className='text-amber-600'>*</span></label>
					<select
						onChange={handleInputChange}
						name='category'
						className='p-2 w-1/2 h-10 border rounded invalid:border-amber-600'
						value={product.category ? product.category : ''}
						required>
						<option value=''>選択してください</option>
						{ categoryList.map((c, i) => {
							return <option key={i} value={c}>{c}</option>
						})}
					</select>
				</div>
				<div className='mt-4 flex items-center'>
					<label className='mr-2 w-1/2'>配送方法<span className='text-amber-600'>*</span></label>
					<select
						onChange={handleInputChange}
						name='shipping_method'
						className='p-2 w-1/2 h-10 border rounded invalid:border-amber-600'
						value={product.shipping_method ? product.shipping_method : ''}
						required>
						<option value=''>選択してください</option>
						{ shippingMethods.length ? shippingMethods.map((s, i) => {
							return <option key={i} value={s.id}>{s.name}</option>
						}) : ''}
					</select>
				</div>
				<div className='mt-4 flex items-center'>
					<label className='mr-2 w-1/2'>公開（優先度）</label>
					<input
						onChange={handleInputChange}
						name='public_status'
						type='checkbox'
						value={Number(product.public_status)}
						className='w-4 h-4 mr-2 checked:bg-amber-600'
						checked={product.public_status} />
					<input
						onChange={handleInputChange}
						name='public_status'
						type='number'
						min={1}
						className='p-2 border rounded disabled:text-stone-300 invalid:border-amber-600'
						value={product.public_status ? product.public_status : ''}
						disabled={!product.public_status}
						required />
				</div>
				<div className='mt-4 flex items-center'>
					<label className='mr-2 w-1/2'>人気商品</label>
					<input
						onChange={handleInputChange}
						name='popular_status'
						type='checkbox'
						value={Number(product.popular_status)}
						className='w-4 h-4 text-amber-600 bg-stone-100 border-stone-300 rounded focus:ring-amber-500 focus:ring-2 before:text-amber-200'
						checked={product.popular_status} />
				</div>
				<div className='px-40 my-16 justify-center'>
					<button
						type='submit'
						className='w-full mb-6 p-2 text-center text-white bg-amber-600 hover:bg-amber-500 rounded'>
						保存
					</button>
					<button
						type='button'
						onClick={handleDelete}
						className='w-full p-2 text-center text-white bg-stone-300 hover:bg-stone-400 rounded'>
						この商品を削除する
					</button>
				</div>
			</form>
		</div>
	);
}

export default AdminProductForm;