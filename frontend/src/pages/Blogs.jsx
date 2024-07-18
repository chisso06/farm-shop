import { React, useContext, useEffect, useState } from 'react';
import { useErrorBoundary } from "react-error-boundary";
import { getBlogs, getIndexBase64Images, imageSrc } from '../functions';
import { LoadingContext } from '../functions/context/LoadingFunc';

const Blogs = () => {
	const [blogs, setBlogs] = useState([]);
	const [base64Images, setBase64Images] = useState([]);
	const { showBoundary } = useErrorBoundary();
	const context = useContext(LoadingContext);

	useEffect(() => {
		const getData = async () => {
			context.setLoading(true);

			var blogsData;
			var base64ImagesData;
			try {
				blogsData = await getBlogs();
			} catch (err) {
				showBoundary(err);
			}
			try {
				base64ImagesData = await getIndexBase64Images({ table: 'blogs', objects: blogsData });
			} catch (err) {
				showBoundary(err);
			}
			setBlogs(blogsData);
			setBase64Images(base64ImagesData);
			context.setLoading(false);
		}
		getData();
	}, []);

	return (
		<div className='my-16'>
			<p className='py-20 sm:py-40 text-center text-2xl sm:text-4xl bg-yellow-600 text-white'>ブログ</p>
			<ul className='w-3/4 mx-auto my-20 grid sm:grid-cols-3 gap-4' >{
				blogs.length ? blogs.map((blog, i) => {
					return (
						<li key={i} className='hover:opacity-60'>
							<a href={'/blogs/' + blog.id} className='aspect-square' >
								<img
									src={imageSrc(base64Images[blog.base64Images_idx])}
									alt='goods'
									className='aspect-video object-cover rounded' />
								<div className='p-2 my-2'>
									<p className='font-bold' >
										{blog.title && blog.title.length <= 14 ? blog.title : blog.title.substring(0, 13) + '…'}
									</p>
									<p className='text-sm font-mono text-stone-400'>{blog.created_at}</p>
								</div>
							</a>
						</li>
					);
				}):''
			}</ul>
		</div>
	);
};

export default Blogs;
