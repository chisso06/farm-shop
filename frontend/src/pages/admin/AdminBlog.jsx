import imageCompression from 'browser-image-compression';
import { React, useContext, useEffect, useRef, useState } from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import { useParams } from 'react-router-dom';
import { Icon } from '../../components';
import {
	createBlog,
	deleteBlog,
	getBase64Image,
	getBlog,
	imageSrc,
	updateBlog,
	validateBlog
} from '../../functions';
import { LoadingContext } from '../../functions/context/LoadingFunc';

const AdminBlog = () => {
	const params = useParams();
	const blogId = Number(params.blog_id);
	const [blog, setBlog] = useState({
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

		const blogObj = {
			...blog,
			[name]: value
		};
		setBlog(blogObj);
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

		const validation_message = validateBlog(blog);
		if (validation_message) {
			window.alert(validation_message);
			context.setLoading(false);
			return ;
		}

		var res;
		if (blogId) {
			try {
				res = await updateBlog({ blog, imageFile });
			} catch (err) {
				showBoundary(err);
				return ;
			}
			window.alert('ブログを更新しました');
		} else {
			try {
				res = await createBlog({ blog, imageFile });
			} catch (err) {
				showBoundary(err);
				return ;
			}
			window.alert('ブログを追加しました');
			context.setLoading(false);
			window.location.href = `/admin/admin-blogs/${res.blog.id}`;
			return ;
		}
		setImageFile('');
		context.setLoading(false);
	};

	const handleDelete = async (e) => {
		e.preventDefault();
		context.setLoading(true);
		if (window.confirm('このブログを削除しますか？')) {
			try {
				await deleteBlog(blogId);
			} catch (err) {
				showBoundary(err);
				return ;
			}
			window.alert('ブログを削除しました');
			window.location.href = '/admin/admin-blogs';
		}
		context.setLoading(false);
	};

	useEffect(() => {
		const getBlogData = async () => {
			context.setLoading(true);
			var blogData;
			var base64ImageData;
			try {
				blogData = await getBlog(blogId);
			} catch (err) {
				showBoundary(err);
				return ;
			}
			if (!blogData) {
				window.alert('ブログが存在しません');
				context.setLoading(false);
				window.location.href = '/admin/admin-blogs';
				return ;
			}
			try {
				base64ImageData = await getBase64Image({ table: 'blogs', image_id: blogId });
			} catch (err) {
				showBoundary(err);
				return ;
			}
			setBlog(blogData);
			setBase64Image(base64ImageData);
			context.setLoading(false);
		}
		if (blogId)
			getBlogData();
	}, []);

	return (
		<div className='px-4'>
			<a href='/admin/admin-blogs'>
				&lt; <span className='text-sm hover:underline'>ブログ一覧に戻る</span>
			</a>

			<form onSubmit={handleSubmit}>
				<p className='my-6 font-mono text-xl font-bold'>ブログ追加・編集</p>
				{/* トップ画像 */}
				<div className='mt-4'>
					<label className='w-1/2 flex items-center cursor-pointer bg-white rounded'>
						{ base64Image ? 
							<div className='relative z-0 group'>
								<img
									src={imageSrc(base64Image)}
									alt='ブログのトップ画像'
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
						value={blog.title}
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
						value={blog.content}
						required />
				</div>
				{/* Buttons */}
				<div className='px-40 my-16 justify-center'>
					<button
						type='submit'
						className='w-full mb-6 p-2 text-center text-white bg-amber-600 hover:bg-amber-500 rounded'>
						保存
					</button>
					{blogId ?
						<button
							type='button'
							onClick={handleDelete}
							className='w-full p-2 text-center text-white bg-stone-300 hover:bg-stone-400 rounded'>
							このブログを削除する
						</button>
					:''}
				</div>
			</form>
		</div>
	);
}

export default AdminBlog;