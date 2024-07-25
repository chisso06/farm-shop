import imageCompression from 'browser-image-compression';
import { React, useContext, useEffect, useRef, useState } from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import { useParams } from 'react-router-dom';
import { Icon } from '../../components';
import {
	createArticle,
	deleteArticle,
	getArticle,
	getBase64Image,
	imageSrc,
	updateArticle,
	validateArticle
} from '../../functions';
import { LoadingContext } from '../../functions/context/LoadingFunc';

const AdminArticle = () => {
	const params = useParams();
	const articleId = Number(params.article_id);
	const [article, setArticle] = useState({
		id: 0,
		title: '',
		content: '',
	});
	const [base64Image, setBase64Image] = useState('');
	const [imageFile, setImageFile] = useState('');
	const inputRef = useRef(null);
	const { showBoundary } = useErrorBoundary();
	const context = useContext(LoadingContext);

	const handleInputChange = (e) => {
		const name =  e.target.name;
		var value = e.target.value;

		const articleObj = {
			...article,
			[name]: value
		};
		setArticle(articleObj);
	};

	const handleImageChange = async (e) => {
		e.preventDefault();
		context.setLoading(true);

		const file = e.target.files[0];
		if (!file)
			return ;
		// const SIZE_5MB = 1024 * 1024 * 5;
		// if (file.size > SIZE_5MB) {
		// 	window.alert('ファイルサイズが5MBを超えています。');
		// 	return ;
		// }
		const compressedFile = await imageCompression(file, { maxSizeMB: 2 })
			.catch((err) => showBoundary(err));
		setImageFile(compressedFile);
		const reader = new FileReader();
		reader.onload = () => {
			const base64Image = reader.result;
			if (typeof(base64Image) !== 'string') {
				setBase64Image('');
				return ;
			} else {
				setBase64Image(base64Image);
			}
		};
		reader.readAsDataURL(compressedFile);
		if (inputRef.current) {
			inputRef.current.value = "";
		}

		context.setLoading(false);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		context.setLoading(true);

		const validation_message = validateArticle(article);
		if (validation_message) {
			window.alert(validation_message);
			context.setLoading(false);
			return ;
		}

		var res;
		if (articleId) {
			try {
				res = await updateArticle({ article, imageFile });
			} catch (err) {
				showBoundary(err);
				return ;
			}
			window.alert('特集記事を更新しました');
		} else {
			try {
				res = await createArticle({ article, imageFile });
			} catch (err) {
				showBoundary(err);
				return ;
			}
			window.alert('特集記事を追加しました');
			context.setLoading(false);
			window.location.href = `/admin/articles/${res.article.id}`;
			return ;
		}
		setImageFile('');
		context.setLoading(false);
	};

	const handleDelete = async (e) => {
		e.preventDefault();
		context.setLoading(true);
		if (window.confirm('この特集記事を削除しますか？')) {
			try {
				await deleteArticle(articleId);
			} catch (err) {
				showBoundary(err);
				return ;
			}
			window.alert('特集記事を削除しました');
			window.location.href = '/admin/articles';
		}
		context.setLoading(false);
	};

	useEffect(() => {
		const getArticleData = async () => {
			context.setLoading(true);
			var articleData;
			var base64ImageData;
			try {
				articleData = await getArticle(articleId);
			} catch (err) {
				showBoundary(err);
				return ;
			}
			if (!articleData) {
				window.alert('特集記事が存在しません');
				context.setLoading(false);
				window.location.href = '/admin/articles';
				return ;
			}
			try {
				base64ImageData = await getBase64Image({ table: 'articles', image_id: articleId });
			} catch (err) {
				showBoundary(err);
				return ;
			}
			setArticle(articleData);
			setBase64Image(base64ImageData);
			context.setLoading(false);
		}
		if (articleId)
			getArticleData();
	}, []);

	return (
		<div className='px-4'>
			<a href='/admin/articles'>
				&lt; <span className='text-sm hover:underline'>特集記事一覧に戻る</span>
			</a>

			<form onSubmit={handleSubmit}>
				<p className='my-6 font-mono text-xl font-bold'>特集記事追加・編集</p>
				{/* トップ画像 */}
				<div className='mt-4'>
					<label className='w-1/2 flex items-center cursor-pointer bg-white rounded'>
						{ base64Image ? 
							<div className='relative z-0 group'>
								<img
									src={imageSrc(base64Image)}
									alt='特集記事のトップ画像'
									className='aspect-[3/2] object-contain bg-white rounded group-hover:opacity-50'/>
								<Icon icon="arrow-up-from-bracket" className='absolute w-10 h-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40' />
							</div>
							:
							<div className='w-full aspect-[3/2] flex items-center justify-center bg-stone-100 rounded hover:opacity-50'>
								<Icon icon="arrow-up-from-bracket" className='w-10 h-10 opacity-40' />
							</div>
						}
						<input
							onChange={handleImageChange}
							type='file'
							accept="image/jpeg, image/png"
							ref={inputRef}
							className='hidden' />
					</label>
				</div>
				{/* タイトル */}
				<div className='mt-8'>
					<label>
						タイトル
						<span className='text-amber-600'>*</span>
						<span className='text-xs text-stone-400'>（最大100文字）</span>
					</label>
					<input
						onChange={handleInputChange}
						name='title'
						type='text'
						maxLength={100}
						className='w-full p-2 border rounded invalid:border-amber-600'
						value={article.title}
						required />
				</div>
				{/* 本文 */}
				<div className='mt-4'>
					<label>
						本文
						<span className='text-amber-600'>*</span>
						<span className='text-xs text-stone-400'>（最大10000文字）</span>
					</label>
					<textarea
						onChange={handleInputChange}
						name='content'
						maxLength={10000}
						className='w-full h-96 p-2 border rounded invalid:border-amber-600'
						value={article.content}
						required />
				</div>
				{/* Buttons */}
				<div className='px-40 my-16 justify-center'>
					<button
						type='submit'
						className='w-full mb-6 p-2 text-center text-white bg-amber-600 hover:bg-amber-500 rounded'>
						保存
					</button>
					{articleId ?
						<button
							type='button'
							onClick={handleDelete}
							className='w-full p-2 text-center text-white bg-stone-300 hover:bg-stone-400 rounded'>
							この特集記事を削除する
						</button>
					:''}
				</div>
			</form>
		</div>
	);
}

export default AdminArticle;