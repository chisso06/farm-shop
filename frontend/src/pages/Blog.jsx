import { React, useContext, useEffect, useState } from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import { useParams } from 'react-router-dom';
import { PopularItems } from '../components';
import {
	getBase64Image,
	getBlog,
	imageSrc
} from '../functions';
import { LoadingContext } from '../functions/context/LoadingFunc';

const Blog = () => {
	const params = useParams();
	const blogId = Number(params.blog_id);
	const [blog, setBlog] = useState({});
	const [base64Image, setBase64Image] = useState('');
	const showBoundary = useErrorBoundary();
	const loading_context = useContext(LoadingContext);

	useEffect(() => {
		const getData = async () => {
			loading_context.setLoading(true);

			var blogData;
			try {
				blogData = await getBlog(blogId);
			} catch (err) {
				showBoundary(err);
				return ;
			}
			if (blogData) {
				var base64ImageData;
				try {
					base64ImageData = await getBase64Image({ table: 'blogs', image_id: blogId });
				} catch (err) {
					showBoundary(err);
					return ;
				}
				setBlog(blogData);
				setBase64Image(base64ImageData);
			} else {
				window.alert('商品が存在しません');
				loading_context.setLoading(false);
				window.location.href = '/blogs';
				return ;
			}

			loading_context.setLoading(false);
		}
		getData();
	}, []);

	return (
		<div className='w-3/4 my-16 mx-auto'>
			<div className='mb-32'>
				<img
					src={imageSrc(base64Image)}
					alt='商品画像'
					className='mt-32 mb-16 aspect-[3/2] object-contain' />
				<p className='mb-2 text-2xl font-bold'>{blog.title}</p>
				<p className='mb-12 text-stone-500 text-sm'>{blog.created_at}</p>
				<p className='whitespace-pre-line'>{blog.content}</p>
			</div>
			<PopularItems />
		</div>
	);
};

export default Blog;
