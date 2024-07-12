import imageCompression from 'browser-image-compression';
import { React, useContext, useEffect, useRef, useState } from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import { Icon } from '../../components';
import { categoryList } from '../../data';
import {
	createProduct,
	deleteProduct,
	getBase64Images,
	getProduct,
	getProductImages,
	getShippingMethods,
	imageSrc,
	updateProduct
} from '../../functions';
import { LoadingContext } from '../../functions/context/LoadingFunc';

const AdminProductForm = ({productId, setProductId}) => {
	const [product, setProduct] = useState({});
	const [images, setImages] = useState([]);
	const [shippingMethods, setShippingMethods] = useState([]);
	const [base64Images, setBase64Images] = useState([]);
	const [imageFiles, setImageFiles] = useState([]);
	const inputRef = useRef(null);
	const { showBoundary } = useErrorBoundary();
	const context = useContext(LoadingContext);

	const handleBackToIndexPage = (e) => {
		e.preventDefault();
		setProductId(-1);
	}

	const handleInputChange = (e) => {
		e.preventDefault();
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
		e.preventDefault();
		const files = e.target.files;
		if (!files)
			return ;
		const fileArray = Array.from(files);
		fileArray.forEach(async (file) => {
			context.setLoading(true);
			// const SIZE_5MB = 1024 * 1024 * 5;
			// if (file.size > SIZE_5MB) {
			// 	window.alert('ファイルサイズが5MBを超えています。');
			// 	return ;
			// }
			const compressedFile = await imageCompression(file, { maxSizeMB: 2 })
				.catch((err) => showBoundary(err));
			const image = {
				id: 0,
				order_of_images: images.length + 1,
				product_id: productId,
				base64Images_idx: base64Images.length,
				imageFiles_idx: imageFiles.length,
				added: true
			}
			setImageFiles([...imageFiles, compressedFile]);
			setImages([...images, image]);
			const reader = new FileReader();
			reader.onload = () => {
				const base64Image = reader.result;
				if (typeof(base64Image) !== 'string') {
					setBase64Images([...base64Images, {}]);
					return ;
				} else {
					setBase64Images([...base64Images, base64Image]);
				}
			};
			reader.readAsDataURL(compressedFile);
			if (inputRef.current) {
				inputRef.current.value = "";
			}
			context.setLoading(false);
		});
	};

	const handleImageClick = (e, i) => {
		e.preventDefault();

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
		context.setLoading(true);
		var res;
		if (productId) {
			try {
				res = await updateProduct({product, images, imageFiles});
			} catch (err) {
				showBoundary(err);
			}
			window.alert('商品を更新しました');
		} else {
			try {
				res = await createProduct({product, images, imageFiles});
			} catch (err) {
				showBoundary(err);
			}
			window.alert('商品を追加しました');
			setProductId(res.product.id);
		}
		const imagesData = res.images.filter((image) => !image.deleted);
		const newImages = imagesData.map((image) => {
			return {
				id: image.id,
				product_id: image.product_id,
				order_of_images: image.order_of_images,
				base64Images_idx: image.base64Images_idx
			}
		});
		setImages(newImages);
		setImageFiles([]);
		context.setLoading(false);
	};

	const handleDelete = async (e) => {
		e.preventDefault();
		context.setLoading(true);
		if (window.confirm('この商品を削除しますか？')) {
			try {
				await deleteProduct(productId);
			} catch (err) {
				showBoundary(err);
			}
			window.alert('商品を削除しました');
			setProductId(-1);
		}
		context.setLoading(false);
	};

	useEffect(() => {
		console.log("[test]AdminProductForm");
		const newProduct = {
			id: 0,
			name: '',
			description: '',
			price: 0,
			stock: 0,
			category: '',
			shipping_method: '',
			public_status: 0,
			popular_status: 0
		};
		const getData = async () => {
			// context.setLoading(true);
			var productData;
			var imagesData;
			var base64ImagesData;
			var shippingMethodsData;
			try {
				productData = productId ? await getProduct(productId) : newProduct;
			} catch (err) {
				showBoundary(err);
			}
			if (!productData) {
				window.alert('商品が存在しません');
				setProductId(-1);
			}
			try {
				imagesData = productId ? await getProductImages(productId) : [];
			} catch (err) {
				showBoundary(err);
			}
			try {
				base64ImagesData = productId ? await getBase64Images(imagesData) : [];
			} catch (err) {
				showBoundary(err);
			}
			try {
				shippingMethodsData = await getShippingMethods();
			} catch (err) {
				showBoundary(err);
			}
			setProduct(productData);
			setImages(imagesData);
			setBase64Images(base64ImagesData);
			setShippingMethods(shippingMethodsData);
			// context.setLoading(false);
		}
		getData();
	}, []);

	return (
		<div className='px-4'>
			<button onClick={handleBackToIndexPage}>
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
							<div className='relative z-0 mr-4 cursor-pointer group'>
								<img
									src={imageSrc(base64Images[image.base64Images_idx])}
									onClick={(e) => handleImageClick(e, i)}
									key={i}
									alt='商品画像'
									className='w-24 aspect-square object-contain bg-white rounded group-hover:opacity-50'/>
								<Icon icon="trash" className='absolute w-10 h-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40' />
							</div>
						):''}):''}
						<label className='w-24 h-24 flex items-center bg-white rounded'>
							<p className='w-full text-stone-500 text-4xl font-bold text-center cursor-pointer'>+</p>
							<input
								onChange={handleImageChange}
								type='file'
								accept="image/jpeg, image/png"
								ref={inputRef}
								className='hidden' />
						</label>
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
						{categoryList.map((c, i) => {
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
						value={product.shipping_method}
						required>
						<option value=''>選択してください</option>
						{shippingMethods.length ? shippingMethods.map((s, i) => {
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
					{productId ?
						<button
							type='button'
							onClick={handleDelete}
							className='w-full p-2 text-center text-white bg-stone-300 hover:bg-stone-400 rounded'>
							この商品を削除する
						</button>
					:''}
				</div>
			</form>
		</div>
	);
}

export default AdminProductForm;